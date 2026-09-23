"use client";

import { useState } from "react";
import { updatePost } from "../post/[id]/edit-action";

type EditPostFormProps = {
  postId: string;
  initialCaption: string;
  initialCategory: string;
};

export default function EditPostForm({
  postId,
  initialCaption,
  initialCategory,
}: EditPostFormProps) {
  const [caption, setCaption] = useState(initialCaption);
  const [category, setCategory] = useState(initialCategory);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setPending(true);

    const result = await updatePost(postId, caption, category);

    setPending(false);

    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block font-medium">Caption</label>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full rounded border p-3"
          rows={4}
          placeholder="Write a caption..."
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Category</label>

        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border p-3"
          placeholder="Category"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
