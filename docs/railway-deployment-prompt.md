# PackOptimize — Railway Deployment Setup

## Context

The app is fully built. We need to prepare it for Railway deployment. The user has already created a Railway project with PostgreSQL and Redis provisioned.

## Railway Environment Variables (already set in Railway dashboard):

```
DATABASE_URL        → (Railway PostgreSQL internal URL)
REDIS_URL           → (Railway Redis internal URL)
JWT_SECRET          → (needs to be generated)
STRIPE_SECRET_KEY   → (user's Stripe test key)
STRIPE_WEBHOOK_SECRET → whsec_placeholder
PORT                → 3000
FRONTEND_URL        → (empty for now)
NODE_ENV            → production
```

## Tasks

### 1: Generate a secure JWT_SECRET

Run this and output the result so the user can copy it to Railway:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Print: "Copy this JWT_SECRET to your Railway variables: <the generated value>"

### 2: Install Railway CLI

```bash
npm install -g @railway/cli
```

Then run:
```bash
railway login
```

This will open a browser for auth. Wait for the user to complete login.

### 3: Link the project

Navigate to the packoptimize-api directory and link to the Railway project:
```bash
cd packoptimize-api
railway link
```

This will prompt to select the project and service. The user should select their PackOptimize project and the backend service (not the PostgreSQL or Redis service).

### 4: Prepare the backend for Railway deployment

#### 4a: Update package.json scripts

Make sure these scripts exist in packoptimize-api/package.json:
```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main.js",
    "prisma:migrate:deploy": "npx prisma migrate deploy",
    "prisma:seed": "npx prisma db seed"
  }
}
```

#### 4b: Create a Procfile in packoptimize-api root (Railway uses this):
```
web: npx prisma migrate deploy && node dist/main.js
```

#### 4c: Make sure the app reads PORT from environment

In `src/main.ts`, verify the app listens on the PORT env variable:
```typescript
const port = process.env.PORT || 3000;
await app.listen(port, '0.0.0.0'); // 0.0.0.0 is CRITICAL for Railway
```

CRITICAL: The app MUST listen on `0.0.0.0`, not `localhost` or `127.0.0.1`. Railway requires this to route traffic to the container.

#### 4d: Update CORS configuration in src/main.ts

Make CORS permissive for now (tighten after frontend is deployed):
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3001'] 
    : true, // Allow all origins if FRONTEND_URL not set
  credentials: true,
});
```

#### 4e: Ensure Prisma generates on build

Create or update `railway.json` in packoptimize-api root:
```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/main.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

#### 4f: Update Prisma schema to handle Railway's DATABASE_URL

Railway's internal PostgreSQL URL uses `postgres.railway.internal` which only works within the Railway network. Make sure the Prisma datasource in `prisma/schema.prisma` uses the env variable:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

This should already be set, but verify it.

#### 4g: Handle the seed script

The seed should only run on first deployment, not every restart. Update the start command approach:

Create a file `scripts/start-production.sh` in packoptimize-api:
```bash
#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed data exists..."
TENANT_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Tenant\";" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$TENANT_COUNT" = "0" ] || [ -z "$TENANT_COUNT" ]; then
  echo "No tenants found. Running seed..."
  npx prisma db seed
  echo "Seed complete."
else
  echo "Data already exists ($TENANT_COUNT tenants). Skipping seed."
fi

echo "Starting application..."
node dist/main.js
```

Make it executable:
```bash
chmod +x scripts/start-production.sh
```

Update railway.json startCommand to:
```
"startCommand": "sh scripts/start-production.sh"
```

### 5: Prepare the frontend for Vercel deployment

The frontend is simplest on Vercel (free, automatic from GitHub).

#### 5a: Verify next.config.ts/js is clean

No special output mode needed for Vercel — just make sure there are no hardcoded API URLs:

```typescript
const nextConfig = {
  // Vercel handles everything automatically
};
export default nextConfig;
```

#### 5b: Environment variables for Vercel

The only variable needed is:
```
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

This gets set in Vercel's dashboard after the backend is deployed.

### 6: Git preparation

Make sure both projects are committed and pushed to GitHub:

```bash
# From the packoptimize root
cd ..

# Create a .gitignore at root level if not exists
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.local
.next/
*.log
EOF

# Make sure packoptimize-api has its own .gitignore
cd packoptimize-api
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
*.log
coverage/
EOF

# Make sure packoptimize-web has its own .gitignore
cd ../packoptimize-web
cat > .gitignore << 'EOF'
node_modules/
.next/
.env.local
*.log
EOF

cd ..
```

Initialize git repo if not already done, add everything, commit:
```bash
git add -A
git status
git commit -m "feat: complete PackOptimize platform - ready for deployment"
```

If no remote is set:
```bash
# User needs to create a GitHub repo first, then:
git remote add origin https://github.com/USERNAME/packoptimize.git
git branch -M main
git push -u origin main
```

Print instructions for the user:
```
DEPLOYMENT STEPS:

1. Create a GitHub repository named 'packoptimize' at github.com/new
2. Push the code: git push -u origin main
3. In Railway dashboard:
   - Select the backend service
   - Go to Settings
   - Connect to GitHub repo → select packoptimize
   - Set root directory to: packoptimize-api
   - Railway will auto-deploy from the railway.json config
4. Wait for Railway to build and deploy (watch the logs)
5. Once deployed, copy the backend URL from Railway
6. Go to vercel.com → New Project → Import the same GitHub repo
   - Set root directory to: packoptimize-web
   - Add environment variable: NEXT_PUBLIC_API_URL = <Railway backend URL>
   - Deploy
7. Copy the Vercel frontend URL
8. Go back to Railway → backend service → Variables
   - Set FRONTEND_URL = <Vercel frontend URL>
   - Redeploy the backend

Then verify:
- Backend: https://your-backend.up.railway.app/health
- Swagger: https://your-backend.up.railway.app/api/docs
- Frontend: https://your-frontend.vercel.app
```

### 7: Run all tests one final time before pushing

```bash
cd packoptimize-api
npm run test -- --forceExit --verbose
```

All tests must pass before pushing to GitHub. Do not push if any test fails.

### 8: Verify .env.example files are up to date

packoptimize-api/.env.example:
```
DATABASE_URL=postgresql://user:password@localhost:5432/packoptimize_dev
TEST_DATABASE_URL=postgresql://user:password@localhost:5433/packoptimize_test
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
PORT=3000
FRONTEND_URL=http://localhost:3001
NODE_ENV=development
```

packoptimize-web/.env.example:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Verify .env and .env.local are in .gitignore and NOT committed.

### Summary

After Claude Code completes all these steps, tell the user:
"Deployment preparation complete. Here's what you need to do:
1. Create a GitHub repo and push the code
2. In Railway: connect to GitHub, set root directory to packoptimize-api, deploy
3. In Vercel: import same repo, set root to packoptimize-web, add NEXT_PUBLIC_API_URL
4. Set FRONTEND_URL in Railway to the Vercel URL
5. Test /health and the frontend login"
