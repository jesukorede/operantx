# OperantX Contracts (MVP)

## Contract

- `OperantXRegistry.sol`
  - Profile registration (wallet → profileId)
  - Machine listing (event-based)
  - Job record (job hash)
  - Accept job
  - Confirm completion

## Deploy

Set env vars:

- `PEAQ_RPC_URL`
- `CHAIN_ID`
- `DEPLOYER_PRIVATE_KEY`

Then:

```bash
npm --workspace contracts run deploy
```
