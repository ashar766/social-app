"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>

      <p className="mb-4 text-gray-500">We couldn't load this profile.</p>

      <button
        onClick={() => reset()}
        className="rounded bg-black px-4 py-2 text-white"
      >
        Try Again
      </button>
    </main>
  );
}
