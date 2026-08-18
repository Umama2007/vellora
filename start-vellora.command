#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

echo ""
echo "  ===================================================="
echo "                VELLORA LOCAL LAUNCHER"
echo "  ===================================================="
echo "  Starting Vellora (Frontend + Backend)..."
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js was not found on this computer."
  echo "  Install it from https://nodejs.org"
  exit 1
fi

echo "  [1/4] Running setup & database environment check..."
node setup-check.cjs

echo "  [2/4] Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
  npm install
fi

echo "  [3/4] Checking backend dependencies..."
if [ ! -d "backend/node_modules" ]; then
  npm run backend:install
fi

echo "  [4/4] Syncing database schema and generating client..."
export DATABASE_URL="postgresql://postgres.mjbwtydobpjvsnwacfaf:9j9KjVUzDvcHPLr2@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
npx --prefix backend prisma db push --schema=backend/prisma/schema.prisma
npx --prefix backend prisma generate --schema=backend/prisma/schema.prisma

echo ""
echo "  ===================================================="
echo "  🚀 Starting Vellora Dev Servers..."
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:4000"
echo "  ===================================================="
echo ""

npm run dev:all
