import Link from "next/link";
import Image from "next/image";
import LikeButton from "./LikeButton";

type PostCardProps = {
  post: {
    id: string;
    caption: string | null;
    imageUrl: string;
    category: string | null;
    likeCount: number;
    liked: boolean;
    author: {
      username: string;
      name: string;
    };
  };
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/post/${post.id}`}>
      <article className="overflow-hidden rounded-lg border">
        <div className="relative aspect-square">
          <Image
            src={post.imageUrl}
            alt={post.caption || "Post image"}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        <div className="p-3">
          <p className="text-sm font-bold">@{post.author.username}</p>

          {post.caption && (
            <p className="mt-1 line-clamp-2 text-sm">{post.caption}</p>
          )}

          {post.category && (
            <p className="mt-1 text-xs text-gray-500">#{post.category}</p>
          )}

          <div className="mt-2">
            <LikeButton
              postId={post.id}
              liked={post.liked}
              likeCount={post.likeCount}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
