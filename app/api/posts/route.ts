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

  const validFilters = ["all", "recent", "following"];

  const currentFilter = validFilters.includes(filter) ? filter : "all";

  // Get the users that the logged-in user follows
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

  let allowedUserIds: string[];

  if (currentFilter === "following") {
    // Following filter:
    // only posts from users that I follow
    allowedUserIds = followedUserIds;
  } else {
    // All / Recent / Popular:
    // Get users whose posts I am allowed to see
    const allowedUsers = await prisma.user.findMany({
      where: {
        OR: [
          // Public accounts
          {
            isPrivate: false,
          },

          // My own account
          {
            id: session.user.id,
          },

          // Private accounts that I follow
          {
            followers: {
              some: {
                followerId: session.user.id,
                status: "ACCEPTED",
              },
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

    allowedUserIds = allowedUsers.map((user) => user.id);
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: allowedUserIds,
      },

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
      media: {
        orderBy: {
          position: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    skip,
    take: pageSize,
  });

  let sortedPosts = posts;

  const postsWithLikes = sortedPosts.map((post) => ({
    id: post.id,
    caption: post.caption,
    media: post.media.map((item) => ({
      url: item.url,
      type: item.type,
    })),
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
