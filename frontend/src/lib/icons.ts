// Available Lucide icons for modules and stages
import {
  Zap,
  Code,
  Rocket,
  Target,
  Shield,
  Cog,
  Database,
  Cloud,
  Users,
  GitBranch,
  BarChart3,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
} from 'lucide-react'

export const AVAILABLE_ICONS = [
  { name: 'Zap', icon: Zap, label: 'Flash' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Rocket', icon: Rocket, label: 'Rocket' },
  { name: 'Target', icon: Target, label: 'Target' },
  { name: 'Shield', icon: Shield, label: 'Shield' },
  { name: 'Cog', icon: Cog, label: 'Settings' },
  { name: 'Database', icon: Database, label: 'Database' },
  { name: 'Cloud', icon: Cloud, label: 'Cloud' },
  { name: 'Users', icon: Users, label: 'Team' },
  { name: 'GitBranch', icon: GitBranch, label: 'Git' },
  { name: 'BarChart3', icon: BarChart3, label: 'Analytics' },
  { name: 'Lock', icon: Lock, label: 'Security' },
  { name: 'AlertCircle', icon: AlertCircle, label: 'Alert' },
  { name: 'CheckCircle', icon: CheckCircle, label: 'Check' },
  { name: 'Clock', icon: Clock, label: 'Schedule' },
  { name: 'Archive', icon: Archive, label: 'Archive' },
]

export function getIconByName(name?: string) {
  if (!name) return null
  const iconData = AVAILABLE_ICONS.find((i) => i.name === name)
  return iconData?.icon || null
}

export function getIconLabel(name?: string) {
  if (!name) return ''
  const iconData = AVAILABLE_ICONS.find((i) => i.name === name)
  return iconData?.label || name
}
