import http from "http";
import cookie from "cookie";
import { Server } from "socket.io";
import { env } from "./config/env";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "./utils/token";
import { prisma } from "./config/prisma";
import { setIO } from "./config/socket";
import app from "./app";


const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.frontendUrl, credentials: true },
});
setIO(io);

// Real authentication on the socket handshake — the same JWT cookie used
// by the REST API, not a fake "trust whoever connects" model. A socket
// that fails this never gets a userId and is disconnected immediately.
io.use((socket, next) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) return next(new Error("Not authenticated"));

    const parsed = cookie.parse(rawCookie);
    const token = parsed[AUTH_COOKIE_NAME];
    if (!token) return next(new Error("Not authenticated"));

    const payload = verifyAuthToken(token);
    if (!payload) return next(new Error("Not authenticated"));

    (socket as any).userId = payload.userId;
    next();
  } catch {
    next(new Error("Not authenticated"));
  }
});

io.on("connection", (socket) => {
  const userId = (socket as any).userId as string;

  // Join a personal room so we can push notifications straight to this
  // user later without needing to know which conversation rooms they're in.
  socket.join(`user:${userId}`);

  // Client asks to join a conversation room only after the REST API has
  // already confirmed (via assertMembership in conversationController)
  // that they're a real member — this is just for delivery, not auth.
  // We re-verify membership here too, since a socket could ask to join
  // any room string it wants.
  socket.on("conversation:join", async (conversationId: string) => {
    if (typeof conversationId !== "string") return;
    const membership = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });
    if (membership) {
      socket.join(`conversation:${conversationId}`);
    }
  });

  socket.on("conversation:leave", (conversationId: string) => {
    if (typeof conversationId === "string") socket.leave(`conversation:${conversationId}`);
  });
});

httpServer.listen(env.port, () => {
  console.log(`Vellora API listening on http://localhost:${env.port}`);
  console.log(`Socket.IO ready for real-time messaging`);
  console.log(`Accepting requests from ${env.frontendUrl}`);
});
