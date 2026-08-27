# Phase 1 API Documentation

## Overview

Phase 1 provides complete CRUD endpoints for Projects, Stages, and Points with automatic progress calculation and update history tracking.

## Base URL

```
http://localhost:3101/api
```

## Projects Endpoints

### GET /projects
Get all projects

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Core Infrastructure",
      "description": "Database migration and API optimization",
      "status": "in-progress",
      "createdAt": "2026-08-25T10:41:11.422Z",
      "updatedAt": "2026-08-25T10:41:11.422Z"
    }
  ],
  "timestamp": "2026-08-25T10:46:33.598Z"
}
```

### GET /projects/:id
Get project with all stages and points (includes hierarchy)

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Core Infrastructure",
    "status": "in-progress",
    "stages": [
      {
        "id": 1,
        "name": "Database Migration",
        "progress": 100,
        "points": [
          {
            "id": 1,
            "name": "Schema mapping",
            "completed": true
          }
        ]
      }
    ]
  },
  "timestamp": "..."
}
```

### POST /projects
Create new project

**Request:**
```json
{
  "name": "Core Infrastructure",
  "description": "Database migration and API optimization",
  "status": "in-progress",
  "author": "user@example.com"
}
```

**Response:**
```json
{
  "data": { ...project object... },
  "message": "Project created successfully",
  "timestamp": "..."
}
```

### PUT /projects/:id
Update project

**Request:**
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "status": "completed",
  "author": "user@example.com"
}
```

### DELETE /projects/:id
Delete project (cascades stages and points)

**Request:**
```json
{
  "author": "user@example.com"
}
```

---

## Stages Endpoints

### GET /stages/project/:projectId
Get all stages for a project

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "projectId": 1,
      "name": "Database Migration",
      "deliveryDate": "2026-09-15",
      "status": "in-progress",
      "orderIndex": 0
    }
  ],
  "timestamp": "..."
}
```

### GET /stages/:id
Get stage with progress calculation

**Response:**
```json
{
  "data": {
    "id": 1,
    "name": "Database Migration",
    "progress": 100,
    "deliveryDate": "2026-09-15"
  },
  "timestamp": "..."
}
```

### POST /stages
Create new stage

**Request:**
```json
{
  "projectId": 1,
  "name": "Database Migration",
  "description": "Migrate from MySQL to PostgreSQL",
  "deliveryDate": "2026-09-15",
  "status": "in-progress",
  "author": "user@example.com"
}
```

### PUT /stages/:id
Update stage

**Request:**
```json
{
  "name": "Updated stage name",
  "status": "completed",
  "author": "user@example.com"
}
```

### DELETE /stages/:id
Delete stage (cascades all points)

---

## Points Endpoints

### GET /points/stage/:stageId
Get all points for a stage

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "stageId": 1,
      "name": "Schema mapping and validation",
      "completed": true,
      "orderIndex": 0
    }
  ],
  "timestamp": "..."
}
```

### GET /points/:id
Get single point

### POST /points
Create new point

**Request:**
```json
{
  "stageId": 1,
  "name": "Schema mapping and validation",
  "description": "Map old schema to new schema",
  "author": "user@example.com"
}
```

### PUT /points/:id
Update point (toggle completion, update order, etc.)

**Request:**
```json
{
  "completed": true,
  "author": "user@example.com"
}
```

### DELETE /points/:id
Delete point

---

## Status Codes

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2026-08-25T..."
}
```

## Progress Calculation

Progress is automatically calculated as:
```
progress = (completedPoints / totalPoints) * 100
```

Updated when:
- A point is marked as completed
- A point is uncompleted
- Points are added/deleted from a stage

## Update History

All create/update/delete operations are logged with:
- `targetType`: 'project' | 'stage' | 'point'
- `targetId`: ID of the changed resource
- `action`: 'created' | 'updated' | 'deleted' | 'status_changed'
- `oldValue`: Previous value (for updates)
- `newValue`: New value
- `changedBy`: User who made the change
- `createdAt`: Timestamp

## Testing

Test all endpoints:
```bash
bash /tmp/test_api.sh
```
