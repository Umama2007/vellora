import { Router } from "express";
import * as commentController from "../controllers/commentController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.delete("/:commentId", requireAuth, commentController.deleteComment);

export default router;
