import prisma from "@/lib/prisma";
import Link from "next/link";
import UserSearchForm from "../../components/UserSearchForm";

type Props = {
  searchParams: Promise<{
    query?: string;
  }>;
};

export default async function UserSearchPage({ searchParams }: Props) {
  const { query = "" } = await searchParams;

  const users = query
    ? await prisma.user.findMany({
        where: {
          OR: [
            {
              username: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          isPrivate: true,
        },
        take: 20,
      })
    : [];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Search Users</h1>

      <UserSearchForm initialQuery={query} />

      {query && (
        <p className="mb-4 text-gray-500">
          Results for: <strong>{query}</strong>
        </p>
      )}

      {query && users.length === 0 && (
        <p className="text-gray-500">No users found.</p>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.username}`}
            className="flex items-center gap-4 rounded border p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              {user.name.charAt(0)}
            </div>

            <div>
              <p className="font-bold">{user.name}</p>

              <p className="text-sm text-gray-500">@{user.username}</p>

              {user.isPrivate && (
                <p className="text-xs text-gray-400">Private account</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
