
"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "./action";
import Image from "next/image";

const initialState = {
  error: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-2xl font-bold text-white dark:bg-white dark:text-black">
            S
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Join your community and start sharing.
          </p>
        </div>

        <form
          action={formAction}
          className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-8"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-semibold">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              autoComplete="name"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-neutral-700"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 dark:border-neutral-700 dark:bg-neutral-800 dark:focus:ring-neutral-700"
            />
          </div>

          {state.error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300"
            >
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gray-900 px-4 py-3 !font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {pending ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-gray-900 hover:underline dark:text-white"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </main >
  );
}
