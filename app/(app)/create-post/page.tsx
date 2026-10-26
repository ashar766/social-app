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
    if (
      files.some((file) => !allowedTypes.includes(file.type))
    ) {
      setError(
        mode === "images"
          ? "Choose JPEG, PNG, GIF, or WebP image files."
          : "Choose an MP4, WebM, or MOV video.",
      );
      return;
    }

    if (mode === "images" && selectedFiles.length + files.length > MAX_IMAGE_COUNT) {
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
    selectedFiles.forEach(({ file }) => formData.append("media", file, file.name));

    try {
      const result = await createPost(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError("The post could not be created. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={uploading} className="space-y-3">
          <legend className="mb-2 font-medium">Post media</legend>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("images")}
              aria-pressed={mode === "images"}
              className={`rounded border px-4 py-2 ${mode === "images" ? "bg-black text-white" : ""}`}
            >
              Images
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("video")}
              aria-pressed={mode === "video"}
              className={`rounded border px-4 py-2 ${mode === "video" ? "bg-black text-white" : ""}`}
            >
              Video
            </button>
          </div>

          <label className="block rounded border p-3">
            <span className="mb-2 block text-sm text-gray-600">
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
              className="w-full"
            />
          </label>

          {selectedFiles.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedFiles.map((item, index) => (
                <li
                  key={`${item.file.name}-${item.file.lastModified}-${index}`}
                  className="overflow-hidden rounded border"
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
                      className="aspect-video w-full bg-black"
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 p-2">
                    <span className="truncate text-xs">{item.file.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(item.previewUrl);
                        updateSelectedFiles(
                          selectedFiles.filter((_, fileIndex) => fileIndex !== index),
                        );
                      }}
                      aria-label={`Remove ${item.file.name}`}
                      className="shrink-0 text-sm text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </fieldset>

        <textarea
          name="caption"
          placeholder="Write a caption..."
          className="w-full rounded border p-3"
          rows={4}
          disabled={uploading}
        />

        <input
          name="category"
          type="text"
          placeholder="Category"
          className="w-full rounded border p-3"
          disabled={uploading}
        />

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="w-full rounded bg-black p-3 text-white disabled:opacity-50"
        >
          {uploading ? "Uploading media..." : "Create Post"}
        </button>
      </form>
    </main>
  );
}
