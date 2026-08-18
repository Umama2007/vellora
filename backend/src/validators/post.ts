import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content is required"),
  excerpt: z.string().trim().max(400).optional().default(""),
  coverImage: z.string().trim().optional().default(""),
  category: z.string().trim().max(50).optional().default("General"),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional().default([]),
  published: z.boolean().optional().default(false),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional().default("PUBLIC"),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  category: z.string().trim().optional(),
  authorId: z.string().trim().optional(),
  authorUsername: z.string().trim().optional(),
  following: z.coerce.boolean().optional(),
  sort: z.enum(["latest", "top"]).optional().default("latest"),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});
