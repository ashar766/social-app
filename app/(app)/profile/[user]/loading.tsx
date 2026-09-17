export default function Loading() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="animate-pulse">
        <div className="flex items-center gap-6 border-b pb-6">
          <div className="h-24 w-24 rounded-full bg-gray-200" />

          <div>
            <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
            <div className="h-4 w-28 rounded bg-gray-200" />
          </div>
        </div>

        <div className="mt-6 h-6 w-24 rounded bg-gray-200" />
      </div>
    </main>
  );
}
