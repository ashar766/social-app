"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "../profile/[user]/action";

type FollowButtonProps = {
  userId: string;
  status: "PENDING" | "ACCEPTED" | null;
};

export default function FollowButton({ userId, status }: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState(status);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setFollowStatus(status);
  }, [status]);

  const router = useRouter();

  async function handleFollow() {
    setPending(true);

    const result = await toggleFollow(userId);

    if (!result?.error) {
      if (result.status === "accepted") {
        setFollowStatus("ACCEPTED");
      } else if (result.status === "pending") {
        setFollowStatus("PENDING");
      } else if (result.status === "removed") {
        setFollowStatus(null);
      }

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
        : followStatus === "ACCEPTED"
          ? "Following"
          : followStatus === "PENDING"
            ? "Requested"
            : "Follow"}
    </button>
  );
}
