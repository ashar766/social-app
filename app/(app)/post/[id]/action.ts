"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addComment(postId: string, content: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  if (!content.trim()) {
    return { error: "Comment cannot be empty" };
  }

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId: session.user.id,
    },
  });

  revalidatePath(`/post/${postId}`);

  return { success: true };
}
