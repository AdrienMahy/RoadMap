/**
 * Type definitions for the RoadMap application
 */

export interface Project {
  id: number
  name: string
  description?: string
  status: 'planned' | 'in-progress' | 'completed' | 'on-hold'
  createdAt: Date
  updatedAt: Date
  stages?: Stage[]
  comments?: Comment[]
}

export interface Stage {
  id: number
  projectId: number
  name: string
  description?: string
  deliveryDate?: Date
  orderIndex: number
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  createdAt: Date
  updatedAt: Date
  progress?: number  // Calculated: (completedPoints / totalPoints) * 100
  points?: Point[]
  comments?: Comment[]
}

export interface Point {
  id: number
  stageId: number
  name: string
  description?: string
  completed: boolean
  orderIndex: number
  createdAt: Date
  updatedAt: Date
  comments?: Comment[]
}

export interface Comment {
  id: number
  targetType: 'project' | 'stage' | 'point'
  targetId: number
  parentCommentId?: number
  author: string
  content: string
  status: 'open' | 'resolved' | 'archived'
  createdAt: Date
  updatedAt: Date
  replies?: Comment[]
}

export interface UpdateHistoryRecord {
  id: number
  targetType: 'project' | 'stage' | 'point'
  targetId: number
  action: 'created' | 'updated' | 'deleted' | 'status_changed'
  oldValue?: string
  newValue?: string
  changedBy: string
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  timestamp: string
}

export interface ApiError {
  error: string
  message: string
  timestamp: string
}

// Request Body Types
export interface CreateProjectRequest {
  name: string
  description?: string
  status?: 'planned' | 'in-progress' | 'completed' | 'on-hold'
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: 'planned' | 'in-progress' | 'completed' | 'on-hold'
}

export interface CreateStageRequest {
  projectId: number
  name: string
  description?: string
  deliveryDate?: Date
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked'
}

export interface UpdateStageRequest {
  name?: string
  description?: string
  deliveryDate?: Date
  status?: 'pending' | 'in-progress' | 'completed' | 'blocked'
  orderIndex?: number
}

export interface CreatePointRequest {
  stageId: number
  name: string
  description?: string
}

export interface UpdatePointRequest {
  name?: string
  description?: string
  completed?: boolean
  orderIndex?: number
}

export interface CreateCommentRequest {
  targetType: 'project' | 'stage' | 'point'
  targetId: number
  parentCommentId?: number
  author?: string
  content: string
}

export interface UpdateCommentRequest {
  content?: string
  status?: 'open' | 'resolved' | 'archived'
}
