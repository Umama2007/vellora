import { z } from "zod";

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Username must be at least 3 characters")
      .max(30)
      .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});
