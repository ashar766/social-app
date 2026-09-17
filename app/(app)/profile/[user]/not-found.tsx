export default function NotFound() {
  return (
    <main className="flex min-h-[50vh] flex-col items-center justify-center p-6">
      <h1 className="mb-2 text-3xl font-bold">Profile Not Found</h1>

      <p className="text-gray-500">
        The user you're looking for doesn't exist.
      </p>
    </main>
  );
}
