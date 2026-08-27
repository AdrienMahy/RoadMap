CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stages (
  id SERIAL PRIMARY KEY,
  project_id SERIAL NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  delivery_date DATE,
  order_index INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS points (
  id SERIAL PRIMARY KEY,
  stage_id SERIAL NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(50) NOT NULL,
  target_id SERIAL NOT NULL,
  parent_comment_id SERIAL REFERENCES comments(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL DEFAULT 'board',
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS update_history (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(50) NOT NULL,
  target_id SERIAL NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255) NOT NULL DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_stages_project_id ON stages(project_id);
CREATE INDEX idx_points_stage_id ON points(stage_id);
CREATE INDEX idx_comments_target ON comments(target_type, target_id);
CREATE INDEX idx_update_history_target ON update_history(target_type, target_id);
