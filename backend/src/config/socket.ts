import { Server } from "socket.io";

let io: Server | null = null;

export function setIO(instance: Server) {
  io = instance;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO server was not initialized yet.");
  return io;
}
