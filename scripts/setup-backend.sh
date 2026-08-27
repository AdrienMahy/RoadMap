#!/bin/bash

echo "📚 RoadMap Backend - Development Setup"
echo "======================================="

cd backend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
fi

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "🚀 Start development server:"
echo "   npm run dev"
echo ""
echo "🔗 API will run on: http://localhost:3101"
