import { Message, WebhookEvent } from "@line/bot-sdk";
import { TaskStatus } from "@prisma/client";
import client, { ActionType } from "~/line.server";
import { getTaskById, getUnfinishedTaskByLineId, updateStatusById } from "~/models/task.server";
import { parseQuery } from "~/utils/line";
import { buildMessageStatusCreate, buildMessageStatusDoing } from "./sendAlertTask";
import _ from "lodash"; 
import { displayDateTH } from "~/utils/date";

export default async function handlePostback(event: WebhookEvent) {
  // @ts-ignore
  const data = event.postback.data;
  const postback = parseQuery(data);
  if (postback.taskId) {
    const task = await getTaskById({taskId: postback.taskId})
    switch (postback.action) {
      case ActionType.Acknowledge:
        if (task?.status === TaskStatus.CREATED) {
          await updateStatusById({
            taskId: postback.taskId,
            status: TaskStatus.DOING
          })
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `จะมีการแจ้งเตือนอีกครั้งเวลา ${displayDateTH(task.alertDate)}`
          })
        }
        break;
      case ActionType.Complete:
        if (task?.status === TaskStatus.DOING) {
          await updateStatusById({
            taskId: postback.taskId,
            status: TaskStatus.DONE
          })
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "OK จะตรวจสอบผลการปฎิบัติงานอีกครั้ง"
          })
        }
        break;
    }
  }
  switch (postback.action) {
    case ActionType.UnfinishedTask:
      try {
        await replyUnfinishedTask(event);
      } catch (e) {
        console.log(e.originalError.response.data)
      }
      break;

    default:
      break;
  }
}

async function replyUnfinishedTask(event: WebhookEvent) {
  // @ts-ignore
  const { replyToken } = event;
  const lineId = event.source.userId;
  if (!lineId) {
    return;
  }
  const unfinishedTask = await getUnfinishedTaskByLineId({lineId: lineId});
  const firstFiveTask = unfinishedTask.length > 5 ? _.chunk(unfinishedTask, 5)[0] : unfinishedTask;
  console.log(firstFiveTask)
  let messages: Message[] = []
  firstFiveTask.forEach(task => {
    switch (task.status) {
      case TaskStatus.CREATED:
        messages.push(buildMessageStatusCreate(task)); 
        break;

      case TaskStatus.DOING:
        messages.push(buildMessageStatusDoing(task))
        break;
      default:
        break;
    }
  })

  await client.replyMessage(replyToken, messages);
}
