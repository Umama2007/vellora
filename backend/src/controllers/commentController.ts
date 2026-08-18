import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { serializePublicUser } from "../utils/serializers";
import { param } from "../utils/params";
import { createNotification } from "../services/notificationService";
import { recordActivity } from "../services/streakService";
import { checkAndAwardAchievements } from "../services/achievementService";

function serializeComment(comment: any, viewerId?: string) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: serializePublicUser(comment.author),
    likeCount: comment._count?.likes ?? 0,
    likedByViewer: viewerId ? comment.likes?.some((l: any) => l.userId === viewerId) : false,
  };
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = param(req, "id");
    const viewerId = req.userId;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        include: {
          author: true,
          _count: { select: { likes: true } },
          ...(viewerId ? { likes: { where: { userId: viewerId } } } : {}),
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where: { postId } }),
    ]);

    return ok(res, {
      comments: comments.map((c) => serializeComment(c, viewerId)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const postId = param(req, "id");
    const authorId = req.userId!;
    const { content } = req.body;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.notFound("Post not found");

    const comment = await prisma.comment.create({
      data: { postId, authorId, content },
      include: { author: true, _count: { select: { likes: true } } },
    });

    await createNotification({ recipientId: post.authorId, actorId: authorId, type: "COMMENT", postId });
    await recordActivity(authorId);
    await checkAndAwardAchievements(authorId);

    return ok(res, serializeComment(comment, authorId), 201);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: param(req, "commentId") } });
    if (!comment) throw Errors.notFound("Comment not found");
    if (comment.authorId !== req.userId) throw Errors.forbidden("You can only delete your own comments.");

    await prisma.comment.delete({ where: { id: comment.id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
