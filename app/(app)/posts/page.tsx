import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import InfinitePosts from "../components/InfinitePosts";

type Props = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

export default async function PostsPage({ searchParams }: Props) {
  const { filter = "all" } = await searchParams;

  const session = await auth();

  const validFilters = ["all", "recent", "following"];

  const currentFilter = validFilters.includes(filter) ? filter : "all";

  // Get the users that the logged-in user follows
  const following = await prisma.follow.findMany({
    where: {
      followerId: session!.user.id,
      status: "ACCEPTED",
    },
    select: {
      followingId: true,
    },
  });

  const followedUserIds = following.map((follow) => follow.followingId);

  // Get the first 10 posts
  const posts = await prisma.post.findMany({
    where: {
      // Following filter
      ...(currentFilter === "following"
        ? {
            authorId: {
              in: followedUserIds,
            },
          }
        : {
            author: {
              OR: [
                { isPrivate: false },
                {
                  id: session!.user.id,
                },
                {
                  followers: {
                    some: {
                      followerId: session!.user.id,
                      status: "ACCEPTED",
                    },
                  },
                },
              ],
            },
          }),

      // Recent filter
      ...(currentFilter === "recent"
        ? {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },

    include: {
      author: true,
      likes: true,
      media: {
        orderBy: {
          position: "asc",
        },
      },
    },

    take: 10,
  });

  const postsWithLikes = posts.map((post) => ({
    id: post.id,
    caption: post.caption,
    media: post.media.map((item) => ({
      url: item.url,
      type: item.type,
    })),
    category: post.category,
    likeCount: post.likes.length,
    liked: post.likes.some((like) => like.userId === session!.user.id),
    author: {
      username: post.author.username,
      name: post.author.name,
    },
  }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Posts</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/posts?filter=all" className="rounded border px-4 py-2">
          All
        </Link>

        <Link href="/posts?filter=recent" className="rounded border px-4 py-2">
          Recent
        </Link>

        <Link
          href="/posts?filter=following"
          className="rounded border px-4 py-2"
        >
          Following
        </Link>
      </div>

      {postsWithLikes.length === 0 ? (
        <p className="text-gray-500">No posts found.</p>
      ) : (
        <InfinitePosts
          initialPosts={postsWithLikes}
          initialHasMore={posts.length === 10}
          filter={currentFilter}
        />
      )}
    </main>
  );
}
