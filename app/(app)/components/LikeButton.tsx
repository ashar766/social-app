
"use client";

import { useEffect, useState } from "react";
import { toggleLike } from "../posts/action";

type LikeButtonProps = {
  postId: string;
  liked: boolean;
  likeCount: number;
};

export default function LikeButton({
  postId,
  liked,
  likeCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [count, setCount] = useState(likeCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setIsLiked(liked);
    setCount(likeCount);
  }, [liked, likeCount]);

  async function handleLike(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (pending) {
      return;
    }

    setPending(true);

    const result = await toggleLike(postId);

    if (!result?.error) {
      if (result.status === "added") {
        setIsLiked(true);
        setCount((current) => current + 1);
      } else if (result.status === "removed") {
        setIsLiked(false);
        setCount((current) => current - 1);
      }
    }

    setPending(false);
  }

  return (
    <button
      onClick={handleLike}
      disabled={pending}
      aria-label={isLiked ? `Unlike post, ${count} likes` : `Like post, ${count} likes`}
      aria-pressed={isLiked}
      className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-6 w-6 transition-transform duration-200 group-hover:scale-110 ${isLiked
            ? "animate-heart-pop text-red-500"
            : "text-gray-500 group-hover:text-red-500 dark:text-gray-400"
          }`}
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
      </svg>

      <span className="tabular-nums">{count}</span>

      <style jsx>{`
        @keyframes heart-pop {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.35);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-heart-pop {
          animation: heart-pop 0.3s ease-out;
        }
      `}</style>
    </button>
  );
}
