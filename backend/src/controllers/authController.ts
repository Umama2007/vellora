import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "../utils/token";
import { ok, Errors } from "../utils/response";
import { serializeUser } from "../utils/serializers";

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, username, email, password } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw Errors.conflict("An account with that email already exists.");

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) throw Errors.conflict("That username is already taken.");

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, username, email, passwordHash },
    });

    const token = signAuthToken({ userId: user.id });
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    return ok(res, serializeUser(user), 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }],
      },
    });

    // Same error for "no user" and "wrong password" — don't leak which
    // one it was, that would help an attacker enumerate valid emails.
    if (!user) throw Errors.unauthorized("Incorrect email/username or password.");

    const validPassword = await verifyPassword(user.passwordHash, password);
    if (!validPassword) throw Errors.unauthorized("Incorrect email/username or password.");

    const token = signAuthToken({ userId: user.id });
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions);

    return ok(res, serializeUser(user));
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  return ok(res, { loggedOut: true });
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) throw Errors.unauthorized();
    return ok(res, serializeUser(user));
  } catch (err) {
    next(err);
  }
}
