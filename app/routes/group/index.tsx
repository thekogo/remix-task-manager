import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { requireUserId } from "~/session.server";
import Nav from '../../shared/components/Nav';
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { createGroup, getGroupByCode, getGroupsByUserId, joinGroup } from "~/models/group.server";

export async function loader({request}: LoaderArgs) {
  const userId = await requireUserId(request);
  const groups = await getGroupsByUserId({userId})
  return json({groups: groups});
}

export async function action({request}: ActionArgs) {
  const body = await request.formData();
  const userId = await requireUserId(request);
  const type = body.get("type");
  const code = body.get("code");
  let groupId = 0;
  if(typeof code !== "string") {
    return null;
  }
  
  if (type === "join") {
    const group = await getGroupByCode({code});
    if (!group) {
      return null;
    }

    await joinGroup({
      groupId: group.id,
      userId: userId
    })
    groupId = group.id;

  } else if (type === "create") {

    const groupName = body.get("groupName");
    if(typeof groupName !== "string") {
      return null;
    }

    const groupMember = await createGroup({
      userId: userId,
      name: groupName,
      code: code,
    });
    groupId = groupMember.groupId;
  }

  return redirect(`/group/${groupId}`);
}

export default function Group() {
  const { groups } = useLoaderData<typeof loader>();
  const [showModalCreateGroup, setShowModalCreateGroup] = useState(false);
  const [showModalJoinGroup, setShowModalJoinGroup] = useState(false);

  const CreateModal = () => (
    <Modal show={showModalCreateGroup} onClose={() => setShowModalCreateGroup(false)}>
      <Modal.Header>
        สร้างกลุ่มใหม่
      </Modal.Header>
      <Modal.Body>
        <Form method="post" className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="groupName"
                value="ชื่อกลุ่ม"
                />
            </div>
            <TextInput
              id="groupName"
              name="groupName"
              placeholder="PEA ..."
              required={true}
              />
          </div>
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="code"
                value="รหัสสำหรับเข้ากลุ่ม"
                />
            </div>
            <TextInput
              id="code"
              name="code"
              placeholder="PEA_XXX"
              required={true}
              />
          </div>
          <input type="text" name="type" value="create" className="hidden" />
          <div className="w-full flex justify-end">
            <Button type="submit">สร้างกลุ่ม</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )

  const JoinModal = () => (
    <Modal show={showModalJoinGroup} onClose={() => setShowModalJoinGroup(false)}>
      <Modal.Header>
        เข้าร่วมกลุ่ม
      </Modal.Header>
      <Modal.Body>
        <Form method="post" className="space-y-6 px-6 pb-4 sm:pb-6 lg:px-8 xl:pb-8">
          <div>
            <div className="mb-2 block">
              <Label
                htmlFor="code"
                value="รหัสเข้าร่วมกลุ่ม"
                />
            </div>
            <TextInput
              id="code"
              name="code"
              placeholder="PEA ..."
              required={true}
              />
          </div>
          <input type="text" name="type" value="join" className="hidden" />
          <div className="w-full flex justify-end">
            <Button type="submit">เข้าร่วมกลุ่ม</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )

  return (
    <div>
      <CreateModal />
      <JoinModal />
      <Nav />
      <div className="container mx-auto">
        <div className="flex justify-between mb-2">
          <h3 className="text-xl">จัดการกลุ่ม</h3>
          <div className="flex gap-2">
            <Button outline={true} size="sm" onClick={() => setShowModalJoinGroup(true)}>เข้าร่วมกลุ่ม</Button>
            <Button color="purple" outline={true} size="sm" onClick={() => setShowModalCreateGroup(true)}>+ สร้างกลุ่ม</Button>
          </div>
        </div>
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
          <Table>
            <Table.Head>
              <Table.HeadCell>
                ชื่อกลุ่ม
              </Table.HeadCell>
              <Table.HeadCell>
                จัดการ
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="devide-y">
              {groups.map(group => (
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {group.name}
                  </Table.Cell>
                  <Table.Cell>
                    <Link to={`/group/${group.id}`} className="font-medium text-blue-600 hover:underline dark:text-blue-500">View</Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>

    </div>
  )
}
