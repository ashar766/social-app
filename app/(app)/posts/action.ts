"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getIO } from "@/lib/socket";

export async function toggleLike(postId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const userId = session.user.id;

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    select: {
      authorId: true,
    },
  });

  if (!post) {
    return { error: "Post not found" };
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id,
      },
    });

    const io = getIO();

    if (io) {
      io.to(`user:${post.authorId}`).emit("post-unliked", {
        postId,
        username: session.user.username,
      });
    }
    revalidatePath("/posts");

    return {
      success: true,
      status: "removed",
    };
  }

  await prisma.like.create({
    data: {
      userId,
      postId,
    },
  });

  const io = getIO();

  if (io) {
    io.to(`user:${post.authorId}`).emit("post-liked", {
      postId,
      username: session.user.username,
    });
  }

  revalidatePath("/posts");

  return {
    success: true,
    status: "added",
  };
}
