import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);

  const filter = searchParams.get("filter") || "all";
  const page = Number(searchParams.get("page")) || 1;

  const pageSize = 10;

  const skip = (page - 1) * pageSize;

  const validFilters = ["all", "recent", "following", "popular"];

  const currentFilter = validFilters.includes(filter) ? filter : "all";

  // Get users that the current user follows
  const following = await prisma.follow.findMany({
    where: {
      followerId: session.user.id,
      status: "ACCEPTED",
    },
    select: {
      followingId: true,
    },
  });

  const followedUserIds = following.map((follow) => follow.followingId);

  const posts = await prisma.post.findMany({
    where: {
      ...(currentFilter === "following"
        ? {
            authorId: {
              in: followedUserIds,
            },
          }
        : {}),
      ...(currentFilter === "recent"
        ? {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          }
        : {}),
    },
    include: {
      author: true,
      likes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: pageSize,
  });

  let sortedPosts = posts;

  if (currentFilter === "popular") {
    sortedPosts = [...posts].sort((a, b) => b.likes.length - a.likes.length);
  }

  const postsWithLikes = sortedPosts.map((post) => ({
    id: post.id,
    caption: post.caption,
    imageUrl: post.imageUrl,
    category: post.category,
    likeCount: post.likes.length,
    liked: post.likes.some((like) => like.userId === session.user.id),
    author: {
      username: post.author.username,
      name: post.author.name,
    },
  }));

  return NextResponse.json({
    posts: postsWithLikes,
    hasMore: posts.length === pageSize,
  });
}
