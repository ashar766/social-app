"use client";

import { deletePost } from "../post/[id]/post-action";

type DeletePostButtonProps = {
  postId: string;
};

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this post?");

    if (!confirmed) {
      return;
    }

    await deletePost(postId);
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-xl border border-gray-200 px-3 py-2 text-sm !font-semibold transition hover:bg-gray-500 dark:border-neutral-700 dark:hover:bg-neutral-800 bg-red-500 text-white"
    >
      Delete
    </button>
  );
}
