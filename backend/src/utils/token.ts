import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthTokenPayload {
  userId: string;
}

const TOKEN_TTL = "7d";
export const AUTH_COOKIE_NAME = "vellora_token";

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export const authCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: (env.isProduction ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches TOKEN_TTL
  path: "/",
};
