"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "../profile/[user]/request-action";

type Props = {
  requestId: string;
};

export default function FollowRequestButtons({ requestId }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setPending(true);

    const result = await acceptFollowRequest(requestId);

    if (!result?.error) {
      router.refresh();
    }

    setPending(false);
  }

  async function handleReject() {
    setPending(true);

    const result = await rejectFollowRequest(requestId);

    if (!result?.error) {
      router.refresh();
    }

    setPending(false);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleAccept}
        disabled={pending}
        className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
      >
        {pending ? "Loading..." : "Accept"}
      </button>

      <button
        onClick={handleReject}
        disabled={pending}
        className="rounded-full bg-gray-100 px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-white/[0.08] dark:text-gray-100 dark:hover:bg-white/[0.14]"
      >
        Reject
      </button>
    </div>
  );
}
