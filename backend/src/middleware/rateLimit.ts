import { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Simple fixed-window rate limiter keyed by IP. Good enough for a single
 * backend instance; swap for a Redis-backed limiter before scaling out
 * to multiple server processes.
 */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= max) {
      return res.status(429).json({
        success: false,
        error: "Too many attempts. Please wait a moment and try again.",
      });
    }

    bucket.count += 1;
    next();
  };
}
