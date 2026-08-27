# RoadMap Project Configuration

## Project Summary
- **Type**: Full-stack web application
- **Purpose**: Internal Data & IT Roadmap management
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript + Drizzle ORM
- **Database**: PostgreSQL 16
- **Deployment**: Docker Compose (single command)

## Quick Links
- **README.md** - Setup & features overview
- **NEXT_STEPS.md** - Development roadmap & to-do
- **DATABASE.md** - Database schema & queries
- **.instruction.md** - Project principles & requirements

## Environment Files
- `backend/.env.example` - Backend configuration template
- `frontend/.env.example` - Frontend configuration template

Copy to `.env` and update values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Key Ports
- Frontend: http://localhost:3100
- Backend API: http://localhost:3101
- PostgreSQL: localhost:3102
- Default DEV access code: `roadmap2026`

## Running the Project

### Docker (Production-like)
```bash
bash scripts/setup.sh
```

### Local Development
```bash
# Terminal 1: Backend (runs on :3101)
cd backend && npm install && npm run dev

# Terminal 2: Frontend (runs on :3100)
cd frontend && npm install && npm run dev

# Terminal 3: PostgreSQL (runs on :3102)
# Or use docker-compose to run only postgres:
docker-compose up postgres
```

## Database Setup
The schema is defined in:
- `backend/src/db/schema.ts` (Drizzle ORM)
- `database/init.sql` (Raw SQL)

## Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3100

# Kill the process
kill -9 <PID>
```

### Docker Issues
```bash
# Clean everything
docker-compose down -v

# Rebuild
docker-compose up --build
```

### Database Connection Failed
Check:
1. PostgreSQL container is running: `docker ps`
2. Credentials match `.env`
3. Database exists: `createdb roadmap -U roadmap`

## Project Structure Validation

Essential files to commit:
- ✅ frontend/package.json
- ✅ backend/package.json
- ✅ backend/src/db/schema.ts
- ✅ database/init.sql
- ✅ docker-compose.yml
- ✅ README.md, NEXT_STEPS.md, DATABASE.md

Do NOT commit:
- ❌ node_modules/
- ❌ dist/, build/
- ❌ .env (use .env.example)
- ❌ .DS_Store, *.log

## Support
For detailed information, see the relevant documentation files.
