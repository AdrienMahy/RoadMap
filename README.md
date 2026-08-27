# Data & IT Roadmap

A premium, intentionally simple internal web application for managing the Data & IT development roadmap.

## ✨ Features

- **BOARD Interface** — Read-only view for management to understand the roadmap at a glance (~10 seconds)
- **DEV Interface** — Administration dashboard for the Chief of Data & IT to manage projects, stages, and points
- **Three-Level Hierarchy** — Projects → Stages → Points
- **Comment System** — Threaded comments at all levels (projects, stages, points) with Microsoft Teams notifications
- **Progress Tracking** — Automatic progress calculation based on completed points
- **Dark Theme** — Modern, clean UI inspired by Linear, Vercel, and Notion
- **Internal Deployment** — Docker-based, runs on internal network

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Using Docker (Recommended)

```bash
# Clone/setup the project
cd /path/to/RoadMap

# Start all services
docker-compose up --build

# Access the application
# BOARD: http://localhost:3100
# DEV: http://localhost:3100 (click "Admin" button)
# Default access code: roadmap2026
```

The application will be available at:
- **Frontend**: http://localhost:3100
- **Backend API**: http://localhost:3101/api
- **Database**: postgres://localhost:3102 (for local development)

### Local Development

#### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3101
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3100
```

## 📁 Project Structure

```
RoadMap/
├── frontend/              # React + TypeScript + Tailwind
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   └── package.json
├── backend/               # Express + TypeScript
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   ├── tsconfig.json
│   └── package.json
├── database/
│   ├── init.sql           # Database schema
│   └── migrations/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── nginx.conf
│   └── .dockerignore
├── docker-compose.yml
└── README.md
```

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling (dark theme)
- **Vite** for fast development & builds
- **TanStack Query** for server state management
- **Zustand** for client state
- **Lucide Icons** for UI icons

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for type-safe database access
- **PostgreSQL** for persistence
- **Axios** for HTTP requests (Teams integration)
- **CORS** enabled for local development

### Database (PostgreSQL)
- **Projects** — Main project container
- **Stages** — Project phases with delivery dates
- **Points** — Individual completion items
- **Comments** — Threaded discussions at any level
- **UpdateHistory** — Audit trail of changes

## 🔐 Access Control

### BOARD Interface
- Accessible to anyone with the URL
- Read-only view
- Shows all projects, stages, points, and timelines

### DEV Interface
- Protected by a simple access code
- Button on BOARD interface to unlock
- Full CRUD capabilities for all elements
- Comment moderation

**Default Access Code**: `roadmap2026` (change in `.env`)

## 💬 Comments & Notifications

### Features
- Comment at **project**, **stage**, or **point** level
- **Threaded replies** for discussions
- **Status tracking** (open, resolved, archived)
- **Microsoft Teams integration** for notifications

### Microsoft Teams Setup
Set `TEAMS_WEBHOOK_URL` in `.env` to enable notifications:
```env
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/webhookb2/...
```

When a comment is added, Teams receives a notification with:
- Type of comment (project/stage/point)
- Content
- Author
- Link to the item

## 📊 Data Model

```
PROJECT
├── name (string)
├── description (text)
├── status (planned, in-progress, completed, on-hold)
├── createdAt (timestamp)
└── STAGE (array)
    ├── name (string)
    ├── description (text)
    ├── delivery_date (date)
    ├── order_index (integer)
    ├── status (pending, in-progress, completed, blocked)
    ├── progress (%) — calculated from points
    └── POINT (array)
        ├── name (string)
        ├── description (text)
        ├── completed (boolean)
        └── order_index (integer)

COMMENT (any level)
├── target_type (project|stage|point)
├── target_id (integer)
├── parent_comment_id (integer, for replies)
├── author (string)
├── content (text)
├── status (open|resolved|archived)
└── createdAt (timestamp)

UPDATE_HISTORY (audit trail)
├── target_type (project|stage|point)
├── target_id (integer)
├── action (created|updated|deleted|status_changed)
├── oldValue (text)
├── newValue (text)
├── changedBy (string)
└── createdAt (timestamp)
```

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=3101
DATABASE_URL=postgresql://user:password@localhost:3102/roadmap
NODE_ENV=development
DEV_ACCESS_CODE=roadmap2026
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/webhookb2/...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3101/api
VITE_DEV_ACCESS_CODE=roadmap2026
```

## 🛠️ Development

### Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Build
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Lint
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## 📦 Deployment

### Docker (Recommended)
```bash
docker-compose up --build
```

### Manual
1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && npm run build`
3. Start backend: `cd backend && npm start`
4. Serve frontend: Use nginx or any static server
5. Ensure PostgreSQL is running

## 🎨 Design Principles

✅ **Simplicity First** — Every feature must serve BOARD or DEV interface  
✅ **Internal-First** — Hosted internally, no unnecessary external services  
✅ **Modern Design** — Clean, premium aesthetic (Linear/Vercel/Notion)  
✅ **Performance** — Fast load times, responsive UI  
✅ **Clarity** — Board understands roadmap in ~10 seconds  

## 📝 Core Principles

See `.instruction.md` for detailed project specifications.

## 🤝 Contributing

Follow the existing code style and patterns:
- Use TypeScript for type safety
- Follow the three-level hierarchy strictly
- Keep UI components simple and focused
- Test before pushing changes

## 📜 License

Internal use only.
