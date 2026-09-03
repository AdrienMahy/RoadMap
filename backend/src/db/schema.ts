import { pgTable, serial, varchar, text, timestamp, boolean, integer, date } from 'drizzle-orm/pg-core'
import { sql, relations } from 'drizzle-orm'

// USERS TABLE
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // Hashed with bcrypt
  email: varchar('email', { length: 255 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('Board'), // 'Administrateur' or 'Board'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// PROJECTS TABLE - Level 1
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('planned'), // planned, in-progress, completed, on-hold
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// MODULES TABLE - Level 2
export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('planned'),
  icon: varchar('icon', { length: 50 }), // Lucide icon name (e.g., 'Zap', 'Code', 'Rocket')
  priority: varchar('priority', { length: 20 }).notNull().default('medium'), // low, medium, high
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// STAGES TABLE - Level 3 (Étapes)
export const stages = pgTable('stages', {
  id: serial('id').primaryKey(),
  moduleId: integer('module_id').notNull(),
  projectId: integer('project_id').notNull(), // Denormalized for easier queries
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  deliveryDate: date('delivery_date'),
  validatedAt: timestamp('validated_at'),
  orderIndex: integer('order_index').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// POINTS TABLE - Level 4
export const points = pgTable('points', {
  id: serial('id').primaryKey(),
  stageId: integer('stage_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  completed: boolean('completed').notNull().default(false),
  completedAt: timestamp('completed_at'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// COMMENTS TABLE - Can be on Projects, Modules, Stages, or Points
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'project', 'module', 'stage'
  targetId: integer('target_id').notNull(),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// NOTIFICATIONS TABLE
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(), // Who receives the notification
  type: varchar('type', { length: 50 }).notNull(), // 'comment_added', 'comment_edited', 'comment_deleted', 'project_created', etc.
  targetType: varchar('target_type', { length: 50 }), // 'project', 'module', 'stage'
  targetId: integer('target_id'), // ID of the project/module/stage/comment
  projectId: integer('project_id').notNull().default(1), // Which project this notification relates to
  relatedUserId: integer('related_user_id'), // Who triggered the notification
  message: varchar('message', { length: 255 }).notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// UPDATES/HISTORY TABLE
export const updateHistory = pgTable('update_history', {
  id: serial('id').primaryKey(),
  targetType: varchar('target_type', { length: 50 }).notNull(), // 'project', 'module', 'stage', 'point'
  targetId: integer('target_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(), // 'created', 'updated', 'deleted', 'status_changed'
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedBy: varchar('changed_by', { length: 255 }).notNull().default('system'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// RELATIONS
export const projectsRelations = relations(projects, ({ many }) => ({
  modules: many(modules),
  comments: many(comments),
}))

export const modulesRelations = relations(modules, ({ one, many }) => ({
  project: one(projects, {
    fields: [modules.projectId],
    references: [projects.id],
  }),
  stages: many(stages),
  comments: many(comments),
}))

export const stagesRelations = relations(stages, ({ one, many }) => ({
  module: one(modules, {
    fields: [stages.moduleId],
    references: [modules.id],
  }),
  points: many(points),
  comments: many(comments),
}))

export const pointsRelations = relations(points, ({ one, many }) => ({
  stage: one(stages, {
    fields: [points.stageId],
    references: [stages.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  project: one(projects, {
    fields: [comments.targetId],
    references: [projects.id],
  }),
  module: one(modules, {
    fields: [comments.targetId],
    references: [modules.id],
  }),
  stage: one(stages, {
    fields: [comments.targetId],
    references: [stages.id],
  }),
  point: one(points, {
    fields: [comments.targetId],
    references: [points.id],
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
}))

