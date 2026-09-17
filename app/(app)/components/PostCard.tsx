import Image from "next/image";

type PostCardProps = {
  post: {
    id: string;
    caption: string | null;
    imageUrl: string;
    category: string | null;
    author: {
      username: string;
      name: string;
    };
  };
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border">
      <div className="p-4">
        <p className="font-bold">@{post.author.username}</p>
        <p className="text-sm text-gray-500">{post.author.name}</p>
      </div>

      <div className="relative aspect-square">
        <Image
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <div className="p-4">
        {post.caption && <p>{post.caption}</p>}

        {post.category && (
          <p className="mt-2 text-sm text-gray-500">#{post.category}</p>
        )}
      </div>
    </article>
  );
}
