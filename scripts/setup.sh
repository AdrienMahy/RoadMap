#!/bin/bash
set -e

echo "🚀 Data & IT Roadmap - Setup"
echo "=============================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Build and start services
echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "healthy"; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🌐 Access the application:"
    echo "   - BOARD: http://localhost:3100"
    echo "   - DEV: http://localhost:3100 (click 'Admin' button)"
    echo "   - Default access code: roadmap2026"
    echo ""
    echo "📊 Database:"
    echo "   - Host: localhost:3102"
    echo "   - User: roadmap"
    echo "   - Password: roadmap123"
    echo "   - Database: roadmap"
    echo ""
    echo "📝 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    echo ""
    echo "⚠️  Services may still be starting. Run 'docker-compose logs' to check."
fi
