import { WebhookEvent } from "@line/bot-sdk";
import { ActionArgs, json, LoaderArgs } from "@remix-run/node";
import handleMessage from "~/linebot/handleMessage";
import handlePostback from "~/linebot/handlePostback";

async function taskEventHandler(event: WebhookEvent) {
  switch (event.type) {
    case "message": return await handleMessage(event);
    case "postback": return await handlePostback(event);
  }
}

export async function action({request}: ActionArgs) {
  const reqJson = await request.json();
  const events: WebhookEvent[] = reqJson.events;
  const results = await Promise.all(
    events.map(async (event: WebhookEvent) => {
      try {
        await taskEventHandler(event);
      } catch(e) {
        // console.error(e)
      }
    })
  );
  return json({
    status: 'success',
    results,
  });
}

export async function loader({request}: LoaderArgs) {
  return null;
}


export default function Webhook() {
  return (
    <div></div>
  )
}
