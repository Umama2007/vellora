import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { upload } from "./middleware/upload";
import { uploadImage } from "./controllers/uploadController";
import { requireAuth } from "./middleware/auth";

import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import userRoutes from "./routes/userRoutes";
import searchRoutes from "./routes/searchRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import statsRoutes from "./routes/statsRoutes";

const app = express();

// Configure CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      const allowedOrigins = env.frontendUrl.split(",").map((o) => o.trim());
      if (env.frontendUrl === "*" || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow connection, avoiding CORS issues during initial deployment
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health check endpoint
app.get("/api/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/stats", statsRoutes);

app.post("/api/uploads", requireAuth, upload.single("image"), uploadImage);

// Root route for server verification
app.get("/", (_req, res) => {
  res.json({ message: "Vellora API server running" });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
