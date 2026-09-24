"use client";

import { useState } from "react";
import { editComment, deleteComment } from "../post/[id]/action";

type CommentItemProps = {
  comment: {
    id: string;
    content: string;
    userId: string;
    user: {
      username: string;
    };
  };
  currentUserId: string;
  postAuthorId: string;
};

export default function CommentItem({
  comment,
  currentUserId,
  postAuthorId,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [pending, setPending] = useState(false);

  const isCommentOwner = comment.userId === currentUserId;

  const isPostOwner = postAuthorId === currentUserId;

  async function handleEdit() {
    if (!content.trim()) {
      return;
    }

    setPending(true);

    const result = await editComment(comment.id, content);

    if (!result?.error) {
      setEditing(false);
    }

    setPending(false);
  }

  async function handleDelete() {
    const result = await deleteComment(comment.id);

    if (result?.error) {
      alert(result.error);
    }
  }

  return (
    <div className="rounded border p-3">
      <p className="text-sm font-bold">@{comment.user.username}</p>

      {editing ? (
        <div className="mt-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border p-2 text-sm"
          />

          <div className="mt-2 flex gap-2">
            <button
              onClick={handleEdit}
              disabled={pending || !content.trim()}
              className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setContent(comment.content);
                setEditing(false);
              }}
              className="rounded border px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-sm">{comment.content}</p>
      )}

      {!editing && (
        <div className="mt-2 flex gap-3 text-xs">
          {isCommentOwner && (
            <button onClick={() => setEditing(true)} className="text-blue-600">
              Edit
            </button>
          )}

          {(isCommentOwner || isPostOwner) && (
            <button onClick={handleDelete} className="text-red-600">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
