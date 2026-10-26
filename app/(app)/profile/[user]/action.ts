"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getIO } from "@/lib/socket";

export async function toggleFollow(userId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const followerId = session.user.id;

  if (followerId === userId) {
    return { error: "You cannot follow yourself" }; //server side validation
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { error: "User not found" };
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userId,
      },
    },
  });

  // Already following or already requested
  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        id: existingFollow.id,
      },
    });

    revalidatePath(`/profile/${user.username}`);

    return {
      success: true,
      status: "removed",
    };
  }

  // Private profile = send request
  if (user.isPrivate) {
    await prisma.follow.create({
      data: {
        followerId,
        followingId: userId,
        status: "PENDING",
      },
    });

    const io = getIO();

    console.log("SOCKET SERVER AVAILABLE:", !!io);

    if (io) {
      console.log("SENDING FOLLOW REQUEST TO:", `user:${userId}`);

      io.to(`user:${userId}`).emit("follow-request", {
        username: session.user.username,
      });
    }

    revalidatePath(`/profile/${user.username}`);

    return {
      success: true,
      status: "pending",
    };
  }

  // Public profile = follow immediately
  await prisma.follow.create({
    data: {
      followerId,
      followingId: userId,
      status: "ACCEPTED",
    },
  });

  revalidatePath(`/profile/${user.username}`);

  return {
    success: true,
    status: "accepted",
  };
}

export async function togglePrivacy(isPrivate: boolean) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      isPrivate,
    },
  });

  revalidatePath(`/profile/${session.user.username}`);

  return {
    success: true,
  };
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function updateProfileImage(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in." };
  }

  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please select an image." };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return { error: "Choose a JPG, PNG, WebP, or GIF image." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  const isJpeg =
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff;

  const isPng =
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  const isGif =
    bytes.length >= 6 &&
    new TextDecoder().decode(bytes.slice(0, 6)).match(/^GIF8[79]a$/);

  const isWebp =
    bytes.length >= 12 &&
    new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
    new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";

  if (!(isJpeg || isPng || isGif || isWebp)) {
    return { error: "The selected file is not a valid supported image." };
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    return { error: "Image upload is not configured." };
  }

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", uploadPreset);
  uploadData.append("folder", "profile-images");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      },
    );

    if (!response.ok) {
      return { error: "Image upload failed. Please try again." };
    }

    const result: unknown = await response.json();

    if (
      typeof result !== "object" ||
      result === null ||
      !("secure_url" in result) ||
      typeof result.secure_url !== "string"
    ) {
      return { error: "Cloudinary returned an invalid image URL." };
    }

    const imageUrl = new URL(result.secure_url);

    if (
      imageUrl.protocol !== "https:" ||
      imageUrl.hostname !== "res.cloudinary.com" ||
      !imageUrl.pathname.startsWith(`/${cloudName}/image/upload/`)
    ) {
      return { error: "The uploaded image URL is invalid." };
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl.toString() },
      select: { username: true },
    });

    revalidatePath(`/profile/${user.username}`);
    revalidatePath("/posts");

    return { success: true, imageUrl: imageUrl.toString() };
  } catch {
    return { error: "Something went wrong while uploading your image." };
  }
}
