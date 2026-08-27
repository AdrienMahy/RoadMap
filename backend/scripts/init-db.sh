#!/bin/bash
# Initialize database schema

echo "🗄️  Initializing database schema..."

# Generate migrations
npm run db:generate

# Push migrations to database
npm run db:push

echo "✅ Database initialized successfully!"
