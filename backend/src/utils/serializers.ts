import { User } from "@prisma/client";

/** Never send passwordHash to the client. This is the only place that
 * should read raw User rows for output — every controller should route
 * through here. */
export function serializeUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    location: user.location,
    isPrivate: user.isPrivate,
    notifyOnLike: user.notifyOnLike,
    notifyOnComment: user.notifyOnComment,
    notifyOnFollow: user.notifyOnFollow,
    currentStreak: user.currentStreak,
    longestStreak: user.longestStreak,
    createdAt: user.createdAt,
  };
}

export function serializePublicUser(user: User) {
  const { email, ...rest } = serializeUser(user);
  return rest;
}
