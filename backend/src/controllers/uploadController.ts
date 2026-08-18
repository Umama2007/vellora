import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";
import { ok, Errors } from "../utils/response";
import { env } from "../config/env";

cloudinary.config({
  cloud_name: env.cloudinaryCloudName,
  api_key: env.cloudinaryApiKey,
  api_secret: env.cloudinaryApiSecret,
});

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw Errors.badRequest("No file was uploaded.");

    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
      throw Errors.badRequest(
        "Cloudinary credentials are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment variables."
      );
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "vellora", resource_type: "auto" },
        (error, result) => {
          if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
          resolve(result);
        }
      );
      uploadStream.end(req.file!.buffer);
    });

    return ok(res, { url: result.secure_url }, 201);
  } catch (err) {
    next(err);
  }
}
