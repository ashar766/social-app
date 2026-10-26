
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
      <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6 dark:border-white/10 dark:bg-[#0a0a0a]/95">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href="/posts"
            className="shrink-0 text-xl font-bold tracking-tight text-gray-950 transition-opacity hover:opacity-70 dark:text-white sm:text-2xl"
          >
            Social
          </Link>

          <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:w-auto">
            <Link
              href="/posts"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-100 px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-200 dark:bg-white/[0.08] dark:text-gray-100 dark:hover:bg-white/[0.14]"
            >
              Posts
            </Link>

            <Link
              href="/create-post"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-700 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              + Create
            </Link>
          </div>

          <div className="order-2 min-w-0 flex-1 sm:order-none sm:min-w-[180px] sm:max-w-sm">
            <UserSearch />
          </div>

          <div className="ml-auto flex shrink-0 items-center">
            {currentUser && (
              <Link
                href={`/profile/${currentUser.username}`}
                aria-label="Your profile"
                title="Your profile"
                className="rounded-full ring-offset-2 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
              >
                {currentUser.image ? (
                  <img
                    src={currentUser.image}
                    alt={`${currentUser.name}'s profile`}
                    className="h-10 w-10 rounded-full border border-gray-200 object-cover dark:border-white/20"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-700 dark:border-white/20 dark:bg-white/10 dark:text-gray-100">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[#fafafa] text-gray-950 dark:bg-[#0a0a0a] dark:text-gray-100">
        {children}
      </main>
    </SocketProvider>
  );
}
