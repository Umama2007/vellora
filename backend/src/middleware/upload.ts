import multer from "multer";
import { Request } from "express";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB (fits within Vercel's 4.5MB payload limit)

const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed."));
    return;
  }
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});
