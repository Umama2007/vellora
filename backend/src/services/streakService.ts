import { prisma } from "../config/prisma";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(prev: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(prev, yesterday);
}

/**
 * Called whenever a user does something that should count toward their
 * streak (publishing a post, commenting). Reads real activity history —
 * there is no fake/simulated streak counter here.
 */
export async function recordActivity(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const now = new Date();
  const last = user.lastActiveDate;

  let currentStreak = user.currentStreak;

  if (!last) {
    currentStreak = 1;
  } else if (isSameDay(last, now)) {
    // Already counted today, streak unchanged.
    return;
  } else if (isYesterday(last, now)) {
    currentStreak += 1;
  } else {
    currentStreak = 1; // streak broken, restart
  }

  const longestStreak = Math.max(user.longestStreak, currentStreak);

  await prisma.user.update({
    where: { id: userId },
    data: { currentStreak, longestStreak, lastActiveDate: now },
  });
}
