import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import CommentForm from "../../components/CommentForm";
import DeletePostButton from "../../components/DeletePostButton";
import CommentItem from "../../components/CommentItem";
import PostMedia from "../../components/PostMedia";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
      media: {
        orderBy: {
          position: "asc",
        },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <article className="overflow-hidden rounded-lg border">
        <div className="p-4">
          <p className="font-bold">@{post.author.username}</p>

          <p className="text-sm text-gray-500">{post.author.name}</p>
        </div>

        <PostMedia
          media={post.media.map((item) => ({
            url: item.url,
            type: item.type,
          }))}
          alt={post.caption || "Post media"}
        />

        <div className="p-4">
          {post.caption && <p>{post.caption}</p>}

          {post.category && (
            <p className="mt-2 text-sm text-gray-500">#{post.category}</p>
          )}

          {post.authorId === session?.user?.id && (
            <div className="mt-4 flex gap-2">
              <a
                href={`/post/${post.id}/edit`}
                className="rounded bg-black px-4 py-2 text-sm text-white"
              >
                Edit
              </a>

              <DeletePostButton postId={post.id} />
            </div>
          )}
        </div>
      </article>

      <div className="border-t p-4">
        <h2 className="mb-4 font-bold">Comments ({post.comments.length})</h2>

        {post.comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={session?.user?.id ?? ""}
                postAuthorId={post.authorId}
              />
            ))}
          </div>
        )}

        <CommentForm postId={post.id} />
      </div>
    </main>
  );
}
