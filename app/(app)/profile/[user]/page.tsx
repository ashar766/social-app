
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import FollowButton from "../../components/FollowButton";
import FollowRequestButtons from "../../components/FollowRequestButtons";
import PrivacySwitch from "../../components/PrivacySwitch";
import LikeButton from "../../components/LikeButton";
import PostMedia from "../../components/PostMedia";
import ProfileImage from "./profileImage";
import LogoutButton from "@/app/(app)/LogoutButton";

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

  const isOwner = session?.user?.id === profile.id;

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

  const canViewPosts =
    !profile.isPrivate || isOwner || existingFollow?.status === "ACCEPTED";

  const postCount = await prisma.post.count({
    where: {
      authorId: profile.id,
    },
  });

  const posts = canViewPosts
    ? await prisma.post.findMany({
      where: {
        authorId: profile.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        likes: true,
        media: {
          orderBy: {
            position: "asc",
          },
        },
      },
    })
    : [];

  const postsWithLikes = posts.map((post) => ({
    ...post,
    likeCount: post.likes.length,
    liked: post.likes.some((like) => like.userId === session?.user?.id),
  }));

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
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {isOwner && pendingRequests.length > 0 && (
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Follow Requests</h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
                {pendingRequests.length}
              </span>
            </div>

            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 first:border-0 first:pt-0 dark:border-neutral-800"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {request.follower.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      @{request.follower.username}
                    </p>
                  </div>

                  <FollowRequestButtons requestId={request.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-300 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 sm:h-32" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
              <div className="rounded-full bg-white p-1.5 dark:bg-neutral-900">
                <ProfileImage
                  image={profile.image}
                  name={profile.name}
                  isOwner={isOwner}
                />
              </div>

              {isOwner && (
                <div>
                  <LogoutButton />
                </div>
              )}
            </div>

            <div className="mt-4">
              <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {profile.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="mt-4 max-w-2xl whitespace-pre-wrap break-words text-sm leading-7 text-gray-700 dark:text-gray-300">
                  {profile.bio}
                </p>
              )}

              {!isOwner && (
                <div className="mt-5">
                  <FollowButton
                    userId={profile.id}
                    status={existingFollow?.status ?? null}
                  />
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-100 bg-gray-50 py-4 dark:divide-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/50">
              <div className="px-2 text-center">
                <p className="text-xl font-bold tabular-nums">{postCount}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Posts
                </p>
              </div>

              <div className="px-2 text-center">
                <p className="text-xl font-bold tabular-nums">
                  {profile._count.followers}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Followers
                </p>
              </div>

              <div className="px-2 text-center">
                <p className="text-xl font-bold tabular-nums">
                  {profile._count.following}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Following
                </p>
              </div>
            </div>
          </div>
        </section>

        {isOwner && (
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-5">
            <h2 className="mb-3 font-semibold">Account privacy</h2>
            <PrivacySwitch initialIsPrivate={profile.isPrivate} />
          </section>
        )}

        {profile.isPrivate && !canViewPosts && (
          <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-800">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-7 w-7 text-gray-600 dark:text-gray-300"
              >
                <rect x="5" y="10" width="14" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-bold">
              This account is private
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
              Follow this account to see their posts.
            </p>
          </section>
        )}

        {canViewPosts && (
          <section>
            <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-neutral-800">
              <h2 className="text-xl font-bold">Posts</h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {postsWithLikes.length}{" "}
                {postsWithLikes.length === 1 ? "post" : "posts"}
              </span>
            </div>

            {postsWithLikes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
                <h3 className="font-semibold">No posts yet</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Posts shared by this account will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {postsWithLikes.map((post) => (
                  <article
                    key={post.id}
                    className="group min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <Link
                      href={`/post/${post.id}`}
                      aria-label={`View post: ${post.caption || "Post media"}`}
                      className="block overflow-hidden bg-gray-100 dark:bg-neutral-800"
                    >
                      <PostMedia
                        media={post.media.map((item) => ({
                          url: item.url,
                          type: item.type,
                        }))}
                        alt={post.caption || "Post media"}
                      />
                    </Link>

                    <div className="p-4">
                      <Link
                        href={`/post/${post.id}`}
                        className="block break-words text-sm leading-6 text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
                      >
                        {post.caption || "View post"}
                      </Link>

                      <div className="mt-3 border-t border-gray-100 pt-3 dark:border-neutral-800">
                        <LikeButton
                          postId={post.id}
                          liked={post.liked}
                          likeCount={post.likeCount}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
