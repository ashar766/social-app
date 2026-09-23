import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import FollowButton from "../../components/FollowButton";
import FollowRequestButtons from "../../components/FollowRequestButtons";

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

  // Check if the logged-in user owns this profile
  const isOwner = session?.user?.id === profile.id;

  // Check the relationship between the logged-in user and this profile
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

  // Decide whether the current user can see the posts
  const canViewPosts =
    !profile.isPrivate || isOwner || existingFollow?.status === "ACCEPTED";

  // Get total number of posts
  // This is shown even when the posts themselves are private.
  const postCount = await prisma.post.count({
    where: {
      authorId: profile.id,
    },
  });

  // Only fetch the actual posts if the user is allowed to see them
  const posts = canViewPosts
    ? await prisma.post.findMany({
        where: {
          authorId: profile.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

  // Get pending follow requests received by this profile
  const pendingRequests = isOwner
    ? await prisma.follow.findMany({
        where: {
          followingId: profile.id,
          status: "PENDING",
        },
        include: {
          follower: true,
        },
      })
    : [];

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Follow Requests */}
      {isOwner && pendingRequests.length > 0 && (
        <section className="mb-6 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-bold">Follow Requests</h2>

          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{request.follower.name}</p>

                  <p className="text-sm text-gray-500">
                    @{request.follower.username}
                  </p>
                </div>

                <FollowRequestButtons requestId={request.id} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Profile Header */}
      <div className="flex items-center gap-6 border-b pb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl">
          {profile.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{profile.name}</h1>

          <p className="text-gray-500">@{profile.username}</p>

          {profile.bio && <p className="mt-2">{profile.bio}</p>}

          {!isOwner && (
            <div className="mt-4">
              <FollowButton
                userId={profile.id}
                status={existingFollow?.status ?? null}
              />
            </div>
          )}
        </div>
      </div>

      {/* Profile Stats */}
      <div className="flex gap-8 py-6">
        <div>
          <p className="font-bold">{postCount}</p>

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

      {/* Private Profile Message */}
      {profile.isPrivate && !canViewPosts && (
        <div className="rounded-lg border p-6 text-center">
          <p className="font-bold">This account is private</p>

          <p className="mt-1 text-sm text-gray-500">
            Follow this account to see their posts.
          </p>
        </div>
      )}

      {/* Posts */}
      {canViewPosts && (
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

                  {post.caption && <p className="p-3">{post.caption}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
