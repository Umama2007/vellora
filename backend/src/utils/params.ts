import { Request } from "express";

/**
 * Express 5's param typing allows string | string[] to support repeated
 * route segments (e.g. `/:id+`), which none of our routes use. This
 * narrows a single named param back to a plain string.
 */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
}
