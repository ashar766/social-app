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
    return { error: "You cannot follow yourself" };
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
