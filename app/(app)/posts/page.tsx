
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

  const filterClass = (filterName: string) =>
    currentFilter === filterName
      ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-950"
      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 hover:text-gray-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300 dark:hover:border-white/25 dark:hover:bg-white/[0.08] dark:hover:text-white";

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 text-gray-950 sm:px-6 sm:py-10 dark:text-gray-100">
      <header className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Your community
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Explore posts
        </h1>

        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Catch up with the latest posts from your community.
        </p>
      </header>

      {/* Filters */}
      <nav
        aria-label="Post filters"
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        <Link
          href="/posts?filter=all"
          aria-current={currentFilter === "all" ? "page" : undefined}
          className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 ${filterClass("all")}`}
        >
          All posts
        </Link>

        <Link
          href="/posts?filter=recent"
          aria-current={currentFilter === "recent" ? "page" : undefined}
          className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 ${filterClass("recent")}`}
        >
          Recent
        </Link>

        <Link
          href="/posts?filter=following"
          aria-current={currentFilter === "following" ? "page" : undefined}
          className={`inline-flex min-h-10 items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 ${filterClass("following")}`}
        >
          Following
        </Link>
      </nav>

      {postsWithLikes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-14 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold">No posts found</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            There are no posts to show for this filter yet.
          </p>
        </div>
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
