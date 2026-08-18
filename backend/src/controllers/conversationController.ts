import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { serializePublicUser } from "../utils/serializers";
import { param } from "../utils/params";
import { getIO } from "../config/socket";

/** Only members of a conversation may read or post in it. Every handler
 * below re-checks this — a URL guess alone can never grant access. */
async function assertMembership(conversationId: string, userId: string) {
  const membership = await prisma.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) throw Errors.forbidden("You don't have access to this conversation.");
  return membership;
}

export async function listConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;

    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            members: { include: { user: true } },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
      },
      orderBy: { conversation: { updatedAt: "desc" } },
    });

    const result = await Promise.all(
      memberships.map(async (m) => {
        const other = m.conversation.members.find((mem) => mem.userId !== userId);
        const lastMessage = m.conversation.messages[0] ?? null;
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: m.conversationId,
            senderId: { not: userId },
            createdAt: { gt: m.lastReadAt },
          },
        });

        return {
          id: m.conversation.id,
          otherUser: other ? serializePublicUser(other.user) : null,
          lastMessage: lastMessage
            ? { content: lastMessage.content, createdAt: lastMessage.createdAt, fromMe: lastMessage.senderId === userId }
            : null,
          unreadCount,
          updatedAt: m.conversation.updatedAt,
        };
      })
    );

    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

/** Finds an existing 1:1 conversation with the target user, or creates one. */
export async function startConversation(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const targetUsername = param(req, "username");

    const target = await prisma.user.findUnique({ where: { username: targetUsername } });
    if (!target) throw Errors.notFound("User not found");
    if (target.id === userId) throw Errors.badRequest("You can't message yourself.");

    const membersKey = [userId, target.id].sort().join("_");

    const existing = await prisma.conversation.findUnique({
      where: { membersKey },
    });

    if (existing) {
      return ok(res, { id: existing.id });
    }

    try {
      const conversation = await prisma.conversation.create({
        data: {
          membersKey,
          members: {
            create: [{ userId }, { userId: target.id }],
          },
        },
      });

      return ok(res, { id: conversation.id }, 201);
    } catch (err: any) {
      // Handle unique constraint violation (P2002) in concurrent races
      if (err.code === "P2002") {
        const retry = await prisma.conversation.findUnique({
          where: { membersKey },
        });
        if (retry) {
          return ok(res, { id: retry.id });
        }
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const conversationId = param(req, "id");
    await assertMembership(conversationId, userId);

    const { page = 1, limit = 50 } = req.query as any;
    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      orderBy: { createdAt: "asc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    return ok(
      res,
      messages.map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        sender: serializePublicUser(m.sender),
        fromMe: m.senderId === userId,
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function markConversationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const conversationId = param(req, "id");
    await assertMembership(conversationId, userId);

    await prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    return ok(res, { read: true });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const conversationId = param(req, "id");
    const { content } = req.body;

    if (!content || !content.trim()) throw Errors.badRequest("Message can't be empty.");

    await assertMembership(conversationId, userId);

    // Real persistence first — the message exists in PostgreSQL before
    // anyone is told it sent. Socket.IO broadcast below is purely for
    // instant delivery to already-connected clients; a disconnected
    // recipient still sees the message via GET /messages on reconnect.
    const message = await prisma.message.create({
      data: { conversationId, senderId: userId, content: content.trim() },
      include: { sender: true },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const payload = {
      id: message.id,
      conversationId,
      content: message.content,
      createdAt: message.createdAt,
      sender: serializePublicUser(message.sender),
    };

    getIO().to(`conversation:${conversationId}`).emit("message:new", payload);

    return ok(res, { ...payload, fromMe: true }, 201);
  } catch (err) {
    next(err);
  }
}
