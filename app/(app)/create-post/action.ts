"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createPost(
  previousState: { error?: string },
  formData: FormData,
) {
  const session = await auth();

  console.log("SESSION:", session);
  console.log("USER ID:", session?.user?.id);

  if (!session?.user?.id) {
    return { error: "You must be logged in" };
  }

  const image = formData.get("image") as File;
  const caption = formData.get("caption") as string;
  const category = formData.get("category") as string;

  if (!image || image.size === 0) {
    return { error: "Please select an image" };
  }

  const cloudinaryForm = new FormData();

  cloudinaryForm.append("file", image);

  cloudinaryForm.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: cloudinaryForm,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Cloudinary upload error:", errorData);

    return { error: "Image upload failed" };
  }

  const cloudinaryData = await response.json();

  await prisma.post.create({
    data: {
      caption,
      category,
      imageUrl: cloudinaryData.secure_url,
      authorId: session.user.id,
    },
  });

  redirect("/posts");
}
