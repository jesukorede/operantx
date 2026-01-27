import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  port: Number(process.env.BACKEND_PORT ?? 4000),
  jwtSecret: required("JWT_SECRET"),
  dbPath: process.env.DB_PATH ?? "./data/operantx.sqlite",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};
