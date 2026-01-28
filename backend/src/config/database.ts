import { open } from "sqlite";
import sqlite3 from "sqlite3";
import fs from "node:fs";
import path from "node:path";

import { env } from "./env.js";

export type Db = Awaited<ReturnType<typeof openDb>>;

export async function openDb() {
  const dir = path.dirname(env.dbPath);
  if (dir && dir !== ".") {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = await open({
    filename: env.dbPath,
    driver: sqlite3.Database
  });

  await db.exec("PRAGMA journal_mode=WAL;");

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      walletAddress TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'human',
      pilotStatus TEXT NOT NULL DEFAULT 'none',
      skillsJson TEXT NOT NULL DEFAULT '[]',
      machinesJson TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nonces (
      walletAddress TEXT PRIMARY KEY,
      nonce TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requiredSkillsJson TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL,
      createdBy TEXT NOT NULL,
      acceptedBy TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  const cols = await db.all<{ name: string }[]>("PRAGMA table_info(users)");
  const hasPilotStatus = cols.some((c) => c.name === "pilotStatus");
  if (!hasPilotStatus) {
    await db.exec("ALTER TABLE users ADD COLUMN pilotStatus TEXT NOT NULL DEFAULT 'none';");
  }

  return db;
}
