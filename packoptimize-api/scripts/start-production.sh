#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push

echo "Starting application..."
node dist/main.js
