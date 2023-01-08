import { LoaderArgs } from "@remix-run/server-runtime";
import sendAlertTask from "~/linebot/sendAlertTask";

export async function loader({request}: LoaderArgs) {
  let currentDate = new Date();
  currentDate.setSeconds(0,0)
  await sendAlertTask({date: new Date(currentDate.toISOString())}) 
  return null;
} 

export default function AlertTaskLine() {
  return <div></div>
}
