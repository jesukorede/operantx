import type { NextFunction, Response } from "express";
import type { Db } from "../config/database.js";
import type { AuthedRequest } from "./auth.middleware.js";

export function requirePilotApproved(db: Db) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const wallet = req.user?.walletAddress;
    if (!wallet) {
      res.status(401).json({ error: "missing_token" });
      return;
    }

    const row = await db.get<any>("SELECT pilotStatus FROM users WHERE walletAddress = ?", wallet);
    const status = String(row?.pilotStatus ?? "none");
    if (status !== "approved") {
      res.status(403).json({ error: "pilot_required" });
      return;
    }

    next();
  };
}
