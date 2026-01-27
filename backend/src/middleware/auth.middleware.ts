import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export type AuthedRequest = Request & { user?: { walletAddress: string } };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  const token = h?.startsWith("Bearer ") ? h.slice("Bearer ".length) : undefined;

  if (!token) {
    res.status(401).json({ error: "missing_token" });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { walletAddress: string };
    req.user = { walletAddress: payload.walletAddress };
    next();
  } catch {
    res.status(401).json({ error: "invalid_token" });
  }
}
