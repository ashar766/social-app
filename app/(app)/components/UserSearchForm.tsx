"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialQuery: string;
};

export default function UserSearchForm({ initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery);

  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search/users");
      return;
    }

    router.push(`/search/users?query=${encodeURIComponent(trimmedQuery)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full rounded border p-3"
      />

      <button
        type="submit"
        className="mt-3 rounded bg-black px-4 py-2 text-white"
      >
        Search
      </button>
    </form>
  );
}
