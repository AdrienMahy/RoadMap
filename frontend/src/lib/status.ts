// Status and priority utilities

export type StatusType = 'pending' | 'in-progress' | 'completed' | 'on-hold'
export type PriorityType = 'low' | 'medium' | 'high' | 'critical'

// Auto-calculate status based on completion
export function calculateStatus(
  items: Array<{ completed?: boolean }> | null | undefined,
  currentStatus?: string
): StatusType {
  if (!items || items.length === 0) {
    return currentStatus as StatusType || 'pending'
  }

  const completed = items.filter((i) => i.completed).length
  const total = items.length

  if (completed === 0) return 'pending'
  if (completed === total) return 'completed'
  return 'in-progress'
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-600/30 text-green-200 border border-green-500/50'
    case 'in-progress':
      return 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
    case 'on-hold':
      return 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/50'
    default:
      return 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
  }
}

export function getStatusBorderColor(status: string): string {
  // Red gradient border for all statuses
  return 'border-l-4 border-l-red-500'
}

// Icon name mappings for components
export function getStatusIconName(status: string): string {
  switch (status) {
    case 'completed':
      return 'CheckCircle'
    case 'in-progress':
      return 'Zap'
    case 'on-hold':
      return 'AlertCircle'
    default:
      return 'Clock'
  }
}

export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'critical':
      return '🔴'
    case 'high':
      return '🟠'
    case 'medium':
      return '🟡'
    case 'low':
    default:
      return '🔵'
  }
}

export function getPriorityIconName(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'AlertOctagon'
    case 'high':
      return 'AlertTriangle'
    case 'medium':
      return 'Minus'
    case 'low':
    default:
      return 'ChevronDown'
  }
}

export function getStatusIconColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-400'
    case 'in-progress':
      return 'text-orange-400'
    case 'on-hold':
      return 'text-yellow-400'
    default:
      return 'text-blue-400'
  }
}

export function getPriorityIconColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-red-400'
    case 'high':
      return 'text-orange-400'
    case 'medium':
      return 'text-yellow-400'
    case 'low':
    default:
      return 'text-blue-400'
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'bg-red-600/30 text-red-200 border border-red-500/50'
    case 'high':
      return 'bg-orange-600/30 text-orange-200 border border-orange-500/50'
    case 'medium':
      return 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/50'
    case 'low':
    default:
      return 'bg-blue-600/30 text-blue-200 border border-blue-500/50'
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'Critical'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
    default:
      return 'Low'
  }
}
