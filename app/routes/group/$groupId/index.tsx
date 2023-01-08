import { useLoaderData } from "@remix-run/react";
import { json, LoaderArgs, redirect } from "@remix-run/server-runtime";
import { Card } from "flowbite-react";
import { getGroupMemberByGroupId } from "~/models/group.server";
import { requireGroupMember } from "~/session.server";
import Nav from "~/shared/components/Nav";

export async function loader({request, params}: LoaderArgs) {
  const groupId = parseInt(params.groupId || "")
  if (isNaN(groupId)) {
    throw redirect ("/group");
  }
  const groupMember = await requireGroupMember(request, groupId)
  const groupMembers =  await getGroupMemberByGroupId({groupId});
  return json({groupMembers: groupMembers, code: groupMember.group.code});
}

export default function GroupId() {
  const { groupMembers, code } = useLoaderData<typeof loader>()
  return (
    <div>
      <Nav />
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-12 grid-cols-3 gap-4">
          <div className="col-span-3">
            <Card>
              <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                รหัสสำหรับเข้าร่วม
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                {code}
              </p>
            </Card>
          </div>
          <div className="col-span-3 lg:col-span-9">
            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
                  สมาชิก
                </h5>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  จัดการสมาชิก
                </a>
              </div>
              <div className="flow-root">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {groupMembers.map(member => (
                    <li className="py-3 sm:py-4">
                      <div className="flex items-center space-x-4">
                        <div className="shrink-0">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={member.user.pictureUrl}
                            alt="Neil image"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {member.user.firstName} {member.user.lastName}
                          </p>
                          <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                            {member.user.displayName}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                          {member.position}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
