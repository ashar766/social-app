import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import FollowButton from "../../components/FollowButton";

type Props = {
  params: Promise<{ user: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { user } = await params;

  const profile = await prisma.user.findUnique({
    where: {
      username: user,
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

  const session = await auth();

  const profile = await prisma.user.findUnique({
    where: {
      username: user,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: profile.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const existingFollow = session?.user?.id
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: profile.id,
          },
        },
      })
    : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="flex items-center gap-6 border-b pb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
          {profile.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>

          <p className="text-gray-500">@{profile.username}</p>

          {profile.bio && <p className="mt-2">{profile.bio}</p>}

          {session?.user?.id !== profile.id && (
            <div className="mt-4">
              <FollowButton
                userId={profile.id}
                status={existingFollow?.status ?? null}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 py-6">
        <div>
          <p className="font-bold">{posts.length}</p>
          <p className="text-gray-500">Posts</p>
        </div>

        <div>
          <p className="font-bold">{profile._count.followers}</p>
          <p className="text-gray-500">Followers</p>
        </div>

        <div>
          <p className="font-bold">{profile._count.following}</p>
          <p className="text-gray-500">Following</p>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>

        {posts.length === 0 ? (
          <p className="text-gray-500">No posts yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="overflow-hidden rounded-lg border">
                <div className="relative aspect-square">
                  <Image
                    src={post.imageUrl}
                    alt={post.caption || "Post image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 384px"
                  />
                </div>

                {post.caption && <p className="p-3">{post.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
