import crypto from "node:crypto";

export function newId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(16).toString("hex")}`;
}
