import { Router } from "express";
import * as postController from "../controllers/postController";
import * as likeController from "../controllers/likeController";
import * as commentController from "../controllers/commentController";
import * as bookmarkController from "../controllers/bookmarkController";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../middleware/validate";
import { createPostSchema, updatePostSchema, listPostsQuerySchema } from "../validators/post";
import { createCommentSchema, paginationQuerySchema } from "../validators/common";

const router = Router();

router.get("/", optionalAuth, validateQuery(listPostsQuerySchema), postController.listPosts);
router.get("/:id", optionalAuth, postController.getPost);
router.post("/", requireAuth, validateBody(createPostSchema), postController.createPost);
router.patch("/:id", requireAuth, validateBody(updatePostSchema), postController.updatePost);
router.delete("/:id", requireAuth, postController.deletePost);

router.post("/:id/like", requireAuth, likeController.likePost);
router.delete("/:id/like", requireAuth, likeController.unlikePost);

router.post("/:id/bookmark", requireAuth, bookmarkController.bookmarkPost);
router.delete("/:id/bookmark", requireAuth, bookmarkController.removeBookmark);

router.get(
  "/:id/comments",
  optionalAuth,
  validateQuery(paginationQuerySchema),
  commentController.listComments
);
router.post(
  "/:id/comments",
  requireAuth,
  validateBody(createCommentSchema),
  commentController.createComment
);

export default router;
