import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import type { Db } from "../config/database.js";
import { env } from "../config/env.js";
import { getOrCreateUser } from "./user.service.js";

export async function createNonce(db: Db, walletAddress: string): Promise<string> {
  const nonce = crypto.randomBytes(16).toString("hex");
  const now = new Date().toISOString();

  await db.run(
    "INSERT INTO nonces (walletAddress, nonce, createdAt) VALUES (?, ?, ?) ON CONFLICT(walletAddress) DO UPDATE SET nonce = excluded.nonce, createdAt = excluded.createdAt",
    walletAddress,
    nonce,
    now
  );

  return nonce;
}

export async function consumeNonce(db: Db, walletAddress: string): Promise<string | null> {
  const row = await db.get<{ nonce: string }>("SELECT nonce FROM nonces WHERE walletAddress = ?", walletAddress);
  if (!row) return null;
  await db.run("DELETE FROM nonces WHERE walletAddress = ?", walletAddress);
  return row.nonce;
}

export async function issueToken(db: Db, walletAddress: string): Promise<string> {
  await getOrCreateUser(db, walletAddress);
  return jwt.sign({ walletAddress }, env.jwtSecret, { expiresIn: "7d" });
}
