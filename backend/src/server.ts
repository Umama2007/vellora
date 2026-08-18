import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { upload } from "./middleware/upload";
import { uploadImage } from "./controllers/uploadController";
import { requireAuth } from "./middleware/auth";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "./utils/token";
import { prisma } from "./config/prisma";
import { setIO } from "./config/socket";

import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";
import searchRoutes from "./routes/searchRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import statsRoutes from "./routes/statsRoutes";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve locally uploaded images. Swap for a cloud storage URL in
// production by changing UPLOAD_DIR handling + uploadController.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stats", statsRoutes);

app.post("/api/uploads", requireAuth, upload.single("image"), uploadImage);

app.use(notFoundHandler);
app.use(errorHandler);

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
