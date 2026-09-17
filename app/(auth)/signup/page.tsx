"use client";

import { useActionState } from "react";
import { signup } from "./action";

const initialState = {
  error: "",
};

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold">Create Account</h1>

        <form action={formAction} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            className="w-full rounded border p-3"
          />

          <input
            name="username"
            type="text"
            placeholder="Username"
            className="w-full rounded border p-3"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full rounded border p-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full rounded border p-3"
          />

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
          >
            {pending ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}
