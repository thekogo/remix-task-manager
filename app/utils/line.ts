import { PostbackData } from "~/line.server";

// @ts-ignore
export function parseQuery(query:string): PostbackData {
  const params = {};
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    params[pair[0]] = Number(decodeURIComponent(pair[1])) || decodeURIComponent(pair[1]);
  }
  return params;
}


