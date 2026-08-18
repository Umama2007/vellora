import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { param } from "../utils/params";
import { createNotification } from "../services/notificationService";
import { checkAndAwardAchievements } from "../services/achievementService";

export async function likePost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const postId = param(req, "id");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.notFound("Post not found");

    // The unique(userId, postId) constraint is the real source of truth
    // here — this check just gives a cleaner response instead of a raw
    // constraint-violation error when someone double-clicks.
    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      const count = await prisma.like.count({ where: { postId } });
      return ok(res, { liked: true, likeCount: count });
    }

    await prisma.like.create({ data: { userId, postId } });
    await createNotification({ recipientId: post.authorId, actorId: userId, type: "LIKE", postId });
    await checkAndAwardAchievements(post.authorId);

    const count = await prisma.like.count({ where: { postId } });
    return ok(res, { liked: true, likeCount: count });
  } catch (err) {
    next(err);
  }
}

export async function unlikePost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const postId = param(req, "id");

    await prisma.like.deleteMany({ where: { userId, postId } });
    const count = await prisma.like.count({ where: { postId } });
    return ok(res, { liked: false, likeCount: count });
  } catch (err) {
    next(err);
  }
}
