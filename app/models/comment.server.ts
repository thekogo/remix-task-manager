import { Comment } from "@prisma/client";
import { prisma } from "~/db.server";

export async function createComment({taskId, userId, message}: {
  taskId: Comment["taskId"];
  userId: Comment["userId"];
  message: Comment["message"];
}) {
  return await prisma.comment.create({
    data: {
      taskId: taskId,
      userId: userId,
      message: message
    }
  })
}

export async function getCommentByTaskId({taskId}: {taskId: Comment["taskId"]}) {
  return await prisma.comment.findMany({
    where: {
      taskId: taskId
    },
    include: {
      user: true
    },
  })
}
