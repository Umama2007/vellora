import { Router } from "express";
import * as userController from "../controllers/userController";
import * as bookmarkController from "../controllers/bookmarkController";
import { getUserAchievements } from "../controllers/achievementController";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { updateProfileSchema, paginationQuerySchema } from "../validators/common";

const router = Router();

router.get("/leaderboard", userController.getLeaderboard);
router.get(
  "/me/bookmarks",
  requireAuth,
  validateQuery(paginationQuerySchema),
  bookmarkController.listMyBookmarks
);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), userController.updateMyProfile);

router.get("/:username", optionalAuth, userController.getProfile);
router.get("/:username/achievements", getUserAchievements);
router.get("/:username/followers", userController.listFollowers);
router.get("/:username/following", userController.listFollowing);
router.post("/:username/follow", requireAuth, userController.followUser);
router.delete("/:username/follow", requireAuth, userController.unfollowUser);

export default router;
