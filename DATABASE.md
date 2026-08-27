# RoadMap Database Schema

## Tables Overview

### projects
Main project container for the roadmap.

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status values**: `planned`, `in-progress`, `completed`, `on-hold`

---

### stages
Project phases with delivery dates. Each stage groups related points.

```sql
CREATE TABLE stages (
  id SERIAL PRIMARY KEY,
  project_id SERIAL NOT NULL REFERENCES projects(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  delivery_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status values**: `pending`, `in-progress`, `completed`, `blocked`

**Progress Calculation**: 
```
progress = (completed_points / total_points) * 100
```

---

### points
Individual completion items. Progress of a stage is based on point completion.

```sql
CREATE TABLE points (
  id SERIAL PRIMARY KEY,
  stage_id SERIAL NOT NULL REFERENCES stages(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### comments
Threaded comment system for all levels (projects, stages, points).

```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(50) NOT NULL,      -- 'project', 'stage', 'point'
  target_id SERIAL NOT NULL,
  parent_comment_id SERIAL REFERENCES comments(id),  -- for replies
  author VARCHAR(255) NOT NULL DEFAULT 'board',
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Status values**: `open`, `resolved`, `archived`

**target_type**: Determines which table `target_id` references:
- `project` → `projects.id`
- `stage` → `stages.id`
- `point` → `points.id`

---

### update_history
Audit trail of all changes for accountability and history tracking.

```sql
CREATE TABLE update_history (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(50) NOT NULL,      -- 'project', 'stage', 'point'
  target_id SERIAL NOT NULL,
  action VARCHAR(100) NOT NULL,          -- 'created', 'updated', 'deleted', 'status_changed'
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255) NOT NULL DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Key Relationships

```
projects (1) ──┬──→ (Many) stages
               └──→ (Many) comments (target_type='project')

stages (1) ──┬──→ (Many) points
             └──→ (Many) comments (target_type='stage')

points (1) ──→ (Many) comments (target_type='point')

comments (1) ──→ (Many) comments (parent_comment_id)  -- replies
```

---

## Indexes

For optimal query performance:

```sql
CREATE INDEX idx_stages_project_id ON stages(project_id);
CREATE INDEX idx_points_stage_id ON points(stage_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_update_history_target ON update_history(target_type, target_id);
```

---

## Query Examples

### Get a project with all stages and points
```sql
SELECT 
  p.*,
  s.*,
  pt.*
FROM projects p
LEFT JOIN stages s ON p.id = s.project_id
LEFT JOIN points pt ON s.id = pt.stage_id
WHERE p.id = $1
ORDER BY s.order_index, pt.order_index;
```

### Calculate stage progress
```sql
SELECT 
  s.id,
  s.name,
  COUNT(pt.id) as total_points,
  SUM(CASE WHEN pt.completed THEN 1 ELSE 0 END) as completed_points,
  ROUND(100.0 * SUM(CASE WHEN pt.completed THEN 1 ELSE 0 END) / COUNT(pt.id)) as progress_percent
FROM stages s
LEFT JOIN points pt ON s.id = pt.stage_id
WHERE s.project_id = $1
GROUP BY s.id, s.name;
```

### Get all comments on a stage with replies
```sql
SELECT 
  c.*,
  COUNT(replies.id) as reply_count
FROM comments c
LEFT JOIN comments replies ON c.id = replies.parent_comment_id
WHERE c.target_type = 'stage' AND c.target_id = $1
GROUP BY c.id
ORDER BY c.created_at DESC;
```

### Get full audit trail for a project
```sql
SELECT 
  uh.*,
  p.name as project_name
FROM update_history uh
LEFT JOIN projects p ON uh.target_type = 'project' AND uh.target_id = p.id
WHERE uh.target_type = 'project' AND uh.target_id = $1
ORDER BY uh.created_at DESC;
```

---

## Migration Strategy

Use Drizzle Kit for managing migrations:

```bash
cd backend
npx drizzle-kit generate:pg    # Generate migration files
npx drizzle-kit migrate:pg     # Run migrations
```

Migrations are stored in `backend/src/db/migrations/`.
