import type { Server } from "socket.io";

declare global {
  var socketIO: Server | undefined;
}

export function setIO(server: Server) {
  globalThis.socketIO = server;
}

export function getIO() {
  return globalThis.socketIO;
}
