import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request } from "express";

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${crypto.randomUUID()}${ext}`;
    cb(null, name);
  },
});

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

export { UPLOAD_DIR };
