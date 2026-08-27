# 🎯 RoadMap Creation Workflow

## Structure Hiérarchique (4 Niveaux)

```
PROJECT
    └── MODULE
            └── STAGE
                    └── POINT
```

---

## Workflow Complet: Créer une Hiérarchie Complète

### **STEP 1️⃣ - Créer un PROJECT**

```bash
POST /api/projects
Content-Type: application/json

{
  "name": "AMS - Application de gestion du club",
  "description": "Application unifiée pour gérer tous les aspects du club",
  "status": "planned"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "name": "AMS - Application de gestion du club",
    "description": "Application unifiée pour gérer tous les aspects du club",
    "status": "planned",
    "progress": 0,
    "orderIndex": 0,
    "createdAt": "2026-08-25T12:00:00.000Z",
    "updatedAt": "2026-08-25T12:00:00.000Z"
  }
}
```

**Key Points:**
- 🆔 Save `id: 8` for next steps
- 📊 `progress: 0` (pas de points encore)
- 📅 Dates auto-générées

---

### **STEP 2️⃣ - Créer un MODULE (sous le Project)**

```bash
POST /api/modules
Content-Type: application/json

{
  "projectId": 8,              # ← Link to Project from STEP 1
  "name": "Module 2.0",
  "description": "Deuxième version du module",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "projectId": 8,
    "name": "Module 2.0",
    "description": "Deuxième version du module",
    "status": "in-progress",
    "progress": 0,
    "orderIndex": 0,
    "createdAt": "2026-08-25T12:01:00.000Z",
    "updatedAt": "2026-08-25T12:01:00.000Z"
  }
}
```

**Key Points:**
- 🆔 Save `id: 12` for next steps
- 🔗 `projectId: 8` (lien vers le projet)
- 📊 `progress: 0` (pas de stages/points encore)

---

### **STEP 3️⃣ - Créer un STAGE (sous le Module)**

```bash
POST /api/stages
Content-Type: application/json

{
  "moduleId": 12,              # ← Link to Module from STEP 2
  "name": "Refactoring Backend",
  "description": "Refactoriser l'API Express",
  "deliveryDate": "2026-09-30",
  "status": "in-progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "moduleId": 12,
    "name": "Refactoring Backend",
    "description": "Refactoriser l'API Express",
    "deliveryDate": "2026-09-30",
    "status": "in-progress",
    "progress": 0,
    "orderIndex": 0,
    "createdAt": "2026-08-25T12:02:00.000Z",
    "updatedAt": "2026-08-25T12:02:00.000Z"
  }
}
```

**Key Points:**
- 🆔 Save `id: 25` for next steps
- 🔗 `moduleId: 12` (lien vers le module)
- 📅 `deliveryDate: "2026-09-30"` (date cible)
- 📊 `progress: 0` (pas de points)

---

### **STEP 4️⃣ - Créer des POINTS (sous le Stage)**

```bash
POST /api/points
Content-Type: application/json

{
  "stageId": 25,               # ← Link to Stage from STEP 3
  "name": "Convert to TypeScript",
  "description": "Convertir tout le code en TypeScript",
  "completed": false
}
```

**Répéter 3-5 fois pour créer plusieurs points:**

```bash
# Point 1
POST /api/points
{
  "stageId": 25,
  "name": "Convert to TypeScript",
  "completed": false
}

# Point 2
POST /api/points
{
  "stageId": 25,
  "name": "Add type definitions",
  "completed": false
}

# Point 3
POST /api/points
{
  "stageId": 25,
  "name": "Test all endpoints",
  "completed": false
}
```

**Response (pour chaque point):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "stageId": 25,
    "name": "Convert to TypeScript",
    "description": "Convertir tout le code en TypeScript",
    "completed": false,
    "orderIndex": 0,
    "createdAt": "2026-08-25T12:03:00.000Z",
    "updatedAt": "2026-08-25T12:03:00.000Z"
  }
}
```

**Key Points:**
- 🆔 Save `id` of each point if needed
- 🔗 `stageId: 25` (lien vers le stage)
- ✅ `completed: false` (pas encore fait)

---

### **STEP 5️⃣ - Récupérer la Hiérarchie Complète**

```bash
GET /api/projects/8
```

**Response (Full Hierarchy):**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "name": "AMS - Application de gestion du club",
    "status": "planned",
    "progress": 0,
    "modules": [
      {
        "id": 12,
        "projectId": 8,
        "name": "Module 2.0",
        "status": "in-progress",
        "progress": 0,
        "stages": [
          {
            "id": 25,
            "moduleId": 12,
            "name": "Refactoring Backend",
            "status": "in-progress",
            "progress": 0,
            "deliveryDate": "2026-09-30",
            "points": [
              {
                "id": 45,
                "stageId": 25,
                "name": "Convert to TypeScript",
                "completed": false,
                "orderIndex": 0
              },
              {
                "id": 46,
                "stageId": 25,
                "name": "Add type definitions",
                "completed": false,
                "orderIndex": 1
              },
              {
                "id": 47,
                "stageId": 25,
                "name": "Test all endpoints",
                "completed": false,
                "orderIndex": 2
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### **STEP 6️⃣ - Mettre à Jour un POINT (Mark as Complete)**

```bash
PUT /api/points/45
Content-Type: application/json

{
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "stageId": 25,
    "name": "Convert to TypeScript",
    "completed": true,
    "updatedAt": "2026-08-25T12:05:00.000Z"
  }
}
```

**What Happens Automatically:**
- ✅ Point 45: `completed = true`
- 📊 Stage 25 progress: recalculated (1/3 = 33%)
- 📊 Module 12 progress: recalculated (33%)
- 📊 Project 8 progress: recalculated (33%)

**Verify by GET /api/projects/8:**
```json
{
  "data": {
    "id": 8,
    "progress": 33,
    "modules": [
      {
        "progress": 33,
        "stages": [
          {
            "progress": 33,
            "points": [
              { "id": 45, "completed": true },
              { "id": 46, "completed": false },
              { "id": 47, "completed": false }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### **STEP 7️⃣ - Supprimer (Cascade Delete)**

```bash
# Delete a Module (deletes all stages and points inside)
DELETE /api/modules/12

# Delete a Stage (deletes all points inside)
DELETE /api/stages/25

# Delete a Point (just the point)
DELETE /api/points/45

# Delete a Project (deletes all modules, stages, and points)
DELETE /api/projects/8
```

**Cascade Behavior:**
- `DELETE /api/projects/8`
  - ❌ Deletes Project 8
  - ❌ Deletes Module 12
  - ❌ Deletes Stage 25
  - ❌ Deletes Points 45, 46, 47

- `DELETE /api/modules/12`
  - ❌ Deletes Module 12
  - ❌ Deletes Stage 25
  - ❌ Deletes Points 45, 46, 47
  - ✅ Project 8 remains

---

## API Endpoints Reference

### Projects
```
GET    /api/projects                 ← List all projects
POST   /api/projects                 ← Create new project
GET    /api/projects/:id             ← Get project with full hierarchy
PUT    /api/projects/:id             ← Update project
DELETE /api/projects/:id             ← Delete project (cascade)
```

### Modules
```
GET    /api/modules/project/:id      ← List modules in project
POST   /api/modules                  ← Create new module
GET    /api/modules/:id              ← Get module with hierarchy
PUT    /api/modules/:id              ← Update module
DELETE /api/modules/:id              ← Delete module (cascade)
```

### Stages
```
GET    /api/stages/module/:id        ← List stages in module
POST   /api/stages                   ← Create new stage
GET    /api/stages/:id               ← Get stage with points
PUT    /api/stages/:id               ← Update stage
DELETE /api/stages/:id               ← Delete stage (cascade)
```

### Points
```
GET    /api/points/stage/:id         ← List points in stage
POST   /api/points                   ← Create new point
GET    /api/points/:id               ← Get point
PUT    /api/points/:id               ← Update point (mark complete, etc)
DELETE /api/points/:id               ← Delete point
```

---

## Progress Calculation

**Formula:**
```
Progress = (Completed Points / Total Points) × 100
```

**Example:**
- Stage with 3 points: [✅, ❌, ❌]
- Progress = (1 / 3) × 100 = **33%**

**Aggregation:**
- Point progress: 0% (not completed) or 100% (completed)
- Stage progress: Average of all points in stage
- Module progress: Average of all points in all stages
- Project progress: Average of all points in all modules

---

## Quick Reference: Full Workflow in cURL

```bash
#!/bin/bash
API="http://localhost:3101/api"

# 1. Create Project
PROJECT=$(curl -s -X POST $API/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","status":"planned"}')
P_ID=$(echo $PROJECT | jq -r '.data.id')

# 2. Create Module
MODULE=$(curl -s -X POST $API/modules \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":$P_ID,\"name\":\"Module 1\"}")
M_ID=$(echo $MODULE | jq -r '.data.id')

# 3. Create Stage
STAGE=$(curl -s -X POST $API/stages \
  -H "Content-Type: application/json" \
  -d "{\"moduleId\":$M_ID,\"name\":\"Stage 1\",\"deliveryDate\":\"2026-12-31\"}")
S_ID=$(echo $STAGE | jq -r '.data.id')

# 4. Create Points (3 times)
for i in 1 2 3; do
  curl -s -X POST $API/points \
    -H "Content-Type: application/json" \
    -d "{\"stageId\":$S_ID,\"name\":\"Point $i\",\"completed\":false}" \
    > /dev/null
done

# 5. Get Full Hierarchy
curl -s $API/projects/$P_ID | jq '.'

# 6. Update Point
POINT_ID=1  # from response above
curl -s -X PUT $API/points/$POINT_ID \
  -H "Content-Type: application/json" \
  -d '{"completed":true}' | jq '.'

# 7. Verify Progress Updated
curl -s $API/projects/$P_ID | jq '.data | {progress, stages: .modules[0].stages[0]}'
```

---

## Data Model Diagram

```
┌──────────────────┐
│    PROJECT       │ id, name, status, progress
└────────┬─────────┘
         │ 1:many
         ▼
┌──────────────────┐
│     MODULE       │ id, projectId, name, status, progress
└────────┬─────────┘
         │ 1:many
         ▼
┌──────────────────┐
│      STAGE       │ id, moduleId, name, status, progress, deliveryDate
└────────┬─────────┘
         │ 1:many
         ▼
┌──────────────────┐
│      POINT       │ id, stageId, name, completed
└──────────────────┘
```

---

## Status Values

```
Allowed statuses:
  - "planned"       (pas commencé)
  - "in-progress"   (en cours)
  - "completed"     (terminé)
  - "on-hold"       (en attente)
```

---

**Created:** 2026-08-25  
**API Version:** 1.0  
**Database:** PostgreSQL 16  
**ORM:** Drizzle ORM
