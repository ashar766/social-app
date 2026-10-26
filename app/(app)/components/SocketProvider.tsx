"use client";

import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.id) {
      console.log("NO SESSION USER");
      return;
    }

    console.log("CONNECTING SOCKET FOR USER:", session.user.id);

    const socket = io();

    socket.on("connect", () => {
      console.log("SOCKET CONNECTED:", socket.id);

      socket.emit("join-user-room", session.user.id);

      console.log("JOINED ROOM:", `user:${session.user.id}`);
    });

    socket.on("follow-request", (data) => {
      console.log("FOLLOW REQUEST RECEIVED:", data);

      router.refresh();
    });

    socket.on("follow-accepted", () => {
      console.log("FOLLOW ACCEPTED");

      router.refresh();
    });

    socket.on("post-liked", (data) => {
      console.log("POST LIKED:", data);

      router.refresh();
    });

    socket.on("post-unliked", (data) => {
      console.log("POST UNLIKED:", data);

      router.refresh();
    });

    socket.on("post-commented", (data) => {
      console.log("POST COMMENTED:", data);

      router.refresh();
    });

    socket.on("disconnect", () => {
      console.log("SOCKET DISCONNECTED");
    });

    return () => {
      socket.disconnect();
    };
  }, [session?.user?.id, router]);

  return children;
}
