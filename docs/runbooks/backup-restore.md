# Database Backup & Restore Runbook

## Overview

PackOptimize uses a Fly.io managed Postgres cluster (`packoptimize-db`, region: `iad`).  
Fly Postgres takes **continuous WAL-based backups** automatically — no cron needed.

---

## Checking Backup Status

```bash
flyctl postgres backups list --app packoptimize-db
```

Fly retains daily snapshots for **7 days** on free/hobby plans and up to **30 days** on paid plans.

---

## Manual Snapshot (Before Risky Migrations)

Always snapshot before running `prisma db push` against production:

```bash
flyctl postgres backup create --app packoptimize-db
```

Wait for it to complete:

```bash
flyctl postgres backups list --app packoptimize-db
```

---

## Restoring From a Snapshot

### 1. List available snapshots

```bash
flyctl postgres backups list --app packoptimize-db
```

Note the `snapshot_id` of the backup you want.

### 2. Stop the API to avoid writes during restore

```bash
flyctl scale count 0 --app packoptimize-api
```

### 3. Restore to a new Postgres app

Fly does not support in-place restore — you restore to a **new** Postgres app, then re-attach:

```bash
flyctl postgres create \
  --name packoptimize-db-restore \
  --region iad \
  --restore-from <snapshot_id>
```

### 4. Detach the old DB and attach the restored one

```bash
flyctl postgres detach packoptimize-db --app packoptimize-api
flyctl postgres attach packoptimize-db-restore --app packoptimize-api
```

This updates `DATABASE_URL` in the API's secrets automatically.

### 5. Restart the API

```bash
flyctl scale count 1 --app packoptimize-api
flyctl status --app packoptimize-api
```

### 6. Verify health

```bash
curl https://packoptimize-api.fly.dev/health
```

---

## Point-in-Time Recovery (PITR)

Fly Postgres supports PITR on paid plans. Specify a target timestamp:

```bash
flyctl postgres create \
  --name packoptimize-db-pitr \
  --region iad \
  --restore-from packoptimize-db \
  --restore-target-time "2025-05-01T12:00:00Z"
```

---

## Exporting a Logical Dump (Off-site Backup)

For an off-cluster backup, use `pg_dump` via the Fly proxy:

```bash
# Open proxy on localhost:5433
flyctl proxy 5433:5432 --app packoptimize-db &

# Dump (requires DATABASE_URL secret value)
pg_dump "$(flyctl secrets list --app packoptimize-api --json | jq -r '.[] | select(.Name=="DATABASE_URL") | .Digest')" \
  --no-password \
  --format=custom \
  --file packoptimize-$(date +%Y%m%d).dump
```

Store the dump file off-site (S3, Google Drive, etc.).

---

## Restoring From a Logical Dump

```bash
flyctl proxy 5433:5432 --app packoptimize-db &
pg_restore \
  --dbname "$DATABASE_URL" \
  --no-owner \
  --clean \
  packoptimize-20250501.dump
```

---

## Contacts / Escalation

- Fly status: https://status.flyio.net
- Fly Postgres docs: https://fly.io/docs/postgres/
