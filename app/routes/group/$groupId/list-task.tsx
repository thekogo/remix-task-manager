import { TaskStatus } from "@prisma/client";
import { json, LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Button, Table } from "flowbite-react";
import { getTaskByGroupId } from "~/models/task.server";
import { requireGroupMember } from "~/session.server";
import Nav from "~/shared/components/Nav";
import { displayDateTH } from "~/utils/date";

export async function loader({request, params}: LoaderArgs) {
  const groupId = parseInt(params.groupId || "")
  if (isNaN(groupId)) {
    throw redirect ("/group");
  }
  await requireGroupMember(request, groupId)
  const tasks =  await getTaskByGroupId({groupId});
  return json({tasks: tasks});
}

function displayStatus(status: string): string {
  switch (status) {
    case TaskStatus.CREATED: return "ยังไม่รับทราบ" 
    case TaskStatus.DOING: return "รับทราบแล้ว กำลังดำเนินการ"
    case TaskStatus.DONE: return "เสร็จเรียบร้อย"

    default: return "-"
  }
}

export default function ListTask() {
  const { tasks } = useLoaderData<typeof loader>();

  return (
    <div>
      <Nav />
      <div className="container mx-auto">
        <h3>รายการงาน</h3>
        <Table hoverable={true} striped={true}>
          <Table.Head>
            <Table.HeadCell>
              ID
            </Table.HeadCell>
            <Table.HeadCell>
              หัวข้อ
            </Table.HeadCell>
            <Table.HeadCell>
              สถานะ
            </Table.HeadCell>
            <Table.HeadCell>
              กำหนดส่ง
            </Table.HeadCell>
            <Table.HeadCell>
              จัดการ
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {tasks.map(task => (
              <Table.Row>
                <Table.Cell>
                  {task.id}
                </Table.Cell>
                <Table.Cell>
                  {task.title}
                </Table.Cell>
                <Table.Cell>
                  {displayStatus(task.status)}
                </Table.Cell>
                <Table.Cell>
                  {displayDateTH(task.deadLineDate)}
                </Table.Cell>
                <Table.Cell className="grid lg:grid-cols-3 grid-cols-1 justify-center gap-2 items-center">
                  <a href={`/group/${task.groupMemberGroupId}/task/${task.id}`} className="w-full">
                    <Button size="sm" className="h-full w-full">ดูรายละเอียด</Button>
                  </a>
                  <Button size="sm" color="warning" className="h-full">แก้ไข</Button>
                  <Button size="sm" color="failure" className="h-full">ลบ</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <br />
    </div>
  )
}
