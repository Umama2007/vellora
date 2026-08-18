import { Router } from "express";
import * as conversationController from "../controllers/conversationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, conversationController.listConversations);
router.post("/start/:username", requireAuth, conversationController.startConversation);
router.get("/:id/messages", requireAuth, conversationController.getMessages);
router.post("/:id/messages", requireAuth, conversationController.sendMessage);
router.patch("/:id/read", requireAuth, conversationController.markConversationRead);

export default router;
