
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type UserResult = {
    id: string;
    name: string;
    username: string;
    image: string | null;
};

export default function UserSearch() {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const search = query.trim();

        if (!search || search.length > 50) {
            setUsers([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const timer = setTimeout(async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    `/api/users/search?q=${encodeURIComponent(search)}`,
                );

                if (!response.ok) {
                    throw new Error("Search failed");
                }

                const data: { users: UserResult[] } =
                    await response.json();

                if (!cancelled) {
                    setUsers(data.users);
                    setOpen(true);
                }
            } catch {
                if (!cancelled) {
                    setUsers([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [query]);

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick,
            );
        };
    }, []);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (query.trim()) {
            setOpen(true);
        }
    }

    return (
        <div ref={containerRef} className="relative w-full max-w-sm">
            <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2"
            >
                <input
                    type="search"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => {
                        if (query.trim()) setOpen(true);
                    }}
                    placeholder="Search users..."
                    aria-label="Search users by name or username"
                    aria-expanded={open}
                    className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                >
                    Search
                </button>
            </form>

            {open && query.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-white shadow-lg">
                    {loading ? (
                        <p className="p-4 text-sm text-gray-500">
                            Searching...
                        </p>
                    ) : users.length > 0 ? (
                        <ul>
                            {users.map((user) => (
                                <li key={user.id}>
                                    <Link
                                        href={`/profile/${user.username}`}
                                        onClick={() => {
                                            setOpen(false);
                                            setQuery("");
                                            setUsers([]);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-100"
                                    >
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt=""
                                                className="h-10 w-10 rounded-full border object-cover"
                                            />
                                        ) : (
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}

                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-medium">
                                                {user.name}
                                            </span>
                                            <span className="block truncate text-xs text-gray-500">
                                                @{user.username}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-sm text-gray-500">
                            {query.trim().length > 50
                                ? "Search must be 50 characters or fewer."
                                : "No users found."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
