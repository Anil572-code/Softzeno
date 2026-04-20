#!/bin/bash
set -e

echo "🚀 Setting up Softzeno POS database..."

cd "$(dirname "$0")/../apps/backend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗃️  Running database migrations..."
npx prisma migrate dev --name init

# Run seed
echo "🌱 Seeding database..."
npx ts-node prisma/seed.ts

echo "✅ Database setup complete!"
