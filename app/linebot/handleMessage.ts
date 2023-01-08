import { Message, MessageEvent, TemplateMessage, TextMessage, WebhookEvent } from "@line/bot-sdk";
import { Comment, User } from "@prisma/client";
import client, { ActionType } from "~/line.server";
import { createComment } from "~/models/comment.server";
import { getGroupByCode, Group, joinGroup } from "~/models/group.server";
import { getUserOrCreateByLineProfile } from "~/models/user.server";

export default async function handleMessage(event: MessageEvent) {
  const { replyToken } = event;
  // @ts-ignore
  const message: string = event.message.text.trim().toLowerCase();
  let responseMessage: Message;

  if (event.message.type !== "text" || event.message.text === "รับทราบ" || event.message.text === "เสร็จสิ้น") {
    return;
  }

  if (message === "help") {
    responseMessage = buildHelpMessage();
  } else if (message.startsWith("กรอกรหัสเข้าร่วมกลุ่ม: ")) {
    const code = message.substring("กรอกรหัสเข้าร่วมกลุ่ม:".length).trim();
    responseMessage = await buildJoinGroupMessage({code: code, lineId: event.source.userId})
  } else if (message.startsWith("อัพเดทความคืบหน้า #")) {
    const taskId = Number(message.substring("อัพเดทความคืบหน้า #".length, message.indexOf("\nรายละเอียด:")))
    const comment = message.substring(message.indexOf("\nรายละเอียด:") + "\nรายละเอียด:".length).trim()
    responseMessage = await buildUpdateCommentMessage({taskId: taskId, lineId: event.source.userId, message: comment}) 
  }
  else {
    responseMessage = buildHelpMessage();
  }

  if (responseMessage) {
    try {
      await client.replyMessage(replyToken, responseMessage)
    } catch(e) {
      console.log(e.originalError.response.data)
    }
  }
}

function buildHelpMessage(): TemplateMessage {
  const templateMessage: TemplateMessage = {
    type: "template",
    altText: "การช่วยเหลือ",
    template: {
      text: "การช่วยเหลือ",
      type: "buttons",
      actions: [
        {
          "type": "postback",
          "label": "เข้าร่วมกลุ่ม",
          "data": `action=joinGroup`,
          "inputOption": "openKeyboard",
          "fillInText": "กรอกรหัสเข้าร่วมกลุ่ม: "
        },
        {
          "type": "postback",
          "label": "งานที่ยังไม่แล้วเสร็จ",
          "displayText": "งานที่ยังไม่แล้วเสร็จ",
          "data": `action=${ActionType.UnfinishedTask}`,
        }
      ]
    }
  }

  return templateMessage;
}

async function buildJoinGroupMessage({code, lineId}: {
  code: Group["code"];
  lineId?: User["lineId"];
}): Promise<TextMessage> {
  if (!lineId) {
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในระบบ" 
    }
  }

  const group = await getGroupByCode({code: code});
  if (!group) {
    return {
      type: "text",
      text: `ไม่พบกลุ่มในระบบ` 
    }
  }

  const lineProfile = await client.getProfile(lineId);
  const user = await getUserOrCreateByLineProfile(lineProfile);

  const groupMember = await joinGroup({groupId: group.id, userId: user.id})
  return {
    type: "text",
    text: `เข้าร่วมกลุ่ม ${group.name} เสร็จสิ้น`
  }
}

async function buildUpdateCommentMessage({taskId, lineId, message}: {
  taskId: Comment["taskId"];
  lineId?: User["lineId"];
  message: Comment["message"];
}): Promise<TextMessage> {
  if (!lineId) {
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในระบบ" 
    }
  }
  try {
    const lineProfile = await client.getProfile(lineId);
    const user = await getUserOrCreateByLineProfile(lineProfile);
    const comment = await createComment({taskId: taskId, userId: user.id, message: message});
    return {
      type: "text",
      text: "บันทึกรายละเอียดเสร็จสิ้น"
    }
  } catch(e) {
    return {
      type: "text",
      text: "เกิดข้อผิดพลาดในระบบ"
    }
  }
}
