"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-red-500 px-4 !font-semibold tracking-wide text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:text-white-950 dark:hover:bg-red-350 [&_button]:!font-bold [&_button]:text-inherit"
    >
      Logout
    </button>
  );
}
