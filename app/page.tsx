import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Social App</h1>

        <p className="mb-8 text-gray-600">
          Connect, share posts, and follow people.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/login" className="rounded border px-6 py-3">
            Login
          </Link>

          <Link href="/signup" className="rounded border px-6 py-3">
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
