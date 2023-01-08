import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { Card, Label, TextInput, Timeline } from "flowbite-react";
import { getCommentByTaskId } from "~/models/comment.server";
import { getTaskById } from "~/models/task.server";
import { requireGroupMember } from "~/session.server";
import Nav from "~/shared/components/Nav";
import { displayDateTH } from "~/utils/date";

export async function loader({request, params}: LoaderArgs) {
  const groupId = parseInt(params.groupId || "")
  if (isNaN(groupId)) {
    throw redirect ("/group");
  }
  await requireGroupMember(request, groupId)

  const taskId = parseInt(params.taskId || "")
  if (isNaN(taskId)) {
    throw redirect (`/group/${groupId}/list-task`);
  }

  const task = await getTaskById({taskId: taskId});
  if (!task) {
    throw redirect (`/group/${groupId}/list-task`);
  }

  const comments = await getCommentByTaskId({taskId: taskId});
  console.log(comments)
  return json({task: task, comments: comments})
}

export default function ViewTask() {
  const { task, comments } = useLoaderData<typeof loader>();
  return (
    <div>
      <Nav />
      <div className="container mx-auto flex flex-col gap-4">
        <Card>
          <h3 className="text-xl bold">รายละเอียดงาน</h3>
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
              value={task.title}
              disabled={true}
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
              value={task.description || ""}
              disabled={true}
              />
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="workerId"
                value="ผู้รอบมอบหมาย"
                />
            </div>
            <TextInput
              id="workerId"
              name="workerId"
              type="text"
              sizing="lg"
              value={`${task.worker.user.firstName || ""} ${task.worker.user.lastName || ""}`}
              disabled={true}
              />
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
              type="text"
              value={displayDateTH(task.alertDate)}
              disabled={true}
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
              type="text"
              value={displayDateTH(task.deadLineDate)}
              disabled={true}
              />
          </div>
        </Card>
        <Card>
          <h3 className="text-xl">การตอบกลับ</h3>
          <Timeline>
            {comments.map(comment => (
              <Timeline.Item>
                <Timeline.Point />
                <Timeline.Content>
                  <Timeline.Time>
                    {displayDateTH(comment.createdAt)}
                  </Timeline.Time>
                  <Timeline.Body>
                    {comment.message}
                  </Timeline.Body>
                </Timeline.Content>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
    </div>
  )
}
