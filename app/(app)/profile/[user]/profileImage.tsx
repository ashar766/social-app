
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileImage } from "./action";

type Props = {
  image: string | null;
  name: string;
  isOwner: boolean;
};

export default function ProfileImage({
  image,
  name,
  isOwner,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setPreview(null);

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("Choose a JPG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await updateProfileImage(formData);

      if (result.error) {
        setError(result.error);
        setPreview(null);
        return;
      }

      setPreview(null);
      router.refresh();
    } catch {
      setError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28 shrink-0">
        {preview || image ? (
          <img
            src={preview ?? image!}
            alt={`${name}'s profile`}
            className="h-full w-full rounded-full border object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-4xl font-semibold text-gray-600">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              aria-label="Change profile picture"
              title="Change profile picture"
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gray-900 text-white shadow transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L9 17l-4 1 1-4Z" />
                </svg>
              )}
            </button>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleChange}
              className="hidden"
              disabled={uploading}
            />
          </>
        )}
      </div>

      {uploading && (
        <p className="text-sm text-gray-500">Uploading photo...</p>
      )}

      {error && (
        <p role="alert" className="max-w-56 text-center text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
