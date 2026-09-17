import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <nav className="border-b p-4">
        <div className="flex gap-6">
          <Link href="/posts">Posts</Link>
          <Link href="/create-post">Create Post</Link>
          <Link href="/search/users">Search Users</Link>

          <LogoutButton />
        </div>
      </nav>

      <main>{children}</main>
    </>
  );
}
