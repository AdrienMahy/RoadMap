# RoadMap Database Backups

This directory contains database backups for the RoadMap project.

## Files

- `roadmap_YYYYMMDD_HHMMSS.sql` - Full PostgreSQL dump of the RoadMap database

## Contents

The latest backup includes:

- **3 Projects**: MySDR, MediaPlatform, Scrapper
- **6 Modules**: 
  - MySDR: AMS, QuestionnaireApp
  - MediaPlatform: Holocron, TacticalDisplay, ControlDisplay, Holonet
  - Scrapper: (empty)
- **13 Stages**: Complete roadmap structure with descriptions
- **29 Points**: Detailed implementation points for each stage
- **1 User**: Admin account (Administrateur role)

## Usage

### Restore from backup

```bash
docker exec -i roadmap-db psql -U roadmap -d roadmap < backups/roadmap_*.sql
```

### Create new backup

```bash
docker exec roadmap-db pg_dump -U roadmap -d roadmap > backups/roadmap_$(date +%Y%m%d_%H%M%S).sql
```

## Database Structure

```
MySDR (Project)
├── AMS (Module) - 7 Stages, 18 Points
│   ├── AMS 2.0
│   ├── Amélioration du module Medical
│   ├── Création du module Match
│   ├── Amélioration du module Planning
│   ├── Amélioration du module Analyse
│   ├── Création du module Player
│   └── Évolution du module Match
└── QuestionnaireApp (Module) - 1 Stage, 2 Points
    └── Intégration de QuestionnaireApp

MediaPlatform (Project)
├── Holocron (Module) - 1 Stage, 1 Point
│   └── Sécurisation des contenus
├── TacticalDisplay (Module) - 2 Stages, 6 Points
│   ├── Centralisation VMS
│   └── Contrôle avancé des télévisions
├── ControlDisplay (Module) - 1 Stage, 1 Point
│   └── Programmation des télévisions
└── Holonet (Module) - 1 Stage, 1 Point
    └── Coffre-fort personnel

Scrapper (Project)
└── (No modules)
```

## Admin Credentials

- Username: `admin`
- Password: `admin123`
- Role: Administrateur

## Last Updated

Generated: 2026-09-03 11:48:26 UTC
