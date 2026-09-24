"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";

type Post = {
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={loaderRef} className="py-8 text-center text-sm text-gray-500">
        {loading
          ? "Loading more posts..."
          : hasMore
            ? "Scroll down to load more"
            : "No more posts"}
      </div>
    </>
  );
}
