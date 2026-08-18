import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { param } from "../utils/params";
import { serializePublicUser } from "../utils/serializers";

function serializeNotification(n: any) {
  return {
    id: n.id,
    type: n.type,
    read: n.read,
    createdAt: n.createdAt,
    actor: serializePublicUser(n.actor),
    postId: n.postId,
  };
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 20));
    const recipientId = req.userId!;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId },
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { recipientId } }),
      prisma.notification.count({ where: { recipientId, read: false } }),
    ]);

    return ok(res, {
      notifications: notifications.map(serializeNotification),
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: param(req, "id") } });
    if (!notification) throw Errors.notFound("Notification not found");
    if (notification.recipientId !== req.userId) throw Errors.forbidden();

    await prisma.notification.update({ where: { id: notification.id }, data: { read: true } });
    return ok(res, { read: true });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { recipientId: req.userId!, read: false },
      data: { read: true },
    });
    return ok(res, { allRead: true });
  } catch (err) {
    next(err);
  }
}
