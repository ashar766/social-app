"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_COUNT,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
} from "./media-limits";

type UploadedMedia = {
  url: string;
  type: "IMAGE" | "VIDEO";
};

function hasValidFileSignature(file: File, bytes: Uint8Array) {
  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/gif") {
    return (
      String.fromCharCode(...bytes.slice(0, 6)) === "GIF87a" ||
      String.fromCharCode(...bytes.slice(0, 6)) === "GIF89a"
    );
  }

  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  if (file.type === "video/mp4" || file.type === "video/quicktime") {
    return String.fromCharCode(...bytes.slice(4, 8)) === "ftyp";
  }

  if (file.type === "video/webm") {
    return (
      bytes[0] === 0x1a &&
      bytes[1] === 0x45 &&
      bytes[2] === 0xdf &&
      bytes[3] === 0xa3
    );
  }

  return false;
}

function isCloudinaryUpload(
  value: unknown,
  cloudName: string,
  type: UploadedMedia["type"],
): value is { secure_url: string; resource_type: string } {
  if (
    typeof value !== "object" ||
    value === null ||
    !("secure_url" in value) ||
    !("resource_type" in value)
  ) {
    return false;
  }

  if (
    typeof value.secure_url !== "string" ||
    value.resource_type !== type.toLowerCase()
  ) {
    return false;
  }

  try {
    const url = new URL(value.secure_url);
    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.startsWith(
        `/${cloudName}/${type.toLowerCase()}/upload/`,
      )
    );
  } catch {
    return false;
  }
}

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const mediaValues = formData.getAll("media");

  if (mediaValues.length === 0) {
    return { error: "Please select at least one image or one video." };
  }

  const files: File[] = [];
  for (const value of mediaValues) {
    if (!(value instanceof File)) {
      return { error: "The selected media could not be read. Choose the files again." };
    }
    files.push(value);
  }

  if (files.some((file) => file.size === 0)) {
    return { error: "One of the selected files is empty. Choose a different file." };
  }

  const areImages = files.every((file) =>
    ALLOWED_IMAGE_TYPES.includes(file.type),
  );
  const areVideos = files.every((file) =>
    ALLOWED_VIDEO_TYPES.includes(file.type),
  );

  if (!areImages && !areVideos) {
    return { error: "Use either images or one video. Images and videos cannot be mixed." };
  }

  if (areImages && files.length > MAX_IMAGE_COUNT) {
    return { error: `Choose no more than ${MAX_IMAGE_COUNT} images.` };
  }

  if (areVideos && files.length !== 1) {
    return { error: "Choose one video per post." };
  }

  for (const file of files) {
    const sizeLimit = areImages ? MAX_IMAGE_SIZE_BYTES : MAX_VIDEO_SIZE_BYTES;

    if (file.size > sizeLimit) {
      const limitInMegabytes = sizeLimit / (1024 * 1024);
      return {
        error: `${file.name} is too large. The limit is ${limitInMegabytes} MB.`,
      };
    }

    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (!hasValidFileSignature(file, signature)) {
      return { error: `${file.name} does not appear to be a valid media file.` };
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return {
      error: "Cloudinary is not configured. Check the cloud name and upload preset settings.",
    };
  }

  const uploadedMedia: UploadedMedia[] = [];

  for (const file of files) {
    const type = areImages ? "IMAGE" : "VIDEO";
    const resourceType = areImages ? "image" : "video";
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", uploadPreset);

    let response: Response;
    try {
      response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        {
          method: "POST",
          body: cloudinaryForm,
        },
      );
    } catch {
      return {
        error: `Could not connect to Cloudinary while uploading ${file.name}. Please try again.`,
      };
    }

    let cloudinaryData: unknown;
    try {
      cloudinaryData = await response.json();
    } catch {
      return { error: `Cloudinary returned an unreadable response for ${file.name}.` };
    }

    if (!response.ok) {
      return { error: `Cloudinary could not upload ${file.name}. Check the file and try again.` };
    }

    if (!isCloudinaryUpload(cloudinaryData, cloudName, type)) {
      return { error: `Cloudinary returned an invalid upload result for ${file.name}.` };
    }

    uploadedMedia.push({ url: cloudinaryData.secure_url, type });
  }

  await prisma.post.create({
    data: {
      caption: String(formData.get("caption") ?? "").trim() || null,
      category: String(formData.get("category") ?? "").trim() || null,
      authorId: session.user.id,
      media: {
        create: uploadedMedia.map((item, position) => ({
          url: item.url,
          type: item.type,
          position,
        })),
      },
    },
  });

  redirect("/posts");
}
