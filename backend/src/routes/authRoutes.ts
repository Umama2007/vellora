import { Router } from "express";
import * as authController from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { signupSchema, loginSchema } from "../validators/auth";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/signup", authRateLimit, validateBody(signupSchema), authController.signup);
router.post("/login", authRateLimit, validateBody(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
