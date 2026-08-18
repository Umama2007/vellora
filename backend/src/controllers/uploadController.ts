import { Request, Response, NextFunction } from "express";
import { ok, Errors } from "../utils/response";

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw Errors.badRequest("No file was uploaded.");
    // Files are served statically from /uploads (see server.ts). In
    // production, point this at your cloud storage's public URL instead.
    const url = `/uploads/${req.file.filename}`;
    return ok(res, { url }, 201);
  } catch (err) {
    next(err);
  }
}
