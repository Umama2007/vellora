import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok } from "../utils/response";
import { serializePublicUser } from "../utils/serializers";

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string) || "";
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const viewerId = req.userId;

    const allowedAuthorsFilter: any = [
      { author: { isPrivate: false } }
    ];
    if (viewerId) {
      const followed = await prisma.follow.findMany({
        where: { followerId: viewerId },
        select: { followingId: true },
      });
      const followedIds = followed.map((f) => f.followingId);
      allowedAuthorsFilter.push({ authorId: viewerId });
      allowedAuthorsFilter.push({ authorId: { in: followedIds } });
    }

    const allowedVisibilityFilter: any = [
      { visibility: "PUBLIC" as const }
    ];
    if (viewerId) {
      allowedVisibilityFilter.push({ authorId: viewerId });
    }

    const searchFilter = {
      published: true,
      AND: [
        { OR: allowedVisibilityFilter },
        { OR: allowedAuthorsFilter },
        {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
            { tags: { some: { tag: { name: { contains: q, mode: "insensitive" as const } } } } },
            { author: { name: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      ]
    };

    const [posts, users, total] = await Promise.all([
      prisma.post.findMany({
        where: searchFilter,
        include: {
          author: true,
          tags: { include: { tag: true } },
          _count: { select: { likes: true, comments: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.post.count({
        where: searchFilter,
      }),
    ]);

    return ok(res, {
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        coverImage: p.coverImage,
        createdAt: p.createdAt,
        author: serializePublicUser(p.author),
        tags: p.tags.map((pt) => pt.tag.name),
        likeCount: p._count.likes,
        commentCount: p._count.comments,
      })),
      users: users.map(serializePublicUser),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}
