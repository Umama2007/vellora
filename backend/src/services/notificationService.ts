import { prisma } from "../config/prisma";
import { NotificationType } from "@prisma/client";

export async function createNotification(params: {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string;
}) {
  // Don't notify yourself (e.g. liking or commenting on your own post).
  if (params.recipientId === params.actorId) return;

  const recipient = await prisma.user.findUnique({
    where: { id: params.recipientId },
    select: { notifyOnLike: true, notifyOnComment: true, notifyOnFollow: true },
  });

  if (!recipient) return;

  if (params.type === "LIKE" && !recipient.notifyOnLike) return;
  if (params.type === "COMMENT" && !recipient.notifyOnComment) return;
  if (params.type === "FOLLOW" && !recipient.notifyOnFollow) return;

  await prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      actorId: params.actorId,
      type: params.type,
      postId: params.postId,
    },
  });
}
