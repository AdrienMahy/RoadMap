import { useState, useEffect, useRef } from 'react'
import { fetchProjects } from '../lib/api'
import { Card } from '../components/Card'
import { Badge } from '../components/Badge'
import { CommentsOffCanvas } from '../components/CommentsOffCanvas'
import { useAuth } from '../contexts/AuthContext'
import { ChevronDown, ChevronRight, CheckCircle, Clock, Zap, AlertCircle, AlertTriangle, AlertOctagon, Minus, MessageCircle, Calendar, BadgeCheck, ArrowLeft } from 'lucide-react'
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
  completedAt?: string
  priority: string
  orderIndex: number
}

interface Stage {
  id: number
  moduleId: number
  name: string
  description?: string
  deliveryDate?: string
  validatedAt?: string
  icon?: string
  priority: string
  status: string
  progress: number
  orderIndex: number
  points?: Point[]
  commentCount?: number
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
  const [commentsPanel, setCommentsPanel] = useState<{ isOpen: boolean; targetType: 'project' | 'module' | 'stage'; targetId: number; projectId: number; targetName?: string }>({ isOpen: false, targetType: 'project', targetId: 0, projectId: 0 })

  useEffect(() => {
    loadProjects()
  }, [])

  // Listen for notification clicks to open comments
  useEffect(() => {
    const handleViewNotification = (event: Event) => {
      console.log('📥 Received viewNotification event:', event)
      const customEvent = event as CustomEvent
      const { targetType, targetId, projectId } = customEvent.detail
      console.log('Event details:', { targetType, targetId, projectId })

      if (!projectId) {
        console.error('No projectId in notification')
        return
      }

      // Load the full project with hierarchy
      const loadProject = async () => {
        try {
          console.log('Loading project:', projectId)
          const response = await fetch(`/api/projects/${projectId}`)
          const result = await response.json()
          const loadedProject = result.data
          
          console.log('Project loaded successfully')
          
          // Update selected project
          setSelectedProject(loadedProject)
          
          // Reset expanded items
          setExpandedItems(new Set())
          
          // Open comments panel with loaded project
          setCommentsPanel({
            isOpen: true,
            targetType,
            targetId,
            projectId,
            targetName: undefined,
          })
        } catch (error) {
          console.error('Failed to load project:', error)
        }
      }
      
      loadProject()
    }

    console.log('✅ Setting up viewNotification listener')
    window.addEventListener('viewNotification', handleViewNotification as EventListener)
    return () => {
      console.log('🛑 Removing viewNotification listener')
      window.removeEventListener('viewNotification', handleViewNotification as EventListener)
    }
  }, [projects])



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
              onOpenComments={(targetType, targetId, targetName) => {
                setCommentsPanel({ isOpen: true, targetType, targetId, projectId: selectedProject?.id || 0, targetName })
              }}
            />
          </div>
        ) : (
          <ProjectGridView projects={projects} onSelectProject={handleSelectProject} />
        )}
      </div>

      {/* Comments OffCanvas Panel */}
      <CommentsOffCanvas
        isOpen={commentsPanel.isOpen}
        onClose={() => setCommentsPanel({ ...commentsPanel, isOpen: false })}
        targetType={commentsPanel.targetType}
        targetId={commentsPanel.targetId}
        projectId={commentsPanel.projectId}
        targetName={commentsPanel.targetName}
      />
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
  const { user } = useAuth()

  if (projects.length === 0) {
    return (
      <div className="text-center text-dark-400 py-12">
        <p>No projects yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-red-950/30 to-dark-900 border border-red-900/30 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white">
          Welcome, {user?.firstName || user?.username}! 👋
        </h2>
        <p className="text-dark-300 mt-2">
          Browse your projects and collaborate with your team.
        </p>
      </div>

      {/* Projects Grid */}
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
    </div>
  )
}

function ProjectDetailView({
  project,
  expandedItems,
  onToggleExpand,
  onBack,
  onOpenComments,
}: {
  project: Project
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
  onBack: () => void
  onOpenComments: (targetType: 'project' | 'module' | 'stage', targetId: number, targetName?: string) => void
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with back button */}
      <div className="flex items-center gap-3 pb-4 border-b border-dark-600 mb-4">
        <button
          onClick={onBack}
          className="p-1.5 rounded hover:bg-dark-600/50 transition text-dark-300 hover:text-white"
          title="Back to projects"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-white">{project.name}</h2>
      </div>

      {project.modules && project.modules.length > 0 ? (
        <TimelineView
          modules={project.modules}
          expandedItems={expandedItems}
          onToggleExpand={onToggleExpand}
          onOpenComments={onOpenComments}
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
  onOpenComments,
}: {
  modules: Module[]
  expandedItems: Set<string>
  onToggleExpand: (key: string) => void
  onOpenComments: (targetType: 'project' | 'module' | 'stage', targetId: number, targetName?: string) => void
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
  for (const module of modules) {
    for (const stage of module.stages || []) {
      const status = calculateStatus(stage.points).toString()
      if (status !== 'completed') {
        firstIncompleteId = stage.id
        break
      }
    }
    if (firstIncompleteId) break
  }

  return (
    <div ref={timelineContainerRef} className="relative flex-1 py-4 overflow-y-auto pr-4 flex flex-col">
      {/* Timeline items - Modules and their Stages */}
      <div className="relative space-y-6 flex-1 flex flex-col">
        {modules.map((module) => {
          const moduleKey = `module-${module.id}`
          const moduleExpanded = expandedItems.has(moduleKey)
          const moduleStatus = calculateStatus(module.stages).toString()
          
          return (
            <div key={module.id} className="space-y-3">
              {/* MODULE HEADER */}
              <div
                onClick={() => onToggleExpand(moduleKey)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dark-600/50 bg-dark-800/30 cursor-pointer hover:bg-dark-800/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  {moduleExpanded ? (
                    <ChevronDown size={18} className="text-dark-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight size={18} className="text-dark-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">{module.name}</h3>
                  {module.description && (
                    <p className="text-xs text-dark-400 mt-1">{module.description}</p>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                  moduleStatus === 'completed' ? 'bg-green-500/15 text-green-400' :
                  moduleStatus === 'in-progress' ? 'bg-blue-500/15 text-blue-400' :
                  moduleStatus === 'stopped' ? 'bg-red-500/15 text-red-400' :
                  'bg-yellow-500/15 text-yellow-400'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    moduleStatus === 'completed' ? 'bg-green-400' :
                    moduleStatus === 'in-progress' ? 'bg-blue-400' :
                    moduleStatus === 'stopped' ? 'bg-red-400' :
                    'bg-yellow-400'
                  }`} />
                  {moduleStatus === 'completed' ? 'Shipped' : moduleStatus === 'in-progress' ? 'In progress' : moduleStatus === 'stopped' ? 'Stopped' : 'Pending'}
                </div>
                {module.progress !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-dark-700/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          module.progress === 100
                            ? 'bg-green-500/60'
                            : 'bg-red-500/60'
                        }`}
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-dark-300">{Math.round(module.progress)}%</span>
                  </div>
                )}
              </div>

              {/* STAGES WITHIN MODULE */}
              {moduleExpanded && module.stages && module.stages.length > 0 && (
                <div className="pl-6 space-y-4 relative">
                  {/* Timeline line for this module's stages */}
                  <div className="absolute left-0 top-0 bottom-0 pointer-events-none">
                    <div className="absolute top-0 bottom-0 bg-gradient-to-b from-red-500/40 via-red-500/25 to-red-500/40" style={{ width: '5px', left: 'calc(1.5rem + 0.875rem - 2.5px)' }} />
                  </div>
                  {module.stages.map((stage) => {
                    const stageKey = `stage-${stage.id}`
                    const stageExpanded = expandedItems.has(stageKey)
                    const stageStatus = stage.status === 'stopped' ? 'stopped' : calculateStatus(stage.points).toString()
                    const dateStatus = getDateStatus(stage.deliveryDate)
                    const isFirstIncomplete = stage.id === firstIncompleteId

                    return (
                      <div key={stage.id} className="relative flex gap-4" ref={isFirstIncomplete ? firstIncompleteRef : null}>
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center justify-start">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 ring-2 ring-dark-900 shadow-sm relative z-10 ${
                            stageStatus === 'completed' ? 'bg-green-500' :
                            stageStatus === 'in-progress' ? 'bg-blue-500' :
                            stageStatus === 'stopped' ? 'bg-red-600' :
                            'bg-red-500'
                          }`}>
                            {stageStatus === 'completed' ? (
                              <CheckCircle size={16} className="text-white" />
                            ) : stageStatus === 'in-progress' ? (
                              <Zap size={16} className="text-white" />
                            ) : stageStatus === 'stopped' ? (
                              <AlertOctagon size={16} className="text-white" />
                            ) : (
                              <Clock size={16} className="text-white" />
                            )}
                          </div>
                        </div>

                        {/* Stage Card */}
                        <div
                          onClick={() => onToggleExpand(stageKey)}
                          className="flex-1 cursor-pointer py-1"
                        >
                          <div className="rounded-lg border border-dark-600/50 bg-dark-800/30 p-4 transition-all duration-200 hover:border-dark-500/80 hover:bg-dark-800/50 hover:shadow-sm">
                            {/* Header - Title */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-white leading-tight">{stage.name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenComments('stage', stage.id, stage.name)
                                  }}
                                  className="text-dark-400 hover:text-blue-400 transition p-1 rounded hover:bg-dark-700/50 relative"
                                  title="Comments"
                                >
                                  <MessageCircle size={16} />
                                  {stage.commentCount && stage.commentCount > 0 && (
                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                  )}
                                </button>
                                {stageExpanded ? (
                                  <ChevronDown size={16} className="text-dark-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={16} className="text-dark-400 flex-shrink-0" />
                                )}
                              </div>
                            </div>

                            {/* Status and Priority badges row */}
                            <div className="flex flex-wrap gap-2 items-center mb-3">
                              {/* Status badge */}
                              <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all ${
                                stageStatus === 'completed' ? 'bg-green-500/15 text-green-400' :
                                stageStatus === 'in-progress' ? 'bg-blue-500/15 text-blue-400' :
                                stageStatus === 'stopped' ? 'bg-red-500/15 text-red-400' :
                                'bg-yellow-500/15 text-yellow-400'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  stageStatus === 'completed' ? 'bg-green-400' :
                                  stageStatus === 'in-progress' ? 'bg-blue-400' :
                                  stageStatus === 'stopped' ? 'bg-red-400' :
                                  'bg-yellow-400'
                                }`} />
                                {stageStatus === 'completed' ? 'Shipped' : stageStatus === 'in-progress' ? 'In progress' : stageStatus === 'stopped' ? 'Stopped' : 'Pending'}
                              </div>

                              {/* Dates section - aligned right */}
                              <div className="ml-auto flex flex-col gap-1 items-end text-xs">
                                {/* Delivery date */}
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                                  dateStatus === 'late' ? 'bg-red-500/15 text-red-300' :
                                  dateStatus === 'ahead' ? 'bg-blue-500/15 text-blue-300' :
                                  'bg-blue-500/10 text-blue-400'
                                }`}>
                                  <Calendar size={12} />
                                  <span>{formatDate(stage.deliveryDate)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-dark-400 font-medium">Progress</span>
                                <span className={`text-xs font-semibold ${(stage.progress || 0) === 100 ? 'text-green-400' : 'text-dark-300'}`}>{Math.round(stage.progress || 0)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-dark-700/30 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    (stage.progress || 0) === 100
                                      ? 'bg-green-500/60'
                                      : 'bg-red-500/60'
                                  }`}
                                  style={{ width: `${stage.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            {/* Expanded Points */}
                            {stageExpanded && stage.points && stage.points.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-dark-600/30 space-y-2">
                                <h5 className="text-xs font-semibold uppercase text-dark-400 tracking-wider">Points</h5>
                                <div className="space-y-1.5">
                                  {stage.points.map((point) => (
                                    <div
                                      key={point.id}
                                      className={`flex items-start gap-2 text-xs p-2 rounded transition-colors ${
                                        point.completed
                                          ? 'bg-green-500/10 text-green-400'
                                          : 'bg-dark-700/20 text-dark-300'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={point.completed}
                                        readOnly
                                        className="mt-0.5 cursor-default accent-red-500"
                                      />
                                      <span>{point.name}</span>
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
              )}
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
  // Check if stage is manually stopped, otherwise calculate from points
  const stageStatus = stage.status === 'stopped' ? 'stopped' : calculateStatus(stage.points).toString()

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
            <div className="flex gap-2 mt-2 flex-wrap items-center text-xs">
              {/* Delivery date badge - compact */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium ${
                'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                <Calendar size={12} />
                <span>{stage.deliveryDate || 'N/A'}</span>
              </div>
              
              {/* Validation date badge - if validated */}
              {stage.validatedAt && (
                <div className="flex items-center gap-1 px-2 py-1 rounded border bg-green-500/10 text-green-400 border-green-500/20 font-semibold text-xs">
                  <BadgeCheck size={12} />
                  <span>{new Date(stage.validatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
              
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
