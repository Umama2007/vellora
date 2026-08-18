import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok } from "../utils/response";

export async function getStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [userCount, publishedPostCount, commentCount] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.comment.count(),
    ]);

    return ok(res, { userCount, publishedPostCount, commentCount });
  } catch (err) {
    next(err);
  }
}
