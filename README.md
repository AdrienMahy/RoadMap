# RoadMap Application

Data & IT Roadmap Management Application - A modern web-based platform for project planning, tracking, and collaboration.

## Quick Start

### Development

```bash
# Start with Docker Compose
docker-compose up -d

# Access the application
# Frontend: http://localhost:3100
# Backend API: http://localhost:3101
# Database: localhost:3102
```

### Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Architecture

### Frontend
- React 18 + TypeScript
- Vite 5.4
- Tailwind CSS (dark theme)
- Port: 3100 (dev), 80 (prod)

### Backend
- Express.js + Node.js 20
- TypeScript
- Drizzle ORM with PostgreSQL
- Port: 3101

### Database
- PostgreSQL 16
- Port: 3102 (dev)

## Environment Variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Key variables:
- `DB_USER`, `DB_PASSWORD`, `DB_NAME` - Database credentials
- `NODE_ENV` - Environment (production/development)
- `JWT_SECRET` - JWT signing key
- `DEV_ACCESS_CODE` - Access code for development mode

## Features

- 📊 Project hierarchy (Projects → Modules → Stages → Points)
- 💬 Comments on stages with notifications
- 📈 Progress tracking and status management
- 🔔 Real-time notifications
- 👥 User authentication and authorization
- 📅 Delivery date tracking
- ✅ Completion validation

## API Documentation

Base URL: `http://localhost:3101/api`

### Health Check
```bash
GET /health
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guide.

Quick start for production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Container issues
```bash
docker-compose logs -f [service]
docker-compose restart [service]
```

### Database issues
```bash
docker-compose exec postgres psql -U roadmap -d roadmap -c "\dt"
```

## Support

For issues or questions, check the DEPLOYMENT.md file or review container logs.
