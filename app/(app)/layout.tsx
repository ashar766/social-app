import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { auth } from "@/lib/auth";
import SocketProvider from "./components/SocketProvider";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SocketProvider>
      <nav className="border-b p-4">
        <div className="flex gap-6">
          <Link href="/posts">Posts</Link>
          <Link href="/create-post">Create Post</Link>
          <Link href="/search/users">Search Users</Link>
          {session?.user?.username && (
            <Link href={`/profile/${session.user.username}`}>Profile</Link>
          )}
          <LogoutButton />
        </div>
      </nav>

      <main>{children}</main>
    </SocketProvider>
  );
}
