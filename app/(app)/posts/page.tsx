import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import PostCard from "../components/PostCard";

export default async function PostsPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      likes: true,
    },
  });

  const postsWithLikes = posts.map((post) => ({
    ...post,
    likeCount: post.likes.length,
    liked: session?.user?.id
      ? post.likes.some((like) => like.userId === session.user.id)
      : false,
  }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Posts</h1>

      {postsWithLikes.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {postsWithLikes.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </main>
  );
}
