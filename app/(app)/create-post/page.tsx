
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPost } from "./action";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "./media-limits";
import { useRouter } from "next/navigation";

type SelectionMode = "images" | "video";

type SelectedFile = {
  file: File;
  previewUrl: string;
};

const initialState = {
  error: "",
};

export default function CreatePostPage() {
  const [mode, setMode] = useState<SelectionMode>("images");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [error, setError] = useState(initialState.error);
  const [uploading, setUploading] = useState(false);
  const selectedFilesRef = useRef<SelectedFile[]>([]);
  const router = useRouter();

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.previewUrl),
      );
    };
  }, []);

  function updateSelectedFiles(nextFiles: SelectedFile[]) {
    selectedFilesRef.current = nextFiles;
    setSelectedFiles(nextFiles);
  }

  function clearSelectedFiles() {
    selectedFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    updateSelectedFiles([]);
  }

  function handleModeChange(nextMode: SelectionMode) {
    clearSelectedFiles();
    setError("");
    setMode(nextMode);
  }

  function handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    setError("");

    if (files.length === 0) {
      return;
    }

    const allowedTypes =
      mode === "images" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;

    if (files.some((file) => !allowedTypes.includes(file.type))) {
      setError(
        mode === "images"
          ? "Choose JPEG, PNG, GIF, or WebP image files."
          : "Choose an MP4, WebM, or MOV video.",
      );
      return;
    }

    if (
      mode === "images" &&
      selectedFiles.length + files.length > MAX_IMAGE_COUNT
    ) {
      setError(`You can select up to ${MAX_IMAGE_COUNT} images.`);
      return;
    }

    if (mode === "video" && files.length !== 1) {
      setError("Choose one video per post.");
      return;
    }

    const sizeLimit =
      mode === "images" ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;

    const tooLargeFile = files.find((file) => file.size > sizeLimit);

    if (tooLargeFile) {
      setError(
        `${tooLargeFile.name} is too large. The limit is ${sizeLimit / (1024 * 1024)} MB.`,
      );
      return;
    }

    if (mode === "video" && selectedFiles.length > 0) {
      setError("Remove the selected video before choosing another one.");
      return;
    }

    const newSelection = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    updateSelectedFiles([...selectedFiles, ...newSelection]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (selectedFiles.length === 0) {
      setError("Select at least one image or one video before publishing.");
      return;
    }

    setUploading(true);

    const formData = new FormData(event.currentTarget);
    selectedFiles.forEach(({ file }) =>
      formData.append("media", file, file.name),
    );

    try {
      const result = await createPost(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.push("/posts");
      }
    } catch {
      setError("The post could not be created. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-7">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Share something with your community
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Create a post
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7"
        >
          <fieldset disabled={uploading} className="space-y-4">
            <legend className="mb-3 text-base font-semibold">
              Add your media
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleModeChange("images")}
                aria-pressed={mode === "images"}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${mode === "images"
                  ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                  }`}
              >
                Images
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("video")}
                aria-pressed={mode === "video"}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${mode === "video"
                  ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-300 dark:hover:bg-neutral-800"
                  }`}
              >
                Video
              </button>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-gray-400 hover:bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:border-neutral-500 dark:hover:bg-neutral-800">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="mb-3 h-9 w-9 text-gray-500 dark:text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>

              <span className="font-semibold">Choose files</span>

              <span className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {mode === "images"
                  ? `Select up to ${MAX_IMAGE_COUNT} images (5 MB maximum each).`
                  : "Select one video (50 MB maximum)."}
              </span>

              <input
                type="file"
                accept={
                  mode === "images"
                    ? ALLOWED_IMAGE_TYPES.join(",")
                    : `${ALLOWED_VIDEO_TYPES.join(",")},.mov`
                }
                multiple={mode === "images"}
                onChange={handleFileSelection}
                className="mt-4 block w-full max-w-sm cursor-pointer text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:font-semibold file:text-gray-800 hover:file:bg-gray-300 dark:text-gray-300 dark:file:bg-neutral-700 dark:file:text-gray-100 dark:hover:file:bg-neutral-600"
              />
            </label>

            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Selected media</h2>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "file" : "files"}
                  </span>
                </div>

                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {selectedFiles.map((item, index) => (
                    <li
                      key={`${item.file.name}-${item.file.lastModified}-${index}`}
                      className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      {mode === "images" ? (
                        <div className="relative aspect-square">
                          <Image
                            src={item.previewUrl}
                            alt={`Preview of ${item.file.name}`}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <video
                          src={item.previewUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-square w-full bg-black object-contain"
                        />
                      )}

                      <div className="flex items-center justify-between gap-2 p-3">
                        <span className="min-w-0 truncate text-xs text-gray-600 dark:text-gray-300">
                          {item.file.name}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            URL.revokeObjectURL(item.previewUrl);
                            updateSelectedFiles(
                              selectedFiles.filter(
                                (_, fileIndex) => fileIndex !== index,
                              ),
                            );
                          }}
                          aria-label={`Remove ${item.file.name}`}
                          className="shrink-0 rounded-md px-1 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </fieldset>

          <div className="space-y-2">
            <label
              htmlFor="post-caption"
              className="block text-sm font-semibold"
            >
              Caption
            </label>

            <textarea
              id="post-caption"
              name="caption"
              placeholder="Write a caption for your post..."
              className="w-full resize-y rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:placeholder:text-gray-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              rows={4}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="post-category"
              className="block text-sm font-semibold"
            >
              Category
            </label>

            <input
              id="post-category"
              name="category"
              type="text"
              placeholder="e.g. Travel, Food, Photography"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-800 dark:placeholder:text-gray-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              disabled={uploading}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {uploading ? "Uploading media..." : "Create Post"}
          </button>
        </form>
      </div>
    </main>
  );
}
