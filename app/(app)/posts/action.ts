"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleLike(postId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const userId = session.user.id;

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
  } else {
    await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });
  }

  revalidatePath("/posts");

  return { success: true };
}
