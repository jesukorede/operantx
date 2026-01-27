# OperantX MVP API Spec

Base URL: `http://localhost:4000`

## Auth

- `GET /auth/nonce?address=0x...`
- `POST /auth/verify` (SIWE-style message + signature) → JWT

## Me / Profile

- `GET /me` (JWT)
- `PUT /me` (JWT) update role/skills/machines

## Jobs

- `GET /jobs`
- `POST /jobs` (JWT)
- `POST /jobs/:id/accept` (JWT)
- `POST /jobs/:id/complete` (JWT)
