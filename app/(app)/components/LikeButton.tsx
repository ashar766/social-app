"use client";

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
  async function handleLike(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    await toggleLike(postId);
  }

  return (
    <button onClick={handleLike} className="text-sm">
      {liked ? "❤️" : "♡"} {likeCount}
    </button>
  );
}
