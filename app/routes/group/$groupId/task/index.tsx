import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { Button, Card, Label, Select, TextInput } from "flowbite-react";
import { getGroupMemberByGroupId } from "~/models/group.server";
import { createTask } from "~/models/task.server";
import { requireGroupMember } from "~/session.server";
import Nav from "~/shared/components/Nav";
import { ValidatedForm, validationError } from "remix-validated-form";
import sendNotifyNewTask from "~/linebot/sendNotifyNewTask";
import { getUserById } from "~/models/user.server";

const validator = withZod(
  z.object({
    title: z
      .string()
      .min(1, { message: "กรุณากรอกหัวข้อ"}),
    description: z
      .string()
      .optional(),
    userId: z
      .number()
      .or(z.string().regex(/\d+/).transform(Number)),
    alertDate: z
      .string().transform(str => str === '' ? null: new Date(str))
      .nullish(),
    deadLineDate: z
      .string().transform(str => str === '' ? null: new Date(str))
      .nullish(),
  }) 
)

export async function loader({request, params}: LoaderArgs) {
  const groupId = parseInt(params.groupId || "")
  if (isNaN(groupId)) {
    throw redirect ("/group");
  }
  await requireGroupMember(request, groupId)
  const groupMembers =  await getGroupMemberByGroupId({groupId});
  return json({groupMembers: groupMembers});
}

export async function action({request, params}: ActionArgs) {
  const groupId = parseInt(params.groupId || "")
  if (isNaN(groupId)) {
    throw redirect ("/group");
  }
  const groupMember = await requireGroupMember(request, groupId)
  const body = await request.formData()
  const data = await validator.validate(body);
  if (data.error) return validationError(data.error);
  const { title, description, userId, alertDate, deadLineDate } = data.data;
  const user = await getUserById(userId)
  const task = await createTask({
    title: title,
    description: description,
    userId: userId,
    alertDate: alertDate,
    deadLineDate: deadLineDate,
    groupId: groupId,
  })
  try {
    if (!user?.lineId) {
      return
    }

    await sendNotifyNewTask({task: task, lineId: user?.lineId});
  } catch(e) {
    console.log(e.orignalError.response.data)
  }
  return redirect(`/group/${task.groupMemberGroupId}`) 
}

export default function TaskView() {
  const data = useActionData<typeof action>();
  const { groupMembers } = useLoaderData<typeof loader>();

  return (
    <div>
      <Nav />
      <div className="container mx-auto">
        <div className="grid grid-cols-3 lg:grid-cols-12 gap-4">
          <div className="col-span-3">
            <Card>
              <ValidatedForm validator={validator} className="flex flex-col gap-4" method="post">
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="title"
                      value="หัวข้อ"
                      />
                  </div>
                  <TextInput
                    id="title"
                    name="title"
                    type="text"
                    />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="description"
                      value="รายละเอียด"
                      />
                  </div>
                  <TextInput
                    id="description"
                    name="description"
                    type="text"
                    sizing="lg"
                    />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="workerId"
                      value="ผู้รอบมอบหมาย"
                      />
                  </div>
                  <Select
                    id="userId"
                    name="userId"
                    required={true}
                  >
                    {groupMembers.map(member => (
                      <option value={member.user.id}>
                        {member.user.firstName} {member.user.lastName}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="alertDate"
                      value="เวลาแจ้งเตือน"
                      />
                  </div>
                  <TextInput
                    id="alertDate"
                    name="alertDate"
                    type="datetime-local"
                    />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="deadLineDate"
                      value="กำหนดส่ง"
                      />
                  </div>
                  <TextInput
                    id="deadLineDate"
                    name="deadLineDate"
                    type="datetime-local"
                    />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" color="purple">สร้างงาน</Button>
                </div>
              </ValidatedForm>
            </Card>
          </div>
          <div className="lg:col-span-9 col-span-3">
          </div>
        </div>
      </div>
    </div>
  )
}
