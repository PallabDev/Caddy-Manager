#!/bin/sh
set -e

echo "Starting Caddy Manager container..."

# Run Drizzle Kit push to synchronize schema with PostgreSQL
echo "Synchronizing database schema..."
npx drizzle-kit push --force || echo "Schema push encountered a warning, continuing..."

echo "Launching Caddy Manager server..."
exec npx tsx server.ts
