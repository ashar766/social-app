"use server";

import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signup(
  previousState: { error?: string },
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  if (!name || !username || !email || !password) {
    return { error: "All fields are required" };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    return { error: "Email or username already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
    },
  });

  redirect("/login");
}
