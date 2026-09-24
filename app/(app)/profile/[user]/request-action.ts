"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getIO } from "@/lib/socket";

export async function acceptFollowRequest(requestId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const request = await prisma.follow.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  // Make sure the logged-in user is the person
  // who received the request.
  if (request.followingId !== session.user.id) {
    return { error: "You are not allowed to accept this request" };
  }

  await prisma.follow.update({
    where: {
      id: requestId,
    },
    data: {
      status: "ACCEPTED",
    },
  });

  const io = getIO();

  if (io) {
    io.to(`user:${request.followerId}`).emit("follow-accepted", {
      username: session.user.username,
    });
  }

  revalidatePath(`/profile/${session.user.username}`);

  return { success: true };
}

export async function rejectFollowRequest(requestId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const request = await prisma.follow.findUnique({
    where: {
      id: requestId,
    },
  });

  if (!request) {
    return { error: "Request not found" };
  }

  // Make sure the logged-in user is the person
  // who received the request.
  if (request.followingId !== session.user.id) {
    return { error: "You are not allowed to reject this request" };
  }

  await prisma.follow.delete({
    where: {
      id: requestId,
    },
  });

  revalidatePath(`/profile/${session.user.username}`);

  return { success: true };
}
