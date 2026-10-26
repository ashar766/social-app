import Link from "next/link";
import LikeButton from "./LikeButton";
import PostMedia, { type PostMediaItem } from "./PostMedia";

type PostCardProps = {
  post: {
    id: string;
    caption: string | null;
    media: PostMediaItem[];
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
    <article className="overflow-hidden rounded-lg border">
      <PostMedia media={post.media} alt={post.caption || "Post media"} />

      <div className="p-3">
        <Link href={`/post/${post.id}`} className="block">
          <p className="text-sm font-bold">@{post.author.username}</p>
          {post.caption && (
            <p className="mt-1 line-clamp-2 text-sm">{post.caption}</p>
          )}
          {post.category && (
            <p className="mt-1 text-xs text-gray-500">#{post.category}</p>
          )}
        </Link>

        <div className="mt-2">
          <LikeButton
            postId={post.id}
            liked={post.liked}
            likeCount={post.likeCount}
          />
        </div>
      </div>
    </article>
  );
}
