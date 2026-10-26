
"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";
import type { PostMediaItem } from "./PostMedia";

type Post = {
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

type Props = {
  initialPosts: Post[];
  initialHasMore: boolean;
  filter: string;
};

export default function InfinitePosts({
  initialPosts,
  initialHasMore,
  filter,
}: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialPosts, initialHasMore, filter]);

  useEffect(() => {
    if (!loaderRef.current || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        loadMore();
      }
    });

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading]);

  async function loadMore() {
    setLoading(true);

    const nextPage = page + 1;

    const response = await fetch(
      `/api/posts?filter=${filter}&page=${nextPage}`,
    );

    const data = await response.json();

    setPosts((currentPosts) => [...currentPosts, ...data.posts]);

    setPage(nextPage);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div
        ref={loaderRef}
        aria-live="polite"
        className="flex min-h-20 items-center justify-center py-8 text-center"
      >
        {loading ? (
          <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-600 dark:border-t-white"
            />
            Loading more posts...
          </div>
        ) : hasMore ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Scroll down to discover more
          </p>
        ) : posts.length > 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            You're all caught up.
          </p>
        ) : null}
      </div>
    </>
  );
}
