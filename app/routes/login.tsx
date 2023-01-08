import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";
import { getUserOrCreateByLineProfile, LineProfile } from "~/models/user.server";

import { createUserSession, getUserId } from "~/session.server";

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return redirect("/");
  }

  try {
    const accessToken = await loginWithCode(code);
    const lineProfile = await getLineProfile(accessToken);
    const user = await getUserOrCreateByLineProfile(lineProfile);
    return await createUserSession({
      request: request,
      userId: user.id,
      redirectTo: "/group"
    })
  } catch (e) {
    return redirect("/");
  }
}

async function loginWithCode(code: string): Promise<string> {
  const lineAccessTokenURL = "https://api.line.me/oauth2/v2.1/token";
  const clientId = process.env.CHANNEL_ID || "";
  const clientSecret =  process.env.LOGIN_CHANNEL_SECRET || "";
  const redirectUri = encodeURI(process.env.BASE_URL + "/login");
  const payload = JSON.stringify({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  })
  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "authorization_code");
  urlencoded.append("code", code);
  urlencoded.append("client_id", clientId);
  urlencoded.append("client_secret", clientSecret);
  urlencoded.append("redirect_uri", redirectUri);

  const response = await fetch(lineAccessTokenURL, {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    body: urlencoded
  })
  const json: {access_token: string} = await response.json();
  const accessToken = json.access_token;
  return accessToken;
}

async function getLineProfile(accessToken: string): Promise<LineProfile> {
  const response = await fetch("https://api.line.me/v2/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  return await response.json();
}

export async function action({ request }: ActionArgs) {
  console.log("request", request);
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  };
};

