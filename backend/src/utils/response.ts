import { Response } from "express";

export function ok(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ success: true, data });
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const Errors = {
  badRequest: (msg = "Bad request") => new ApiError(400, msg),
  unauthorized: (msg = "You must be logged in") => new ApiError(401, msg),
  forbidden: (msg = "You don't have permission to do that") => new ApiError(403, msg),
  notFound: (msg = "Not found") => new ApiError(404, msg),
  conflict: (msg = "Already exists") => new ApiError(409, msg),
  validation: (msg = "Invalid input") => new ApiError(422, msg),
};
