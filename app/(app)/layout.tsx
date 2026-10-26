
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import SocketProvider from "./components/SocketProvider";
import UserSearch from "./components/UserSearch";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  const currentUser = session?.user?.id
    ? await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        name: true,
        image: true,
      },
    })
    : null;

  return (
    <SocketProvider>
      <nav className="border-b bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/posts"
            className="font-semibold hover:text-gray-600"
          >
            Posts
          </Link>

          <Link
            href="/create-post"
            className="hover:text-gray-600"
          >
            Create Post
          </Link>

          <div className="w-full max-w-sm">
            <UserSearch />
          </div>

          <div className="ml-auto flex items-center gap-4">

            {currentUser && (
              <Link
                href={`/profile/${currentUser.username}`}
                aria-label="Your profile"
                title="Your profile"
                className="rounded-full transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt={`${currentUser.name}'s profile`}
                    className="h-10 w-10 rounded-full border object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </SocketProvider>
  );
}
