import { Message, TemplateMessage } from "@line/bot-sdk";
import { prisma, Task, TaskStatus } from "@prisma/client";
import client, { ActionType } from "~/line.server";
import { getUnfinishedTaskByDate } from "~/models/task.server";
import { displayDateTH } from "~/utils/date";
import _ from "lodash"

export default async function sendAlertTask({date}: {date: Date}) {
  const unfinishedTask = await getUnfinishedTaskByDate({date: date})
  const groupByUser = _.groupBy(unfinishedTask, 'worker.user.lineId')
  for (const lineId in groupByUser) {
    const tasks = groupByUser[lineId]
    let messages: Message[] = [];
    tasks.forEach(task => {
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
    const chunkedMessages = _.chunk(messages, 5);
    chunkedMessages.forEach(async (lineMessage) => {
      await client.pushMessage(lineId, lineMessage)
    })
  }
}

export function buildMessageStatusCreate(task: Task): TemplateMessage {
  let title = task.title;
  let desc = task.description || '';
  if(desc.length > 10) {
    desc = desc.substring(0, 10) + '...'
  }
  if(title.length > 30) {
    title = title.substring(0, 30) + '...'
  }

  const message: TemplateMessage = {
    type: "template",
    altText: "แจ้งเตือนงานค้าง",
    template: {
      type: "buttons",
      actions: [
        {
          type: "postback",
          data: `action=${ActionType.Acknowledge}&taskId=${task.id}`,
          label: "รับทราบ",
          text: `รับทราบ`
        },
        {
          type: "postback",
          data: `action=${ActionType.Acknowledge}&taskId=${task.id}`,
          label: "อัพเดทความคืบหน้า",
          inputOption: "openKeyboard",
          fillInText: `อัพเดทความคืบหน้า #${task.id}\nรายละเอียด: `
        }
      ],
      title: `${task.title}`,
      text: 'กำหนดส่งงาน: ' + displayDateTH(task.deadLineDate)
    }
  }
  return message;
}

export function buildMessageStatusDoing(task: Task): TemplateMessage {
  let title = task.title;
  let desc = task.description || '';
  if(desc.length > 10) {
    desc = desc.substring(0, 10) + '...'
  }
  if(title.length > 30) {
    title = title.substring(0, 30) + '...'
  }

  const message: TemplateMessage = {
    type: "template",
    altText: "แจ้งเตือนงานค้าง",
    template: {
      type: "buttons",
      actions: [
        {
          type: "postback",
          data: `action=${ActionType.Complete}&taskId=${task.id}`,
          label: "เสร็จสิ้น",
          text: `เสร็จสิ้น`
        },
        {
          type: "postback",
          data: `action=${ActionType.Acknowledge}&taskId=${task.id}`,
          label: "อัพเดทความคืบหน้า",
          inputOption: "openKeyboard",
          fillInText: `อัพเดทความคืบหน้า #${task.id}\nรายละเอียด: `
        }
      ],
      title: `${task.title}`,
      text: 'กำหนดส่งงาน: ' + displayDateTH(task.deadLineDate)
    }
  }
  return message;
}
