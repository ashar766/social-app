"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getIO } from "@/lib/socket";

export async function addComment(postId: string, content: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  if (!content.trim()) {
    return { error: "Comment cannot be empty" };
  }

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

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId: session.user.id,
    },
  });

  const io = getIO();

  if (io) {
    io.to(`user:${post.authorId}`).emit("post-commented", {
      postId,
      username: session.user.username,
    });
  }

  revalidatePath(`/post/${postId}`);

  return { success: true };
}

export async function editComment(commentId: string, content: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  if (!content.trim()) {
    return { error: "Comment cannot be empty" };
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: true,
    },
  });

  if (!comment) {
    return { error: "Comment not found" };
  }

  if (comment.userId !== session.user.id) {
    return { error: "You can only edit your own comments" };
  }

  await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: content.trim(),
    },
  });

  revalidatePath(`/post/${comment.postId}`);

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    include: {
      post: true,
    },
  });

  if (!comment) {
    return { error: "Comment not found" };
  }

  const isCommentOwner = comment.userId === session.user.id;
  const isPostOwner = comment.post.authorId === session.user.id;

  if (!isCommentOwner && !isPostOwner) {
    return {
      error: "You are not allowed to delete this comment",
    };
  }

  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });

  revalidatePath(`/post/${comment.postId}`);

  return { success: true };
}
