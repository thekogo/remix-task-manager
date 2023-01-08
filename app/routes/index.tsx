import { Link, useLoaderData } from "@remix-run/react";
import { json, redirect } from "@remix-run/server-runtime";
import logo from "~/images/logo.jpg"

import { useOptionalUser } from "~/utils";

export function loader() {
  const clientId = process.env.CHANNEL_ID;
  const redirectUri = encodeURI(process.env.BASE_URL + "/login");
  const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&state=1111222333&redirect_uri=${redirectUri}&scope=profile`

  return json({lineUrl: url})
}

export default function Index() {
  const { lineUrl } = useLoaderData<typeof loader>();

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="relative px-4 pt-16 pb-8 sm:px-6 sm:pt-24 sm:pb-14 lg:px-8 lg:pb-20 lg:pt-32">
              <img src={logo} className="max-w-sm mx-auto rounded-xl mb-8" />
              <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl">
                <span className="block uppercase text-purple-500 drop-shadow-md">PEA Task Manager</span>
              </h1>
              <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
                <a
                  href={lineUrl}
                  className="flex items-center justify-center rounded-md bg-green-500 px-4 py-3 font-medium text-white hover:bg-blue-600"
                >
                  Log In Line
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
