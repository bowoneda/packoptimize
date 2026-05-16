# Deployment Rollback Runbook

## Overview

This runbook covers rolling back either the API or web frontend on Fly.io when a bad deploy is detected.

---

## Detecting a Bad Deploy

Signs of a broken deployment:
- Health check failing: `GET /health` returning non-200
- Error spike in Sentry (`SENTRY_DSN` alerts)
- Users reporting 5xx errors
- Fly machine restart loop visible in `flyctl logs`

```bash
flyctl logs --app packoptimize-api
flyctl status --app packoptimize-api
```

---

## API Rollback

### Option A: Instant Rollback to Previous Release (Fly)

Fly keeps the last N releases. List them:

```bash
flyctl releases --app packoptimize-api
```

Roll back to the previous release number (e.g., `v12`):

```bash
flyctl deploy --image $(flyctl releases --app packoptimize-api --json | jq -r '.[1].ImageRef') --app packoptimize-api
```

Or using the release version directly:

```bash
flyctl deploy --strategy=immediate --image registry.fly.io/packoptimize-api:<previous-tag>
```

### Option B: Roll Back via Git + Redeploy

Find the last good commit:

```bash
git log --oneline -10
```

Create a rollback commit (preferred over `git revert` for immediate recovery):

```bash
git checkout <last-good-sha> -- packoptimize-api/
git commit -m "rollback: revert API to <last-good-sha>"
git push origin master
```

This triggers the CI/CD pipeline (GitHub Actions) to redeploy.

---

## Frontend Rollback

Same approach — Fly keeps previous images:

```bash
flyctl releases --app packoptimize-web
flyctl deploy --image registry.fly.io/packoptimize-web:<previous-tag> --app packoptimize-web
```

---

## Database Schema Rollback

> **Warning**: Prisma uses `db push` (not migrations), so schema rollbacks require manual SQL.

If a schema change (added column, changed type) needs to be reversed:

### 1. Connect to the database

```bash
flyctl proxy 5433:5432 --app packoptimize-db &
psql "$DATABASE_URL"
```

### 2. Run the inverse DDL manually

Examples:
```sql
-- Reverse: added a NOT NULL column
ALTER TABLE "Item" DROP COLUMN IF EXISTS "new_column";

-- Reverse: renamed a column
ALTER TABLE "Item" RENAME COLUMN "new_name" TO "old_name";
```

### 3. Redeploy the API at the old image

After fixing the schema, redeploy the API image that matches the reverted schema.

---

## Verifying Recovery

After rollback:

```bash
# API health
curl https://packoptimize-api.fly.dev/health

# Frontend loads
curl -I https://packoptimize-web.fly.dev/

# Check Fly machine state
flyctl status --app packoptimize-api
flyctl status --app packoptimize-web
```

Check Sentry for lingering errors. If errors are gone, the rollback is successful.

---

## Post-Incident

1. Create a post-mortem in `docs/` (see `Railway_Deployment_Post_Mortem.md` as template)
2. Add the root cause to `LESSONS.md`
3. Add a regression test before re-deploying the fix

---

## Contacts / References

- Fly dashboard: https://fly.io/apps/packoptimize-api
- Fly docs — deployments: https://fly.io/docs/launch/deploy/
- Sentry: configured via `SENTRY_DSN` env var
