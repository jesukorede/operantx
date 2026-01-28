import type { Db } from "../config/database.js";

export type PilotStatus = "none" | "applied" | "approved";

export async function applyForPilot(db: Db, walletAddress: string) {
  const row = await db.get<any>("SELECT pilotStatus FROM users WHERE walletAddress = ?", walletAddress);
  if (!row) return null;

  const current = (row.pilotStatus ?? "none") as PilotStatus;
  if (current === "approved") return { pilotStatus: "approved" as const };

  await db.run("UPDATE users SET pilotStatus = ? WHERE walletAddress = ?", "applied", walletAddress);
  const updated = await db.get<any>("SELECT pilotStatus FROM users WHERE walletAddress = ?", walletAddress);
  return updated;
}
