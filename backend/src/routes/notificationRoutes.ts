import { Router } from "express";
import * as notificationController from "../controllers/notificationController";
import { requireAuth } from "../middleware/auth";
import { validateQuery } from "../middleware/validate";
import { paginationQuerySchema } from "../validators/common";

const router = Router();

router.get("/", requireAuth, validateQuery(paginationQuerySchema), notificationController.listNotifications);
router.patch("/read-all", requireAuth, notificationController.markAllRead);
router.patch("/:id/read", requireAuth, notificationController.markRead);

export default router;
