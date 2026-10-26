
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
    <article className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#171717] dark:hover:border-white/20">
      <PostMedia media={post.media} alt={post.caption || "Post media"} />

      <div className="p-4 sm:p-5">
        <Link href={`/post/${post.id}`} className="block">
          <p className="truncate text-sm font-bold text-gray-900 transition-colors group-hover:text-gray-600 dark:text-gray-100 dark:group-hover:text-gray-300">
            @{post.author.username}
          </p>

          {post.caption && (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700 dark:text-gray-300">
              {post.caption}
            </p>
          )}

          {post.category && (
            <p className="mt-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-white/[0.08] dark:text-gray-300">
              #{post.category}
            </p>
          )}
        </Link>

        <div className="mt-4 border-t border-gray-100 pt-3 dark:border-white/10">
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
