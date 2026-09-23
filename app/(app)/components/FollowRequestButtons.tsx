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
        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        {pending ? "Loading..." : "Accept"}
      </button>

      <button
        onClick={handleReject}
        disabled={pending}
        className="rounded border px-3 py-1 text-sm disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
