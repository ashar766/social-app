"use client";

import { useActionState } from "react";
import { createPost } from "./action";

const initialState = {
  error: "",
};

export default function CreatePostPage() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Create Post</h1>

      <form action={formAction} className="space-y-4">
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full rounded border p-3"
        />

        <textarea
          name="caption"
          placeholder="Write a caption..."
          className="w-full rounded border p-3"
          rows={4}
        />

        <input
          name="category"
          type="text"
          placeholder="Category"
          className="w-full rounded border p-3"
        />

        {state.error && <p className="text-sm text-red-500">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Post"}
        </button>
      </form>
    </main>
  );
}
