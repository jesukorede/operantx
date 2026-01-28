import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) {
    res.status(500).json({ error: "admin_not_configured" });
    return;
  }

  const got = String(req.headers["x-admin-key"] ?? "");
  if (!got || got !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  next();
}
