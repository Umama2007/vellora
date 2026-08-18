import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AUTH_COOKIE_NAME, verifyAuthToken } from "../utils/token";
import { Errors } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function extractToken(req: Request): string | undefined {
  if (req.cookies?.[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.slice(7).trim();
    }
    return authHeader.trim();
  }
  return undefined;
}

/** Requires a valid, logged-in user. Rejects with 401 otherwise. */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractToken(req);
    if (!token) throw Errors.unauthorized();

    const payload = verifyAuthToken(token);
    if (!payload) throw Errors.unauthorized("Your session has expired. Please log in again.");

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw Errors.unauthorized();

    req.userId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}

/** Loads the user if logged in, but does not reject anonymous requests. */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const payload = verifyAuthToken(token);
    if (payload) {
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (user) req.userId = user.id;
    }
  }
  next();
}
