import { useState, useEffect, useRef } from 'react'
import { fetchProjects } from '../lib/api'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { ChevronDown, ChevronRight, CheckCircle, Clock, Zap, AlertCircle, AlertTriangle, AlertOctagon, Minus } from 'lucide-react'
import { getStatusColor, calculateStatus, getPriorityColor, getStatusBorderColor, getStatusIconName, getPriorityIconName, getStatusIconColor, getPriorityIconColor, getPriorityLabel } from '../lib/status'
import { getIconByName } from '../lib/icons'

// Helper to render status/priority icons dynamically
function renderStatusIcon(status: string) {
  const iconName = getStatusIconName(status)
  const color = getStatusIconColor(status)
  const iconProps = { size: 14, className: color }
  
  switch (iconName) {
    case 'CheckCircle':
      return <CheckCircle {...iconProps} />
    case 'Zap':
      return <Zap {...iconProps} />
    case 'AlertCircle':
      return <AlertCircle {...iconProps} />
    case 'Clock':
    default:
      return <Clock {...iconProps} />
  }
}

function renderPriorityIcon(priority: string) {
  const iconName = getPriorityIconName(priority)
  const color = getPriorityIconColor(priority)
  const iconProps = { size: 16, className: color }
  
  switch (iconName) {
    case 'AlertOctagon':
      return <AlertOctagon {...iconProps} />
    case 'AlertTriangle':
      return <AlertTriangle {...iconProps} />
    case 'Minus':
      return <Minus {...iconProps} />
    case 'ChevronDown':
    default:
      return <ChevronDown {...iconProps} />
  }
}

interface Point {
  id: number
  stageId: number
  name: string
  description?: string
  completed: boolean
  priority: string
  orderIndex: number
}

interface Stage {
  id: number
  moduleId: number
  name: string
  description?: string
  deliveryDate?: string
  icon?: string
  priority: string
  status: string
  progress: number
  orderIndex: number
  points?: Point[]
}

interface Module {
  id: number
  projectId: number
  name: string
  description?: string
  icon?: string
  priority: string
  status: string
  progress: number
  orderIndex: number
  stages?: Stage[]
}

interface Project {
  id: number
  name: string
  description?: string
  status: string
  progress: number
  orderIndex: number
  modules?: Module[]
}

export default function BoardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await fetchProjects()
      setProjects(data)
      // Expand all by default for Board view
      const keys = new Set<string>()
      data.forEach((p) => {
        keys.add(`project-${p.id}`)
        p.modules?.forEach((m) => {
          keys.add(`module-${m.id}`)
          m.stages?.forEach((s) => {
            keys.add(`stage-${s.id}`)
          })
        })
      })
      setExpandedItems(keys)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSelectProject(project: Project) {
    try {
      // Load full project with hierarchy
      const response = await fetch(`/api/projects/${project.id}`)
      const result = await response.json()
      const loadedProject = result.data
      setSelectedProject(loadedProject)
      // Reset expanded items for new project - stages start collapsed
      setExpandedItems(new Set())
    } catch (error) {
      console.error('Failed to load project details:', error)
    }
  }

  function toggleExpand(key: string) {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900">
        <div className="max-w-8xl mx-auto p-6">
          <div className="text-center text-dark-300">Loading roadmap...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 overflow-hidden">
      <div className="max-w-8xl mx-auto p-6 h-screen flex flex-col">
        {selectedProject ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <ProjectDetailView
              project={selectedProject}
              expandedItems={expandedItems}
              onToggleExpand={toggleExpand}
              onBack={() => setSelectedProject(null)}
            />
          </div>
        ) : (
          <ProjectGridView projects={projects} onSelectProject={handleSelectProject} />
        )}
      </div>
    </div>
  )
}

function ProjectGridView({
  projects,
  onSelectProject,
}: {
  projects: Project[]
  onSelectProject: (project: Project) => void
}) {
  if (projects.length === 0) {
    return (
      <div className="text-center text-dark-400 py-12">
        <p>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={`${getStatusBorderColor(project.status)} p-4 rounded border cursor-pointer transition bg-dark-700/40 border-dark-600 hover:bg-dark-600/50 hover:shadow-lg`}
          onClick={() => onSelectProject(project)}
        >
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-dark-400 line-clamp-2">{project.description}</p>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-dark-600">
              <div className="flex-1">
                <div className="w-full bg-dark-800 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-red-500/60 to-red-400/40 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.round(project.progress || 0)}%` }}
                  />
                </div>
                <p className="text-xs text-dark-300 mt-1">{Math.round(project.progress || 0)}%</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

function ProjectDetailView({
  project,
  expandedItems,
  onToggleExpand,
  onBack,
}: {
  project: Project
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {project.modules && project.modules.length > 0 ? (
        <TimelineView
          modules={project.modules}
          expandedItems={expandedItems}
          onToggleExpand={onToggleExpand}
        />
      ) : (
        <div className="text-center text-dark-400">No modules yet</div>
      )}
    </div>
  )
}

function TimelineView({
  modules,
  expandedItems,
  onToggleExpand,
}: {
  modules: Module[]
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
}) {
  const timelineContainerRef = useRef<HTMLDivElement>(null)
  const firstIncompleteRef = useRef<HTMLDivElement>(null)

  // Scroll to first incomplete stage on load
  useEffect(() => {
    if (firstIncompleteRef.current && timelineContainerRef.current) {
      // Use setTimeout to ensure DOM is rendered
      setTimeout(() => {
        const container = timelineContainerRef.current
        const element = firstIncompleteRef.current
        
        if (container && element) {
          // Position the element ~150px from the top for clear visibility
          const elementTop = element.offsetTop
          const scrollPosition = Math.max(0, elementTop - 150)
          
          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          })
        }
      }, 500)
    }
  }, [modules])

  // Helper to format dates
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'TBD'
    try {
      const date = new Date(dateStr)
      const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    } catch {
      return dateStr
    }
  }

  // Module color mapping
  const moduleColors: Record<string, { bg: string; border: string; text: string }> = {
    'AMS Module': { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    'Infrastructure': { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    'API Development': { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    'Testing & QA': { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  }

  // Flatten all stages from all modules with their module info
  const allStages = modules.flatMap((module) =>
    (module.stages || []).map((stage) => ({
      ...stage,
      moduleName: module.name,
      moduleIcon: module.icon,
      modulePriority: module.priority,
    }))
  )

  // Sort by delivery date
  const sortedStages = allStages.sort((a, b) => {
    if (!a.deliveryDate) return 1
    if (!b.deliveryDate) return -1
    return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
  })

  // Check if stage is on time / behind / ahead
  const getDateStatus = (dateStr: string | undefined) => {
    if (!dateStr) return 'unknown'
    const stageDate = new Date(dateStr)
    const today = new Date()
    const daysUntil = Math.floor((stageDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return 'late'
    if (daysUntil > 60) return 'ahead'
    return 'on-track'
  }

  // Find the FIRST incomplete stage to scroll to
  let firstIncompleteId: number | null = null
  for (let i = 0; i < sortedStages.length; i++) {
    const status = calculateStatus(sortedStages[i].points).toString()
    if (status !== 'completed') {
      firstIncompleteId = sortedStages[i].id
      break
    }
  }

  return (
    <div ref={timelineContainerRef} className="relative flex-1 py-4 overflow-y-auto pr-4 flex flex-col">
      {/* Timeline line container */}
      <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
        <div className="absolute top-0 bottom-0 bg-gradient-to-b from-red-500/40 via-red-500/25 to-red-500/40" style={{ width: '5px', left: '0.85rem', height: '100%' }} />
      </div>

      {/* Timeline items */}
      <div className="relative space-y-6 flex-1 flex flex-col">
        {sortedStages.map((stage, idx) => {
          const stageKey = `stage-${stage.id}`
          const expanded = expandedItems.has(stageKey)
          const stageStatus = calculateStatus(stage.points).toString()
          const dateStatus = getDateStatus(stage.deliveryDate)
          const isFirstIncomplete = stage.id === firstIncompleteId

          return (
            <div key={stage.id} className="relative flex gap-4" ref={isFirstIncomplete ? firstIncompleteRef : null}>
              {/* Timeline dot - centered */}
              <div className="flex flex-col items-center pt-0.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 ring-2 ring-dark-900 shadow-sm relative z-10 ${
                  stageStatus === 'completed' ? 'bg-green-500' :
                  stageStatus === 'in-progress' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}>
                  {stageStatus === 'completed' ? (
                    <CheckCircle size={18} className="text-white" />
                  ) : stageStatus === 'in-progress' ? (
                    <Zap size={18} className="text-white" />
                  ) : (
                    <Clock size={18} className="text-white" />
                  )}
                </div>
              </div>

              {/* Card content */}
              <div
                onClick={() => onToggleExpand(stageKey)}
                className="flex-1 cursor-pointer py-1"
              >
                <div className="rounded-lg border border-dark-600/50 bg-dark-800/30 p-4 transition-all duration-200 hover:border-dark-500/80 hover:bg-dark-800/50 hover:shadow-sm">
                  {/* Header - Title with code */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-white leading-tight">{stage.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-dark-500 bg-dark-700/50 px-2 py-1 rounded">
                        {stage.moduleName.substring(0, 2).toUpperCase()}
                      </span>
                      {expanded ? (
                        <ChevronDown size={16} className="text-dark-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight size={16} className="text-dark-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-dark-400 mb-3 line-clamp-2">{stage.moduleName}</p>

                  {/* Status and Priority badges row */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
                      stageStatus === 'completed' ? 'bg-green-500/15 text-green-400' :
                      stageStatus === 'in-progress' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        stageStatus === 'completed' ? 'bg-green-400' :
                        stageStatus === 'in-progress' ? 'bg-blue-400' :
                        'bg-yellow-400'
                      }`} />
                      {stageStatus === 'completed' ? 'Shipped' : stageStatus === 'in-progress' ? 'In progress' : 'Pending'}
                    </div>

                    {/* Priority badge */}
                    <div className={`px-2 py-1 rounded text-xs font-medium bg-dark-700/50 ${getPriorityColor(stage.priority || 'medium')}`}>
                      {getPriorityLabel(stage.priority || 'medium')}
                    </div>

                    {/* Date - aligned right */}
                    <div className={`ml-auto text-xs font-medium ${
                      dateStatus === 'late' ? 'text-red-400' :
                      dateStatus === 'ahead' ? 'text-green-400' :
                      'text-dark-400'
                    }`}>
                      {formatDate(stage.deliveryDate)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-dark-400 font-medium">Progression</span>
                      <span className={`text-xs font-semibold ${(stage.progress || 0) === 100 ? 'text-green-400' : 'text-dark-300'}`}>{Math.round(stage.progress || 0)}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          (stage.progress || 0) === 100
                            ? 'bg-gradient-to-r from-green-500/60 to-green-400/40'
                            : 'bg-gradient-to-r from-red-500/60 to-red-400/40'
                        }`}
                        style={{ width: `${stage.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Expanded deliverables */}
                  {expanded && stage.points && stage.points.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dark-600/30 space-y-2">
                      <h4 className="text-xs font-semibold uppercase text-dark-400 tracking-wider">Deliverables</h4>
                      <div className="space-y-1.5">
                        {stage.points.map((point) => (
                          <div
                            key={point.id}
                            className={`flex items-start gap-2.5 text-xs p-2 rounded transition-colors ${
                              point.completed
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-dark-700/20 text-dark-300 hover:bg-dark-700/40'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={point.completed}
                              readOnly
                              disabled
                              className="mt-0.5 cursor-default accent-red-500"
                            />
                            <span className="flex-1">{point.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ModuleItemBoard({
  module,
  expandedItems,
  onToggleExpand,
}: {
  module: Module
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
}) {
  const moduleKey = `module-${module.id}`
  const expanded = expandedItems.has(moduleKey)
  const status = calculateStatus(module.stages).toString()

  return (
    <div>
      <Card
        className={`${getStatusBorderColor(status)} p-3 rounded border cursor-pointer transition bg-dark-700/30 border-dark-600 hover:bg-dark-600/40`}
        onClick={() => onToggleExpand(moduleKey)}
      >
        <div className="flex items-center gap-3">
          <div className="p-0 text-dark-300">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>

          {module.icon && getIconByName(module.icon) && (
            <div className="text-dark-200">
              {(() => {
                const IconComponent = getIconByName(module.icon)
                return IconComponent ? <IconComponent size={18} /> : null
              })()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-bold text-white truncate">{module.name}</h4>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <Badge className={`${getPriorityColor(module.priority || 'medium')} font-medium px-2 py-1 flex items-center gap-1`}>
                {renderPriorityIcon(module.priority || 'medium')}
                <span className="text-xs">{getPriorityLabel(module.priority || 'medium')}</span>
              </Badge>
              <span className="text-xs text-dark-300">{Math.round(module.progress || 0)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {expanded && module.stages && (
        <div className="ml-4 mt-2 space-y-2 border-l-2 border-dark-600 pl-4">
          {module.stages.map((stage) => (
            <StageItemBoard
              key={stage.id}
              stage={stage}
              expandedItems={expandedItems}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StageItemBoard({
  stage,
  expandedItems,
  onToggleExpand,
}: {
  stage: Stage
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
}) {
  const stageKey = `stage-${stage.id}`
  const expanded = expandedItems.has(stageKey)
  const stageStatus = calculateStatus(stage.points).toString()

  return (
    <div>
      <Card
        className={`${getStatusBorderColor(stageStatus)} p-2 rounded border text-sm transition bg-dark-700/20 border-dark-600 hover:bg-dark-600/30`}
        onClick={() => onToggleExpand(stageKey)}
      >
        <div className="flex items-center gap-2">
          <div className="p-0 text-dark-300">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>

          {stage.icon && getIconByName(stage.icon) && (
            <div className="text-dark-200">
              {(() => {
                const IconComponent = getIconByName(stage.icon)
                return IconComponent ? <IconComponent size={14} /> : null
              })()}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-semibold text-white truncate">{stage.name}</h5>
            <div className="flex gap-1.5 mt-1 flex-wrap items-center text-xs">
              <span className="text-dark-400">📅 {stage.deliveryDate || 'N/A'}</span>
              <Badge className={`${getStatusColor(stageStatus)} px-1.5 py-0.5 text-xs`}>
                {renderStatusIcon(stageStatus)}
              </Badge>
              <Badge className={`${getPriorityColor(stage.priority || 'medium')} px-1.5 py-0.5 text-xs flex items-center gap-1`}>
                {renderPriorityIcon(stage.priority || 'medium')}
                <span>{getPriorityLabel(stage.priority || 'medium')}</span>
              </Badge>
              <span className="text-dark-300">{Math.round(stage.progress || 0)}%</span>
            </div>
          </div>
        </div>
      </Card>

      {expanded && stage.points && stage.points.length > 0 && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-dark-600 pl-4">
          {stage.points.map((point) => (
            <div
              key={point.id}
              className={`p-1.5 rounded text-xs transition ${
                point.completed
                  ? 'bg-green-600/20 text-green-300 line-through'
                  : 'bg-dark-700/10 text-dark-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={point.completed}
                  readOnly
                  disabled
                  className="cursor-default accent-red-500"
                />
                <span className="flex-1 truncate">{point.name}</span>
                <Badge className={`${getPriorityColor(point.priority || 'medium')} px-1 py-0 text-xs flex items-center gap-0.5`}>
                  {renderPriorityIcon(point.priority || 'medium')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
