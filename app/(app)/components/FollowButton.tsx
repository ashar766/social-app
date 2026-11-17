
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "../profile/[user]/action";

type FollowButtonProps = {
  userId: string;
  status: "PENDING" | "ACCEPTED" | null;
};

export default function FollowButton({ userId, status }: FollowButtonProps) {
  const [pending, setPending] = useState(false);

  const router = useRouter();

  async function handleFollow() {
    setPending(true);

    const result = await toggleFollow(userId);

    if (!result?.error) {
      router.refresh();
    }

    setPending(false);
  }

  return (
    <button
      onClick={handleFollow}
      disabled={pending}
      className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-4 !font-semibold tracking-wide text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
    >
      {pending
        ? "Loading..."
        : status === "ACCEPTED"
          ? "Following"
          : status === "PENDING"
            ? "Requested"
            : "Follow"}
    </button>
  );
}
