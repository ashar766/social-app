"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addComment } from "../post/[id]/action";

type CommentFormProps = {
  postId: string;
};

export default function CommentForm({ postId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    setPending(true);

    const result = await addComment(postId, content);

    setPending(false);

    if (!result?.error) {
      setContent("");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 rounded-xl border border-gray-200 p-2 focus:outline-none dark:border-neutral-700"
      />

      <button
        type="submit"
        disabled={pending || !content.trim()}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm bg-black text-white !font-semibold transition hover:bg-gray-500 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        {pending ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
