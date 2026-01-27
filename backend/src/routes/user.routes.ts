import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.middleware.js";
import { getUser, updateUser } from "../services/user.service.js";

export function userRoutes(db: Db) {
  const r = Router();

  r.get("/me", requireAuth, async (req: AuthedRequest, res) => {
    const me = await getUser(db, req.user!.walletAddress);
    res.json({ user: me });
  });

  r.put("/me", requireAuth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      role: z.enum(["human", "machine_owner"]).optional(),
      skills: z.array(z.string()).optional(),
      machines: z
        .array(
          z.object({
            name: z.string().min(1),
            type: z.string().min(1),
            capabilities: z.array(z.string())
          })
        )
        .optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const updated = await updateUser(db, req.user!.walletAddress, parsed.data);
    res.json({ user: updated });
  });

  return r;
}
