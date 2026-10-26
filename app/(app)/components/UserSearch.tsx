
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
                    className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-200 dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-white/25 dark:focus:bg-white/[0.09] dark:focus:ring-white/10"
                />

                <button
                    type="submit"
                    className="shrink-0 rounded-full bg-gray-900 px-4 py-2.5 text-sm !font-semibold text-white transition hover:bg-gray-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                >
                    Search
                </button>
            </form>

            {open && query.trim() && (
                <div className="absolute left-0 right-0 top-full z-50 mt-3 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/10 dark:border-white/10 dark:bg-[#171717] dark:shadow-black/30">
                    {loading ? (
                        <div className="flex items-center gap-3 p-4 text-sm text-gray-500 dark:text-gray-400">
                            <span
                                aria-hidden="true"
                                className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800 dark:border-gray-600 dark:border-t-white"
                            />
                            Searching...
                        </div>
                    ) : users.length > 0 ? (
                        <ul className="py-1">
                            {users.map((user) => (
                                <li key={user.id}>
                                    <Link
                                        href={`/profile/${user.username}`}
                                        onClick={() => {
                                            setOpen(false);
                                            setQuery("");
                                            setUsers([]);
                                        }}
                                        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none dark:hover:bg-white/[0.06] dark:focus-visible:bg-white/[0.06]"
                                    >
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt=""
                                                className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover dark:border-white/15"
                                            />
                                        ) : (
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700 dark:bg-white/10 dark:text-gray-200">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}

                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </span>
                                            <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                                @{user.username}
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-sm leading-5 text-gray-500 dark:text-gray-400">
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
