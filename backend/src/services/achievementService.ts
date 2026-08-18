import { prisma } from "../config/prisma";

/**
 * Achievement rules live here as code, not database rows, because they're
 * static definitions ("what counts as earning this badge"), not user data.
 * What IS stored in the database — in UserAchievement — is the actual,
 * permanent record of which user earned which badge and when, computed
 * from real activity below. Nothing here is awarded just because the
 * frontend displays it; every check hits real tables.
 */
export const ACHIEVEMENT_DEFINITIONS = [
  {
    key: "first_post",
    label: "First Post",
    description: "Publish your first post.",
    icon: "feather",
    check: (stats: Stats) => stats.publishedPostCount >= 1,
  },
  {
    key: "ten_posts",
    label: "10 Posts",
    description: "Publish 10 posts.",
    icon: "book",
    check: (stats: Stats) => stats.publishedPostCount >= 10,
  },
  {
    key: "week_streak",
    label: "7 Day Streak",
    description: "Reach a 7-day activity streak.",
    icon: "flame",
    // Uses longestStreak (not currentStreak) so the badge, once earned,
    // is never quietly revoked just because today's streak reset.
    check: (stats: Stats) => stats.longestStreak >= 7,
  },
  {
    key: "hundred_followers",
    label: "100 Followers",
    description: "Reach 100 followers.",
    icon: "users",
    check: (stats: Stats) => stats.followerCount >= 100,
  },
  {
    key: "engaged_writer",
    label: "50 Likes Received",
    description: "Receive 50 likes across your posts.",
    icon: "heart",
    check: (stats: Stats) => stats.likesReceived >= 50,
  },
] as const;

export type AchievementKey = (typeof ACHIEVEMENT_DEFINITIONS)[number]["key"];

interface Stats {
  publishedPostCount: number;
  longestStreak: number;
  followerCount: number;
  likesReceived: number;
}

async function getRealStats(userId: string): Promise<Stats> {
  const [user, publishedPostCount, followerCount, posts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.post.count({ where: { authorId: userId, published: true } }),
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.post.findMany({
      where: { authorId: userId, published: true },
      select: { _count: { select: { likes: true } } },
    }),
  ]);

  const likesReceived = posts.reduce((sum, p) => sum + p._count.likes, 0);

  return {
    publishedPostCount,
    longestStreak: user.longestStreak,
    followerCount,
    likesReceived,
  };
}

/**
 * Call this after any action that could newly qualify a user for a badge
 * (publishing, gaining a follower, a streak update, etc). Idempotent —
 * the unique(userId, key) constraint means calling it repeatedly never
 * creates duplicate awards.
 */
export async function checkAndAwardAchievements(userId: string) {
  const stats = await getRealStats(userId);
  const alreadyEarned = await prisma.userAchievement.findMany({
    where: { userId },
    select: { key: true },
  });
  const earnedKeys = new Set(alreadyEarned.map((a) => a.key));

  const newlyQualified = ACHIEVEMENT_DEFINITIONS.filter(
    (def) => !earnedKeys.has(def.key) && def.check(stats)
  );

  for (const def of newlyQualified) {
    await prisma.userAchievement.upsert({
      where: { userId_key: { userId, key: def.key } },
      update: {},
      create: { userId, key: def.key },
    });
  }
}

export async function getAchievementsForUser(userId: string) {
  const earned = await prisma.userAchievement.findMany({ where: { userId } });
  const earnedMap = new Map(earned.map((a) => [a.key, a.earnedAt]));

  return ACHIEVEMENT_DEFINITIONS.map((def) => ({
    key: def.key,
    label: def.label,
    description: def.description,
    icon: def.icon,
    earned: earnedMap.has(def.key),
    earnedAt: earnedMap.get(def.key) ?? null,
  }));
}
