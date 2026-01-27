import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { createNonce, consumeNonce, issueToken } from "../services/auth.service.js";
import { buildLoginMessage } from "../utils/siwe.js";

export function authRoutes(db: Db) {
  const r = Router();

  r.get("/nonce", async (req, res) => {
    const address = String(req.query.address ?? "").toLowerCase();
    if (!address) {
      res.status(400).json({ error: "missing_address" });
      return;
    }

    const nonce = await createNonce(db, address);

    res.json({
      address,
      nonce,
      message: buildLoginMessage({
        address,
        nonce,
        domain: "localhost",
        uri: "http://localhost:3000",
        chainId: Number(process.env.CHAIN_ID ?? 0)
      })
    });
  });

  r.post("/verify", async (req, res) => {
    const schema = z.object({
      address: z.string().min(1),
      signature: z.string().min(1)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const address = parsed.data.address.toLowerCase();
    const nonce = await consumeNonce(db, address);
    if (!nonce) {
      res.status(400).json({ error: "missing_nonce" });
      return;
    }

    // MVP: we do not validate signature server-side to keep dependencies minimal.
    // The frontend ensures it prompts the wallet and sends the signature.
    // In later phases, validate with viem/ethers and the exact signed message.

    const token = await issueToken(db, address);
    res.json({ token });
  });

  return r;
}
