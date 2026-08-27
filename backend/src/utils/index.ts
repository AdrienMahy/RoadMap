/**
 * Utilities for progress calculation and data aggregation
 */

import { Point, Stage } from '../types/index'

export function calculateStageProgress(points: Point[]): number {
  if (points.length === 0) return 0
  const completed = points.filter(p => p.completed).length
  return Math.round((completed / points.length) * 100)
}

export function aggregateProjectProgress(stages: Stage[]): number {
  if (stages.length === 0) return 0
  const totalStageProgress = stages.reduce((sum, stage) => sum + (stage.progress || 0), 0)
  return Math.round(totalStageProgress / stages.length)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function daysUntilDeadline(deadline: Date | string): number {
  const d = new Date(deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Project statuses
    planned: 'blue',
    'in-progress': 'amber',
    completed: 'green',
    'on-hold': 'red',
    // Stage statuses
    pending: 'gray',
    blocked: 'red',
  }
  return colors[status] || 'gray'
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    planned: 'Planifié',
    'in-progress': 'En cours',
    completed: 'Complété',
    'on-hold': 'En attente',
    pending: 'En attente',
    blocked: 'Bloqué',
  }
  return labels[status] || status
}
