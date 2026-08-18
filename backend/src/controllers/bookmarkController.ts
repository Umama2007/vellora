import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { param } from "../utils/params";
import { serializePublicUser } from "../utils/serializers";

export async function bookmarkPost(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const postId = param(req, "id");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw Errors.notFound("Post not found");

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) {
      await prisma.bookmark.create({ data: { userId, postId } });
    }

    return ok(res, { bookmarked: true });
  } catch (err) {
    next(err);
  }
}

export async function removeBookmark(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const postId = param(req, "id");
    await prisma.bookmark.deleteMany({ where: { userId, postId } });
    return ok(res, { bookmarked: false });
  } catch (err) {
    next(err);
  }
}

export async function listMyBookmarks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));

    const [bookmarks, total] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId },
        include: {
          post: {
            include: {
              author: true,
              tags: { include: { tag: true } },
              _count: { select: { likes: true, comments: true, bookmarks: true } },
              likes: { where: { userId }, select: { userId: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bookmark.count({ where: { userId } }),
    ]);

    const posts = bookmarks.map((b) => ({
      id: b.post.id,
      title: b.post.title,
      excerpt: b.post.excerpt,
      coverImage: b.post.coverImage,
      category: b.post.category,
      createdAt: b.post.createdAt,
      readTimeMin: b.post.readTimeMin,
      tags: b.post.tags.map((pt) => pt.tag.name),
      author: serializePublicUser(b.post.author),
      likeCount: b.post._count.likes,
      commentCount: b.post._count.comments,
      likedByViewer: b.post.likes.length > 0,
      bookmarkedByViewer: true,
    }));

    return ok(res, { posts, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
}
