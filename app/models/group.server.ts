import { User, Group, Role, GroupMember } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Group } from "@prisma/client";

export function getGroupsByUserId({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { 
      members: {
        some: {
          userId: userId
        }
      }
    }
  });
}

export async function createGroup({userId, name, code}: {
  userId: User["id"];
  name: Group["name"];
  code: Group["code"];
}) {
  const group = await prisma.group.create({
    data: {
      name: name,
      code: code
    }
  })

  const groupMember = await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: userId,
      role: Role.MANAGER
    }
  })
  return groupMember;
}

export async function getGroupMember({userId, groupId}: {
  userId: User["id"],
  groupId: GroupMember["groupId"]
}) {
  const groupMember = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: userId,
        groupId: groupId
      }
    },
    include: {
      group: true,
      user: true
    }
  })
  
  return groupMember;
}

export async function getGroupMemberByGroupId({groupId}: {groupId: GroupMember["groupId"]}) {
  return await prisma.groupMember.findMany({
    where: {
      groupId: groupId
    },
    include: {
      user: true
    }
  })
}

export async function getGroupByCode({code}: {code: Group["code"]}) {
  return await prisma.group.findUnique({
    where: {
      code: code
    }
  })
}

export async function joinGroup({groupId, userId}: {
  groupId: GroupMember["groupId"];
  userId: GroupMember["userId"];
}) {
  return prisma.groupMember.upsert({
    where: {
      userId_groupId: {
        userId: userId,
        groupId: groupId
      }
    },
    update: {},
    create: {
      userId: userId,
      groupId: groupId,
      role: Role.MEMBER
    }
  })
}
