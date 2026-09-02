# RoadMap Application - Deployment Guide

## Production Deployment

### Prerequisites
- Docker & Docker Compose installed
- Git repository cloned
- Environment variables configured

### Step 1: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your production values:

```env
# Database (use strong passwords in production!)
DB_USER=roadmap
DB_PASSWORD=your-secure-password-here
DB_NAME=roadmap
DATABASE_URL=postgresql://roadmap:your-secure-password-here@postgres:5432/roadmap

# Application
NODE_ENV=production
DEV_ACCESS_CODE=your-secure-access-code
JWT_SECRET=your-very-secure-jwt-secret-key-min-32-chars

# Frontend
VITE_API_URL=https://your-domain.com/api

# Optional
TEAMS_WEBHOOK_URL=https://your-teams-webhook-url
```

### Step 2: Deploy Using Production Docker Compose

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Verify all services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 3: Health Checks

```bash
# Backend health
curl http://localhost:3101/health

# Frontend (should be accessible on port 80)
curl http://localhost

# Database connection
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

### Step 4: Database Verification

```bash
# Check database connection
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U $DB_USER -d $DB_NAME -c "\dt"

# Expected tables:
# - projects
# - modules
# - stages
# - points
# - comments
# - notifications
# - update_history
# - users
```

## Production Configuration

### Security Best Practices

1. **Database**
   - Change `DB_PASSWORD` to a strong password
   - Use encrypted connections (SSL/TLS) in production
   - Regular backups

2. **Application**
   - Set unique `JWT_SECRET` (minimum 32 characters)
   - Set secure `DEV_ACCESS_CODE`
   - Use HTTPS for frontend (configure nginx)
   - Enable CORS restrictions

3. **Environment**
   - Set `NODE_ENV=production`
   - Use production-grade container orchestration (Kubernetes, Docker Swarm)
   - Enable logging and monitoring
   - Set up automated backups

### Scaling

For high-traffic environments:

1. **Database**: Use managed PostgreSQL service (AWS RDS, Azure Database, etc.)
2. **Backend**: Run multiple instances behind a load balancer
3. **Frontend**: Use CDN for static assets
4. **Monitoring**: Set up ELK stack or similar logging solution

### Backup & Recovery

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U $DB_USER -d $DB_NAME > backup-$(date +%Y%m%d-%H%M%S).sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U $DB_USER -d $DB_NAME < backup-file.sql
```

### Monitoring

Key endpoints to monitor:
- Backend health: `GET /health`
- Frontend: `GET /` (should return 200 with HTML)
- Database: Connection status

### Troubleshooting

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes data!)
docker-compose -f docker-compose.prod.yml down -v
```

## CI/CD Integration

For automated deployments:

1. Push to main branch
2. GitHub Actions workflow builds and tests
3. On success, deploy to production
4. Rollback on failure

See `.github/workflows/` for CI/CD configuration.

## Support

For issues, check:
1. Docker logs
2. Database connection
3. Environment variables
4. Firewall rules
5. Port availability
