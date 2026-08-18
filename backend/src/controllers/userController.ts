import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { serializePublicUser, serializeUser } from "../utils/serializers";
import { param } from "../utils/params";
import { createNotification } from "../services/notificationService";
import { checkAndAwardAchievements } from "../services/achievementService";

async function withCounts(userId: string, viewerId?: string) {
  const isOwner = viewerId === userId;
  const visibilityFilter = isOwner ? {} : { visibility: "PUBLIC" as const };

  const [postCount, followerCount, followingCount] = await Promise.all([
    prisma.post.count({ where: { authorId: userId, published: true, ...visibilityFilter } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { postCount, followerCount, followingCount };
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { username: param(req, "username") } });
    if (!user) throw Errors.notFound("User not found");

    const counts = await withCounts(user.id, req.userId);

    let isFollowedByViewer = false;
    if (req.userId) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: req.userId, followingId: user.id } },
      });
      isFollowedByViewer = !!follow;
    }

    const isOwner = req.userId === user.id;
    if (user.isPrivate && !isOwner && !isFollowedByViewer) {
      return ok(res, {
        id: user.id,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isPrivate: true,
        ...counts,
        isFollowedByViewer,
      });
    }

    return ok(res, { ...serializePublicUser(user), ...counts, isFollowedByViewer });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId! },
      data: req.body,
    });
    return ok(res, serializeUser(user));
  } catch (err) {
    next(err);
  }
}

export async function followUser(req: Request, res: Response, next: NextFunction) {
  try {
    const followerId = req.userId!;
    const target = await prisma.user.findUnique({ where: { username: param(req, "username") } });
    if (!target) throw Errors.notFound("User not found");
    if (target.id === followerId) throw Errors.badRequest("You can't follow yourself.");

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: target.id } },
    });
    if (!existing) {
      await prisma.follow.create({ data: { followerId, followingId: target.id } });
      await createNotification({ recipientId: target.id, actorId: followerId, type: "FOLLOW" });
      await checkAndAwardAchievements(target.id);
    }

    const followerCount = await prisma.follow.count({ where: { followingId: target.id } });
    return ok(res, { following: true, followerCount });
  } catch (err) {
    next(err);
  }
}

export async function unfollowUser(req: Request, res: Response, next: NextFunction) {
  try {
    const followerId = req.userId!;
    const target = await prisma.user.findUnique({ where: { username: param(req, "username") } });
    if (!target) throw Errors.notFound("User not found");

    await prisma.follow.deleteMany({ where: { followerId, followingId: target.id } });
    const followerCount = await prisma.follow.count({ where: { followingId: target.id } });
    return ok(res, { following: false, followerCount });
  } catch (err) {
    next(err);
  }
}

export async function listFollowers(req: Request, res: Response, next: NextFunction) {
  try {
    const target = await prisma.user.findUnique({ where: { username: param(req, "username") } });
    if (!target) throw Errors.notFound("User not found");

    const follows = await prisma.follow.findMany({
      where: { followingId: target.id },
      include: { follower: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(res, follows.map((f) => serializePublicUser(f.follower)));
  } catch (err) {
    next(err);
  }
}

export async function listFollowing(req: Request, res: Response, next: NextFunction) {
  try {
    const target = await prisma.user.findUnique({ where: { username: param(req, "username") } });
    if (!target) throw Errors.notFound("User not found");

    const follows = await prisma.follow.findMany({
      where: { followerId: target.id },
      include: { following: true },
      orderBy: { createdAt: "desc" },
    });

    return ok(res, follows.map((f) => serializePublicUser(f.following)));
  } catch (err) {
    next(err);
  }
}

/** Real leaderboard, computed from actual posts/likes/comments — no
 * hardcoded point totals. */
export async function getLeaderboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      include: {
        posts: { where: { published: true }, select: { id: true, _count: { select: { likes: true, comments: true } } } },
      },
      take: 50,
    });

    const ranked = users
      .map((u) => {
        const postCount = u.posts.length;
        const likeTotal = u.posts.reduce((sum, p) => sum + p._count.likes, 0);
        const commentTotal = u.posts.reduce((sum, p) => sum + p._count.comments, 0);
        // Simple, transparent scoring: posts count more than engagement
        // they cause, but real engagement still matters.
        const points = postCount * 50 + likeTotal * 5 + commentTotal * 8;
        return { user: serializePublicUser(u), points, postCount };
      })
      .filter((entry) => entry.points > 0)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    return ok(res, ranked);
  } catch (err) {
    next(err);
  }
}
