
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  editComment,
  deleteComment,
  replyToComment,
} from "../post/[id]/action";

type Reply = {
  id: string;
  content: string;
  userId: string;
  parentId: string | null;
  user: {
    username: string;
  };
};

type CommentData = {
  id: string;
  content: string;
  userId: string;
  parentId: string | null;
  user: {
    username: string;
  };
  replies: Reply[];
};

type CommentItemProps = {
  comment: CommentData;
  currentUserId: string;
  postAuthorId: string;
};

export default function CommentItem({
  comment,
  currentUserId,
  postAuthorId,
}: CommentItemProps) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [pending, setPending] = useState(false);

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [replyEditContent, setReplyEditContent] = useState("");

  const isCommentOwner = comment.userId === currentUserId;
  const isPostOwner = postAuthorId === currentUserId;

  async function handleEdit() {
    if (!content.trim() || pending) return;

    setPending(true);
    const result = await editComment(comment.id, content);
    setPending(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this comment? Its replies will also be deleted.",
      )
    ) {
      return;
    }

    const result = await deleteComment(comment.id);

    if (result?.error) {
      alert(result.error);
      return;
    }

    router.refresh();
  }

  async function handleReply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!replyContent.trim() || pending) return;

    setPending(true);
    const result = await replyToComment(comment.id, replyContent);
    setPending(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    setReplyContent("");
    setShowReply(false);
    router.refresh();
  }

  async function handleEditReply(replyId: string) {
    if (!replyEditContent.trim() || pending) return;

    setPending(true);
    const result = await editComment(replyId, replyEditContent);
    setPending(false);

    if (result?.error) {
      alert(result.error);
      return;
    }

    setEditingReplyId(null);
    setReplyEditContent("");
    router.refresh();
  }

  async function handleDeleteReply(replyId: string) {
    if (!window.confirm("Delete this reply?")) return;

    const result = await deleteComment(replyId);

    if (result?.error) {
      alert(result.error);
      return;
    }

    router.refresh();
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:opacity-60 dark:border-white/10 dark:bg-[#111111] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-white/30 dark:focus:ring-white/10";

  const primaryButtonClass =
    "inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200";

  const secondaryButtonClass =
    "inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-100 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/[0.08]";

  const actionClass =
    "text-xs font-semibold text-gray-500 transition hover:text-gray-950 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-gray-400 dark:hover:text-white";

  return (
    <article className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-[#171717]">
      <div className="flex min-w-0 items-start gap-3">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700 dark:bg-white/10 dark:text-gray-200"
        >
          {comment.user.username.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            @{comment.user.username}
          </p>

          {editing ? (
            <div className="mt-3">
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={2000}
                className={inputClass}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  disabled={pending || !content.trim()}
                  className={primaryButtonClass}
                >
                  {pending ? "Saving..." : "Save"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setContent(comment.content);
                    setEditing(false);
                  }}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
              {comment.content}
            </p>
          )}

          {!editing && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <button
                type="button"
                onClick={() => setShowReply(!showReply)}
                className={actionClass}
              >
                {showReply ? "Cancel reply" : "Reply"}
              </button>

              {isCommentOwner && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className={actionClass}
                >
                  Edit
                </button>
              )}

              {(isCommentOwner || isPostOwner) && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-xs font-semibold text-red-500 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Delete
                </button>
              )}
            </div>
          )}

          {showReply && (
            <form
              onSubmit={handleReply}
              className="mt-4 flex flex-col gap-2 sm:flex-row"
            >
              <input
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to @${comment.user.username}...`}
                maxLength={2000}
                className={inputClass}
              />

              <button
                type="submit"
                disabled={pending || !replyContent.trim()}
                className={`${primaryButtonClass} shrink-0`}
              >
                {pending ? "Sending..." : "Send"}
              </button>
            </form>
          )}

          {comment.replies.length > 0 && (
            <div className="mt-5 space-y-3 border-l-2 border-gray-200 pl-3 sm:pl-4 dark:border-white/10">
              {comment.replies.map((reply) => {
                const isReplyOwner = reply.userId === currentUserId;

                return (
                  <div
                    key={reply.id}
                    className="min-w-0 rounded-xl bg-gray-50 p-3 sm:p-4 dark:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-white/10 dark:text-gray-200"
                      >
                        {reply.user.username.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                          @{reply.user.username}
                        </p>

                        {editingReplyId === reply.id ? (
                          <div className="mt-3">
                            <input
                              value={replyEditContent}
                              onChange={(e) =>
                                setReplyEditContent(e.target.value)
                              }
                              maxLength={2000}
                              className={inputClass}
                            />

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditReply(reply.id)}
                                disabled={
                                  pending || !replyEditContent.trim()
                                }
                                className={primaryButtonClass}
                              >
                                {pending ? "Saving..." : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setReplyEditContent("");
                                }}
                                className={secondaryButtonClass}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-4">
                              {isReplyOwner && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReplyId(reply.id);
                                    setReplyEditContent(reply.content);
                                  }}
                                  className={actionClass}
                                >
                                  Edit
                                </button>
                              )}

                              {(isReplyOwner || isPostOwner) && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReply(reply.id)}
                                  className="text-xs font-semibold text-red-500 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
