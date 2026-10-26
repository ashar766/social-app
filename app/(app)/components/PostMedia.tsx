"use client";

import Image from "next/image";
import { useState } from "react";

export type PostMediaItem = {
  url: string;
  type: "IMAGE" | "VIDEO";
};

type PostMediaProps = {
  media: PostMediaItem[];
  alt: string;
};

export default function PostMedia({ media, alt }: PostMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return null;
  }

  const activeMedia = media[activeIndex];
  const isVideo = activeMedia.type === "VIDEO";

  return (
    <div
      className={`relative w-full overflow-hidden bg-black ${isVideo ? "aspect-video" : "aspect-square"}`}
    >
      {isVideo ? (
        <video
          src={activeMedia.url}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      ) : (
        <Image
          src={activeMedia.url}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 672px"
        />
      )}

      {media.length > 1 && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-3 py-2 text-white">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((index) => (index - 1 + media.length) % media.length)
            }
            aria-label="Show previous image"
            className="rounded px-2 py-1 hover:bg-white/20"
          >
            Previous
          </button>
          <span className="text-sm">
            {activeIndex + 1} / {media.length}
          </span>
          <button
            type="button"
            onClick={() => setActiveIndex((index) => (index + 1) % media.length)}
            aria-label="Show next image"
            className="rounded px-2 py-1 hover:bg-white/20"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
