"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updatePost(
  postId: string,
  caption: string,
  category: string,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    return { error: "Post not found" };
  }

  if (post.authorId !== session.user.id) {
    return { error: "You are not allowed to edit this post" };
  }

  await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      caption: caption.trim() || null,
      category: category.trim() || null,
    },
  });

  revalidatePath(`/post/${postId}`);
  revalidatePath("/posts");

  redirect(`/post/${postId}`);
}
