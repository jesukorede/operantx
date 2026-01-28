import type { Db } from "../config/database.js";
import { newId } from "../utils/ids.js";

export type UserRole = "human" | "machine_owner";

export type PilotStatus = "none" | "applied" | "approved";

export type UserRecord = {
  id: string;
  walletAddress: string;
  role: UserRole;
  pilotStatus: PilotStatus;
  skills: string[];
  machines: Array<{ name: string; type: string; capabilities: string[] }>;
  createdAt: string;
};

function parseJson<T>(s: string): T {
  return JSON.parse(s) as T;
}

export async function getOrCreateUser(db: Db, walletAddress: string): Promise<UserRecord> {
  const row = await db.get<any>("SELECT * FROM users WHERE walletAddress = ?", walletAddress);
  if (row) return hydrate(row);

  const now = new Date().toISOString();
  const id = newId("usr");
  await db.run(
    "INSERT INTO users (id, walletAddress, role, pilotStatus, skillsJson, machinesJson, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    id,
    walletAddress,
    "human",
    "none",
    "[]",
    "[]",
    now
  );

  const created = await db.get<any>("SELECT * FROM users WHERE walletAddress = ?", walletAddress);
  return hydrate(created);
}

export async function getUser(db: Db, walletAddress: string): Promise<UserRecord | null> {
  const row = await db.get<any>("SELECT * FROM users WHERE walletAddress = ?", walletAddress);
  return row ? hydrate(row) : null;
}

export async function updateUser(
  db: Db,
  walletAddress: string,
  updates: Partial<Pick<UserRecord, "role" | "skills" | "machines">>
): Promise<UserRecord> {
  const current = await getOrCreateUser(db, walletAddress);
  const next: UserRecord = {
    ...current,
    role: updates.role ?? current.role,
    skills: updates.skills ?? current.skills,
    machines: updates.machines ?? current.machines
  };

  await db.run(
    "UPDATE users SET role = ?, skillsJson = ?, machinesJson = ? WHERE walletAddress = ?",
    next.role,
    JSON.stringify(next.skills),
    JSON.stringify(next.machines),
    walletAddress
  );

  return (await getUser(db, walletAddress))!;
}

function hydrate(row: any): UserRecord {
  return {
    id: row.id,
    walletAddress: row.walletAddress,
    role: row.role,
    pilotStatus: (row.pilotStatus ?? "none") as PilotStatus,
    skills: parseJson<string[]>(row.skillsJson),
    machines: parseJson<Array<{ name: string; type: string; capabilities: string[] }>>(row.machinesJson),
    createdAt: row.createdAt
  };
}
