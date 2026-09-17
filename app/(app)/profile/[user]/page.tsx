import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

type Props = {
  params: Promise<{ user: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;

  const profile = await prisma.user.findFirst({
    where: {
      name: user,
    },
  });

  if (!profile) {
    return {
      title: "Profile Not Found",
    };
  }

  return {
    title: `${profile.name} (@${profile.username}) | Social App`,
    description: `View ${profile.name}'s profile on Social App.`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { user } = await params;

  // Get the profile user
  const profile = await prisma.user.findFirst({
    where: {
      name: user,
    },
  });

  if (!profile) {
    notFound();
  }

  // Get only this user's posts
  const posts = await prisma.post.findMany({
    where: {
      authorId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Profile */}
      <div className="flex items-center gap-6 border-b pb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
          {profile.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>

          <p className="text-gray-500">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-2">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 py-6">
        <div>
          <p className="font-bold">{posts.length}</p>
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

      {/* Posts */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="overflow-hidden rounded-lg border"
              >
                <div className="relative aspect-square">
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 384px"
                  />
                </div>

                {post.caption && (
                  <p className="p-3">{post.caption}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
