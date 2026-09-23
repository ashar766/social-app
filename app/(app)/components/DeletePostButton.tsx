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
      className="rounded bg-red-500 px-4 py-2 text-sm text-white"
    >
      Delete
    </button>
  );
}
