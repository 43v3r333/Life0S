# LifeOS

LifeOS is a private, local-first personal operating system for finance, planning, daily execution, work, AI assistance, and controlled long-term memory.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm install
npm run setup:auth
npm run dev
```

The development and production server listens on `127.0.0.1:3001`. Build and verify production with:

```bash
npm run lint
npm test
npm run build
npm run docs:check
npm audit
```

## Data and reliability

- `LIFEOS_DATA_DIR/lifeos.sqlite` is the authoritative transactional store. Production requires an explicit `LIFEOS_DATA_DIR`; development defaults to `data/`.
- On first upgraded startup, `LIFEOS_DATA_DIR/db.json` is copied to a checksum-labelled rollback artifact, imported, and reconciled before SQLite becomes authoritative.
- Uploaded statements and screenshots remain files below `LIFEOS_DATA_DIR`; their metadata, ownership, hash, and analysis state are indexed in SQLite.
- Backup bundles include a consistent SQLite snapshot, statements, balance screenshots, the local vector index, a sanitized compatibility state, and a checksum manifest. Restore verifies a staged copy before activation, creates a pre-restore safety backup, and rolls database and file artifacts back together on failure.
- Provider credentials are encrypted separately with the persistent `LIFEOS_VAULT_SECRET` and are never stored in the SQLite application state or ordinary AI prompts.
- Healthy startup is read-only for application records. Data repair, classification, reconciliation, memory synchronization, and account-balance changes require an explicit API action.
- Apple Vision OCR is used only on macOS. Linux safely skips Apple-only binaries and uses configured NVIDIA vision; HEIC files remain saved with actionable conversion guidance.

Storage health is available at `GET /api/system/storage-status` and can be reconciled with `POST /api/system/storage-verify`.

Production startup fails closed unless `APP_URL`, `LIFEOS_DATA_DIR`, `LIFEOS_AUTH_REQUIRED=true`, a valid authentication email/password hash, and a stable `LIFEOS_VAULT_SECRET` of at least 32 characters are configured. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## AI behavior

AI answers use current LifeOS records first, relevant confirmed memories second, and recent conversation context last. Source labels and timestamps are attached to grounded responses. Newer authoritative records suppress stale linked memories. Every proposed write requires approval. When NVIDIA or another configured provider is unavailable, deterministic local calculations remain available and are labelled as fallback output.

The Memory screen includes provider diagnostics, domain coverage, stale-memory exclusions, conflicts, and pending proposed actions.

## Private mobile access

1. Run `npm run setup:auth` and configure a private email plus a password of at least 12 characters.
2. Install ngrok and configure a valid token using `ngrok config add-authtoken YOUR_TOKEN`.
3. Run `npm run build` and then `npm run mobile`.
4. Open the HTTPS address printed by ngrok and sign in.

Sessions use HttpOnly cookies and persist in SQLite across normal restarts. Do not share the ngrok URL or expose the port on your router.

## Feature status

- Implemented locally: finance ledgers and imports, bank/account snapshots, debts, goals, tasks, habits, work shifts, conversations, memory, search, backups, authentication, and AI diagnostics.
- Optional integrations: NVIDIA NIM, OpenAI, Gemini, GitHub, and ngrok. They require user-provided credentials.
- Retired demonstrations: unused enterprise/demo UI modules are retained only in `archive/legacy-ui` and excluded from production builds.

The complete API catalog is in [docs/API_REFERENCE.md](docs/API_REFERENCE.md). The running server exposes `GET /api/openapi-spec`.
