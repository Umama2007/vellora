import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/response";
import multer from "multer";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ success: false, error: err.message });
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    return res.status(422).json({ success: false, error: message });
  }

  // Prisma unique constraint violation
  if (typeof err === "object" && err !== null && "code" in err && (err as any).code === "P2002") {
    return res.status(409).json({ success: false, error: "That value is already taken." });
  }

  // Multer errors (file too large, etc.)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Custom file format validation error
  if (err instanceof Error && err.message.includes("images are allowed")) {
    return res.status(400).json({ success: false, error: err.message });
  }

  console.error("Unhandled error:", err);
  const errorMessage = process.env.NODE_ENV === "development"
    ? (err instanceof Error ? err.message : String(err))
    : "Something went wrong on our end.";
  return res.status(500).json({ success: false, error: errorMessage });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: "Route not found" });
}
