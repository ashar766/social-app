import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "./lib/socket";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer);
  setIO(io);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-user-room", (userId: string) => {
      socket.join(`user:${userId}`);

      console.log(`User ${socket.id} joined room: user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
