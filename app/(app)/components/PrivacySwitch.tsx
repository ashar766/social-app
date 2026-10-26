"use client";

import { useState } from "react";
import { togglePrivacy } from "../profile/[user]/action";

type PrivacySwitchProps = {
  initialIsPrivate: boolean;
};

export default function PrivacySwitch({
  initialIsPrivate,
}: PrivacySwitchProps) {
  const [isPrivate, setIsPrivate] = useState(initialIsPrivate);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);

    const result = await togglePrivacy(!isPrivate);

    if (!result?.error) {
      setIsPrivate(!isPrivate);
    }
    setPending(false);
  }

  return (
    <div className="mt-4 flex items-center justify-between rounded-lg p-4">
      <div>
        <p className="font-medium font-semibold">Private account</p>
        <p className="text-sm text-gray-500">
          {isPrivate
            ? "Only accepted followers can see your posts."
            : "Anyone can see your posts."}
        </p>
      </div>

      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        className={`relative h-6 w-11 rounded-full transition ${isPrivate ? "bg-black" : "bg-gray-300"
          }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${isPrivate ? "left-6" : "left-1"
            }`}
        />
      </button>
    </div>
  );
}
