import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment can't be empty").max(2000),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(300).optional(),
  location: z.string().trim().max(80).optional(),
  avatarUrl: z.string().trim().max(500).optional(),
  isPrivate: z.boolean().optional(),
  notifyOnLike: z.boolean().optional(),
  notifyOnComment: z.boolean().optional(),
  notifyOnFollow: z.boolean().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
