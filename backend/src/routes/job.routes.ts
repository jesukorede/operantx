import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.middleware.js";
import { requirePilotApproved } from "../middleware/pilot.middleware.js";
import { acceptJob, completeJob, createJob, listJobs } from "../services/job.service.js";

export function jobRoutes(db: Db) {
  const r = Router();

  r.get("/", async (_req, res) => {
    const jobs = await listJobs(db);
    res.json({ jobs });
  });

  r.post("/", requireAuth, requirePilotApproved(db), async (req: AuthedRequest, res) => {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      requiredSkills: z.array(z.string()).default([])
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const job = await createJob(db, {
      ...parsed.data,
      createdBy: req.user!.walletAddress
    });

    res.json({ job });
  });

  r.post("/:id/accept", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const job = await acceptJob(db, req.params.id, req.user!.walletAddress);
      if (!job) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ job });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  r.post("/:id/complete", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const job = await completeJob(db, req.params.id, req.user!.walletAddress);
      if (!job) {
        res.status(404).json({ error: "not_found" });
        return;
      }
      res.json({ job });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  return r;
}
