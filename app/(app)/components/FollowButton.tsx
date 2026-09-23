"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "../profile/[user]/action";

type FollowButtonProps = {
  userId: string;
  status: "PENDING" | "ACCEPTED" | null;
};

export default function FollowButton({ userId, status }: FollowButtonProps) {
  const [followStatus, setFollowStatus] = useState(status);
  const [pending, setPending] = useState(false);

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
      className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
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
