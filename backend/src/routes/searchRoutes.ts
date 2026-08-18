import { Router } from "express";
import { search } from "../controllers/searchController";
import { validateQuery } from "../middleware/validate";
import { searchQuerySchema } from "../validators/post";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, validateQuery(searchQuerySchema), search);

export default router;
