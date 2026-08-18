import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { ok, Errors } from "../utils/response";
import { getAchievementsForUser } from "../services/achievementService";
import { param } from "../utils/params";

export async function getUserAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    const username = param(req, "username");
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw Errors.notFound("User not found");

    const achievements = await getAchievementsForUser(user.id);
    return ok(res, achievements);
  } catch (err) {
    next(err);
  }
}
