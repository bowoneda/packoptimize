# Staging Environment Setup

## Overview

Staging mirrors production on Fly.io under separate app names:
- **API**: `packoptimize-api-staging` → `https://packoptimize-api-staging.fly.dev`
- **Web**: `packoptimize-web-staging` → `https://packoptimize-web-staging.fly.dev`
- **DB**: `packoptimize-db-staging` (separate Postgres cluster)

Deploys to staging are triggered by pushing to the `staging` git branch (see `.github/workflows/deploy-staging.yml`).

---

## One-Time Provisioning (run once per environment)

```bash
flyctl="C:\Users\USER\AppData\Local\Microsoft\WinGet\Packages\Fly-io.flyctl_Microsoft.Winget.Source_8wekyb3d8bbwe\flyctl"

# 1. Create staging Postgres
$flyctl postgres create \
  --name packoptimize-db-staging \
  --region iad \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 1

# 2. Create staging Redis
$flyctl apps create packoptimize-redis-staging --machines
$flyctl machine run redis:7-alpine \
  --app packoptimize-redis-staging \
  --region iad \
  --vm-size shared-cpu-1x \
  --memory 256

# 3. Create staging API app
$flyctl apps create packoptimize-api-staging

# Attach the staging DB (sets DATABASE_URL secret automatically)
$flyctl postgres attach packoptimize-db-staging --app packoptimize-api-staging

# Set remaining secrets
$flyctl secrets set \
  JWT_SECRET="staging-jwt-secret-change-me" \
  REDIS_URL="redis://packoptimize-redis-staging.internal:6379" \
  FRONTEND_URL="https://packoptimize-web-staging.fly.dev" \
  NODE_ENV="production" \
  --app packoptimize-api-staging

# 4. Create staging Web app
$flyctl apps create packoptimize-web-staging

$flyctl secrets set \
  API_URL="https://packoptimize-api-staging.fly.dev" \
  NEXT_PUBLIC_API_URL="https://packoptimize-api-staging.fly.dev" \
  --app packoptimize-web-staging
```

---

## First Deploy

```bash
# API
cd packoptimize-api
$flyctl deploy --config fly.staging.toml --remote-only

# Web
cd packoptimize-web
$flyctl deploy --config fly.staging.toml --remote-only
```

---

## Seeding Staging Data

```bash
# Proxy to staging DB
$flyctl proxy 5434:5432 --app packoptimize-db-staging &

# Run seed
DATABASE_URL="postgresql://...<from flyctl secrets>..." \
  npx tsx packoptimize-api/prisma/seed.ts
```

---

## Automated Deploys via CI

The `deploy-staging.yml` workflow deploys both apps when code is pushed to the `staging` branch.

**Required GitHub secret**: `FLY_API_TOKEN`
- Generate: `flyctl tokens create deploy --expiry 999999h`
- Add in GitHub → Settings → Secrets and variables → Actions

---

## Promoting Staging → Production

Staging is deployed from the `staging` branch. When staging is validated:

```bash
git checkout master
git merge staging
git push origin master
```

Production deploy is manual — no automatic prod deploy in CI (intentional).

---

## Teardown (if needed)

```bash
$flyctl apps destroy packoptimize-api-staging --yes
$flyctl apps destroy packoptimize-web-staging --yes
$flyctl apps destroy packoptimize-db-staging --yes
$flyctl apps destroy packoptimize-redis-staging --yes
```
