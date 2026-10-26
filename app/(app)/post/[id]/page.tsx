
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
        where: {
          parentId: null,
        },
        include: {
          user: true,
          replies: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
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
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-neutral-950 dark:text-gray-100 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex items-center justify-between gap-3 border-b border-gray-100 p-4 dark:border-neutral-800 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-700 dark:bg-neutral-800 dark:text-gray-200">
                {post.author.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  @{post.author.username}
                </p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {post.author.name}
                </p>
              </div>
            </div>

            {post.authorId === session?.user?.id && (
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <a
                  href={`/post/${post.id}/edit`}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm !font-semibold transition hover:bg-gray-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  Edit
                </a>

                <DeletePostButton postId={post.id} />
              </div>
            )}
          </header>

          <div className="bg-gray-100 dark:bg-neutral-950">
            <PostMedia
              media={post.media.map((item) => ({
                url: item.url,
                type: item.type,
              }))}
              alt={post.caption || "Post media"}
            />
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {post.caption && (
              <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-800 dark:text-gray-200">
                {post.caption}
              </p>
            )}

            {post.category && (
              <p className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                #{post.category}
              </p>
            )}
          </div>

          <section className="border-t border-gray-200 p-4 dark:border-neutral-800 sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                Comments
              </h2>
            </div>

            {post.comments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-neutral-700">
                <p className="font-medium">No comments yet</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start the conversation by leaving a comment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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

            <div className="mt-6 border-t border-gray-100 pt-5 dark:border-neutral-800">
              <CommentForm postId={post.id} />
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
