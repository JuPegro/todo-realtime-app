#!/bin/sh

echo "🚀 Starting Realtime Todo Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until nc -z postgres 5432; do
  echo "🔄 Database is not ready yet. Waiting 2 seconds..."
  sleep 2
done

echo "✅ Database is ready!"

# Run Prisma migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Start the application
echo "🎉 Starting the application..."
exec npm run start:prod