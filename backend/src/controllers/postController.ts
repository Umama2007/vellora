import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { serializePublicUser } from "../utils/serializers";
import { param } from "../utils/params";
import { recordActivity } from "../services/streakService";
import { checkAndAwardAchievements } from "../services/achievementService";

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Shape a Post row (with relations already included) for API output. */
function serializePost(post: any, viewerId?: string) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    category: post.category,
    published: post.published,
    visibility: post.visibility,
    readTimeMin: post.readTimeMin,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt,
    tags: post.tags?.map((pt: any) => pt.tag.name) ?? [],
    author: serializePublicUser(post.author),
    likeCount: post._count?.likes ?? 0,
    commentCount: post._count?.comments ?? 0,
    bookmarkCount: post._count?.bookmarks ?? 0,
    likedByViewer: viewerId ? post.likes?.some((l: any) => l.userId === viewerId) : false,
    bookmarkedByViewer: viewerId
      ? post.bookmarks?.some((b: any) => b.userId === viewerId)
      : false,
  };
}

const postInclude = (viewerId?: string) => ({
  author: true,
  tags: { include: { tag: true } },
  _count: { select: { likes: true, comments: true, bookmarks: true } },
  ...(viewerId
    ? {
        likes: { where: { userId: viewerId }, select: { userId: true } },
        bookmarks: { where: { userId: viewerId }, select: { userId: true } },
      }
    : {}),
});

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, authorId, authorUsername, following, sort } = req.query as any;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const viewerId = req.userId;

    const where: any = { published: true };
    if (category && category !== "All") where.category = category;
    if (authorId) where.authorId = authorId;
    if (authorUsername) where.author = { username: authorUsername };

    // Enforce private posts visibility.
    let isViewingOwnPosts = false;
    if (viewerId) {
      if (authorId === viewerId) {
        isViewingOwnPosts = true;
      } else if (authorUsername) {
        const authorUser = await prisma.user.findUnique({
          where: { username: authorUsername },
          select: { id: true },
        });
        if (authorUser && authorUser.id === viewerId) {
          isViewingOwnPosts = true;
        }
      }
    }
    if (!isViewingOwnPosts) {
      where.visibility = "PUBLIC";
    }

    // Enforce private profiles server-side.
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
    where.AND = [
      { OR: allowedAuthorsFilter }
    ];

    if (following) {
      if (!viewerId) throw Errors.unauthorized("Log in to see posts from people you follow.");
      const followedIds = await prisma.follow.findMany({
        where: { followerId: viewerId },
        select: { followingId: true },
      });
      where.authorId = { in: followedIds.map((f) => f.followingId) };
    }

    const orderBy =
      sort === "top" ? [{ likes: { _count: "desc" as const } }] : [{ publishedAt: "desc" as const }];

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: postInclude(viewerId),
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    return ok(res, {
      posts: posts.map((p) => serializePost(p, viewerId)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const viewerId = req.userId;
    const post = await prisma.post.findUnique({
      where: { id: param(req, "id") },
      include: postInclude(viewerId),
    });
    if (!post) throw Errors.notFound("Post not found");

    // Only the author can view an unpublished draft.
    if (!post.published && post.authorId !== viewerId) {
      throw Errors.notFound("Post not found");
    }

    // Enforce private posts visibility.
    if (post.visibility === "PRIVATE" && post.authorId !== viewerId) {
      throw Errors.notFound("Post not found");
    }

    // Enforce private profiles server-side.
    if (post.published) {
      const author = await prisma.user.findUnique({
        where: { id: post.authorId },
        select: { isPrivate: true },
      });
      if (author?.isPrivate && post.authorId !== viewerId) {
        let isFollower = false;
        if (viewerId) {
          const follow = await prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: post.authorId } },
          });
          isFollower = !!follow;
        }
        if (!isFollower) {
          throw Errors.forbidden("This account is private.");
        }
      }
    }

    return ok(res, serializePost(post, viewerId));
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content, excerpt, coverImage, category, tags, published, visibility } = req.body;
    const authorId = req.userId!;

    const post = await prisma.post.create({
      data: {
        authorId,
        title,
        content,
        excerpt: excerpt || content.slice(0, 160),
        coverImage,
        category,
        published,
        visibility,
        publishedAt: published ? new Date() : null,
        readTimeMin: estimateReadTime(content),
        tags: {
          create: await Promise.all(
            tags.map(async (name: string) => {
              const tag = await prisma.tag.upsert({
                where: { name },
                create: { name },
                update: {},
              });
              return { tagId: tag.id };
            })
          ),
        },
      },
      include: postInclude(authorId),
    });

    if (published) {
      await recordActivity(authorId);
      await checkAndAwardAchievements(authorId);
    }

    return ok(res, serializePost(post, authorId), 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: param(req, "id") } });
    if (!existing) throw Errors.notFound("Post not found");
    if (existing.authorId !== req.userId) throw Errors.forbidden("You can only edit your own posts.");

    const { title, content, excerpt, coverImage, category, tags, published, visibility } = req.body;
    const wasPublished = existing.published;

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) {
      data.content = content;
      data.readTimeMin = estimateReadTime(content);
    }
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (coverImage !== undefined) data.coverImage = coverImage;
    if (category !== undefined) data.category = category;
    if (published !== undefined) {
      data.published = published;
      if (published && !wasPublished) data.publishedAt = new Date();
    }
    if (visibility !== undefined) data.visibility = visibility;

    if (tags !== undefined) {
      await prisma.postTag.deleteMany({ where: { postId: existing.id } });
      data.tags = {
        create: await Promise.all(
          tags.map(async (name: string) => {
            const tag = await prisma.tag.upsert({ where: { name }, create: { name }, update: {} });
            return { tagId: tag.id };
          })
        ),
      };
    }

    const post = await prisma.post.update({
      where: { id: existing.id },
      data,
      include: postInclude(req.userId),
    });

    if (published && !wasPublished) {
      await recordActivity(req.userId!);
      await checkAndAwardAchievements(req.userId!);
    }

    return ok(res, serializePost(post, req.userId));
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.post.findUnique({ where: { id: param(req, "id") } });
    if (!existing) throw Errors.notFound("Post not found");
    if (existing.authorId !== req.userId) throw Errors.forbidden("You can only delete your own posts.");

    await prisma.post.delete({ where: { id: existing.id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
