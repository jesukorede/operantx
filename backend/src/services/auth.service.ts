import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import type { Db } from "../config/database.js";
import { env } from "../config/env.js";
import { getOrCreateUser } from "./user.service.js";

export async function createNonce(db: Db, walletAddress: string): Promise<string> {
  const normalized = String(walletAddress).toLowerCase();
  const nonce = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  await db.run(
    "INSERT INTO nonces (walletAddress, nonce, createdAt) VALUES (?, ?, ?) ON CONFLICT(walletAddress) DO UPDATE SET nonce = excluded.nonce, createdAt = excluded.createdAt",
    normalized,
    nonce,
    now
  );

  return nonce;
}

export async function consumeNonce(db: Db, walletAddress: string): Promise<string | null> {
  const normalized = String(walletAddress).toLowerCase();
  const row = await db.get<{ nonce: string }>("SELECT nonce FROM nonces WHERE walletAddress = ?", normalized);
  if (!row) return null;
  await db.run("DELETE FROM nonces WHERE walletAddress = ?", normalized);
  return row.nonce;
}

export async function issueToken(db: Db, walletAddress: string): Promise<string> {
  const normalized = String(walletAddress).toLowerCase();
  await getOrCreateUser(db, normalized);
  return jwt.sign({ walletAddress: normalized }, env.jwtSecret, { expiresIn: "7d" });
}
