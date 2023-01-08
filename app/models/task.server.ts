import { Task, TaskStatus, User } from "@prisma/client";
import { prisma } from "~/db.server";

export type { Task } from "@prisma/client";

export async function createTask({title, description, alertDate, deadLineDate, userId, groupId}: {
  title: Task["title"];
  description?: Task["description"];
  alertDate?: Task["alertDate"];
  deadLineDate?: Task["deadLineDate"];
  userId: Task["groupMemberUserId"];
  groupId: Task["groupMemberGroupId"];
}) {
  const task = await prisma.task.create({
    data: {
      title: title,
      description: description,
      alertDate: alertDate,
      deadLineDate: deadLineDate,
      groupMemberUserId: userId,
      groupMemberGroupId: groupId,
      status: TaskStatus.CREATED,
    }
  })

  return task;
}

export async function getTaskByGroupId({groupId}: {groupId: Task["groupMemberGroupId"]}) {
  return await prisma.task.findMany({
    where: {
      groupMemberGroupId: groupId
    },
    orderBy: {
      id: 'desc'
    }
  })
}

export async function getTaskById({taskId}: {taskId: Task["id"]}) {
  return await prisma.task.findUnique({
    where: {
      id: taskId
    },
    include: {
      worker: {
        include: {
          user: true
        } 
      }
    }
  })
}

export async function updateStatusById({taskId, status}: {
  taskId: Task["id"];
  status: Task["status"];
}) {
  return await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      status: status,
    },
  })
}

export async function getUnfinishedTaskByDate({date}: {
  date: Task["alertDate"]
}) {
  if (date === null) {
    return []
  }
  return await prisma.task.findMany({
    where: {
      OR: [
        {
          status: TaskStatus.CREATED
        },
        {
          status: TaskStatus.DOING
        }
      ],
      alertDate: date    
    },
    include: {
      worker: {
        include: {
          user: true
        }
      }
    }
  })
}

export async function getUnfinishedTaskByLineId({lineId}: {
  lineId: User["lineId"];
}) {
  return await prisma.task.findMany({
    where: {
      OR: [
        {
          status: TaskStatus.CREATED
        },
        {
          status: TaskStatus.DOING
        }
      ],
      worker: {
        user: {
          lineId: lineId
        } 
      }
    },
    orderBy: {
      deadLineDate: 'asc'
    }
  })
}
