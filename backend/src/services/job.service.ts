import type { Db } from "../config/database.js";
import { newId } from "../utils/ids.js";

export type JobStatus = "open" | "accepted" | "completed";

export type JobRecord = {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  status: JobStatus;
  createdBy: string;
  acceptedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

function parseJson<T>(s: string): T {
  return JSON.parse(s) as T;
}

function hydrate(row: any): JobRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    requiredSkills: parseJson<string[]>(row.requiredSkillsJson),
    status: row.status,
    createdBy: row.createdBy,
    acceptedBy: row.acceptedBy ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

export async function listJobs(db: Db): Promise<JobRecord[]> {
  const rows = await db.all<any[]>("SELECT * FROM jobs ORDER BY createdAt DESC");
  return rows.map(hydrate);
}

export async function createJob(db: Db, params: { title: string; description: string; requiredSkills: string[]; createdBy: string }): Promise<JobRecord> {
  const now = new Date().toISOString();
  const id = newId("job");

  await db.run(
    "INSERT INTO jobs (id, title, description, requiredSkillsJson, status, createdBy, acceptedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    params.title,
    params.description,
    JSON.stringify(params.requiredSkills),
    "open",
    params.createdBy,
    null,
    now,
    now
  );

  const row = await db.get<any>("SELECT * FROM jobs WHERE id = ?", id);
  return hydrate(row);
}

export async function acceptJob(db: Db, jobId: string, walletAddress: string): Promise<JobRecord | null> {
  const row = await db.get<any>("SELECT * FROM jobs WHERE id = ?", jobId);
  if (!row) return null;
  if (row.status !== "open") throw new Error("job_not_open");

  const now = new Date().toISOString();
  await db.run("UPDATE jobs SET status = ?, acceptedBy = ?, updatedAt = ? WHERE id = ?", "accepted", walletAddress, now, jobId);
  const updated = await db.get<any>("SELECT * FROM jobs WHERE id = ?", jobId);
  return hydrate(updated);
}

export async function completeJob(db: Db, jobId: string, walletAddress: string): Promise<JobRecord | null> {
  const row = await db.get<any>("SELECT * FROM jobs WHERE id = ?", jobId);
  if (!row) return null;
  if (row.status !== "accepted") throw new Error("job_not_accepted");
  if (row.acceptedBy !== walletAddress && row.createdBy !== walletAddress) throw new Error("not_participant");

  const now = new Date().toISOString();
  await db.run("UPDATE jobs SET status = ?, updatedAt = ? WHERE id = ?", "completed", now, jobId);
  const updated = await db.get<any>("SELECT * FROM jobs WHERE id = ?", jobId);
  return hydrate(updated);
}
