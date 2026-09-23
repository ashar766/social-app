import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditPostForm from "../../../components/EditPostForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: {
      id,
    },
  });

  if (!post) {
    notFound();
  }

  if (post.authorId !== session.user.id) {
    redirect(`/post/${post.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Edit Post</h1>

      <EditPostForm
        postId={post.id}
        initialCaption={post.caption || ""}
        initialCategory={post.category || ""}
      />
    </main>
  );
}
