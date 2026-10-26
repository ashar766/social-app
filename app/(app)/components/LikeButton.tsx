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
      className="text-sm disabled:opacity-50"
    >
      {isLiked ? "❤️" : "❤︎⁠"} {count}
    </button>
  );
}
