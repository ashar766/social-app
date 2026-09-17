import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      name: true,
      username: true,
    },
  });

  if (!user) {
    return {
      title: "Profile Not Found",
    };
  }

  return {
    title: `${user.name} (@${user.username}) | Social App`,
    description: `View ${user.name}'s profile on Social App.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center gap-6 border-b pb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
          {user.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">@{user.username}</p>

          {user.bio && <p className="mt-2">{user.bio}</p>}
        </div>
      </div>

      <div className="flex gap-8 py-6">
        <div>
          <p className="font-bold">0</p>
          <p className="text-gray-500">Posts</p>
        </div>

        <div>
          <p className="font-bold">0</p>
          <p className="text-gray-500">Followers</p>
        </div>

        <div>
          <p className="font-bold">0</p>
          <p className="text-gray-500">Following</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        <p className="text-gray-500">No posts yet.</p>
      </section>
    </main>
  );
}
