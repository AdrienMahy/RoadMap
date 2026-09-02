import { useState, useEffect } from 'react'
import {
  fetchProjects,
  fetchProject,
  createProject,
  deleteProject,
  createModule,
  updateModule,
  updateStage,
  updatePoint,
  deleteModule,
  deleteStage,
  deletePoint,
  createStage,
  createPoint,
} from '../lib/api'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Badge } from '../components/Badge'
import { IconPicker } from '../components/IconPicker'
import { PrioritySelector } from '../components/PrioritySelector'
import { UsersManagement } from '../components/UsersManagement'
import { ChevronDown, ChevronRight, Trash2, Save, CheckCircle, Clock, Zap, AlertCircle, AlertTriangle, AlertOctagon, Minus, BarChart3, Users, ShieldAlert } from 'lucide-react'
import { getStatusColor, calculateStatus, getPriorityColor, getStatusBorderColor, getPriorityIcon, getStatusIconName, getPriorityIconName, getStatusIconColor, getPriorityIconColor, getPriorityLabel } from '../lib/status'
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
  completedAt?: string // ISO date string
  priority: string
  orderIndex: number
}

interface Stage {
  id: number
  moduleId: number
  name: string
  description?: string
  deliveryDate?: string
  validatedAt?: string // ISO date string - when all points completed
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

// Edit panel component
function EditPanel({
  item,
  data,
  onUpdate,
}: {
  item: { type: 'project' | 'module' | 'stage' | 'point'; id: number }
  data: any
  onUpdate: () => void
}) {
  const [formData, setFormData] = useState(data)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      if (item.type === 'module') {
        await updateModule(item.id, formData)
      } else if (item.type === 'stage') {
        await updateStage(item.id, formData)
      } else if (item.type === 'point') {
        await updatePoint(item.id, { completed: formData.completed })
      }
      onUpdate()
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this item?')) return
    setSaving(true)
    try {
      if (item.type === 'module') {
        await deleteModule(item.id)
      } else if (item.type === 'stage') {
        await deleteStage(item.id)
      } else if (item.type === 'point') {
        await deletePoint(item.id)
      }
      onUpdate()
    } catch (error) {
      console.error('Failed to delete:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white capitalize">
          Edit {item.type}
        </h3>
        {(item.type === 'stage' || item.type === 'point') && (
          <Badge className={getStatusColor(formData.status || 'planned')}>
            {formData.status || 'planned'}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">Name</label>
          <Input
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
          />
        </div>

        {/* Description */}
        {item.type !== 'point' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              className="h-24"
            />
          </div>
        )}

        {/* Delivery Date (for stages) */}
        {item.type === 'stage' && (
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">Delivery Date</label>
            <Input
              type="date"
              value={formData.deliveryDate || ''}
              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
            />
          </div>
        )}

        {/* Icon (for modules & stages) */}
        {(item.type === 'module' || item.type === 'stage') && (
          <IconPicker
            value={formData.icon}
            onChange={(icon) => setFormData({ ...formData, icon })}
            label={`Icon`}
          />
        )}

        {/* Priority (for modules, stages & points) */}
        {(item.type === 'module' || item.type === 'stage' || item.type === 'point') && (
          <PrioritySelector
            value={formData.priority || 'medium'}
            onChange={(priority) => setFormData({ ...formData, priority })}
            label="Priority"
          />
        )}



        {/* Completed (for points) */}
        {item.type === 'point' && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={formData.completed || false}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
              className="cursor-pointer accent-red-500"
            />
            <label htmlFor="completed" className="text-sm text-dark-300 cursor-pointer">
              Mark as completed
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-dark-600">
          <Button
            onClick={handleSave}
            disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2 text-xs"
          >
            <Save size={16} />
            Save
          </Button>
          <Button
            onClick={handleDelete}
            disabled={saving}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 flex items-center justify-center gap-2 text-xs"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DevPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set())
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', description: '', status: 'planned' })
  const [selectedItem, setSelectedItem] = useState<{ type: 'project' | 'module' | 'stage' | 'point'; id: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'users'>('projects')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await fetchProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateProject() {
    if (!projectForm.name.trim()) return
    try {
      await createProject(projectForm)
      setProjectForm({ name: '', description: '', status: 'planned' })
      setShowNewProjectDialog(false)
      loadProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  async function handleExpandProject(id: number) {
    if (expandedProject === id) {
      setExpandedProject(null)
    } else {
      await reloadProject(id)
      setExpandedProject(id)
    }
  }

  async function reloadProject(id: number) {
    try {
      const project = await fetchProject(id)
      setProjects((prev) => prev.map((p) => (p.id === id ? project : p)))
    } catch (error) {
      console.error('Failed to reload project:', error)
    }
  }

  async function handleCreateModule(projectId: number) {
    const name = prompt('Module name:')
    if (!name) return
    try {
      await createModule({ projectId, name, status: 'planned' })
      handleExpandProject(projectId)
    } catch (error) {
      console.error('Failed to create module:', error)
    }
  }

  async function handleAddPoint(stageId: number, pointName: string) {
    if (!pointName.trim()) return
    try {
      await createPoint({
        stageId,
        name: pointName,
        description: '',
        completed: false,
      })
      // Find the project and reload it WITHOUT closing the tree
      for (const project of projects) {
        for (const module of project.modules || []) {
          for (const stage of module.stages || []) {
            if (stage.id === stageId) {
              await reloadProject(project.id)
              return
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to create point:', error)
    }
  }

  async function handleMoveItem(itemType: 'point' | 'stage', itemId: number, parentId: number, direction: 'up' | 'down') {
    try {
      // Get the list of items (points or stages) to reorder
      let items: any[] = []

      if (itemType === 'point' && expandedProject) {
        const project = projects.find((p) => p.id === expandedProject)
        if (project) {
          for (const module of project.modules || []) {
            for (const stage of module.stages || []) {
              if (stage.id === parentId) {
                items = (stage.points || []).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                break
              }
            }
          }
        }
      } else if (itemType === 'stage' && expandedProject) {
        const project = projects.find((p) => p.id === expandedProject)
        if (project) {
          for (const module of project.modules || []) {
            if (module.id === parentId) {
              items = (module.stages || []).sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
              break
            }
          }
        }
      }

      if (items.length === 0) return

      // Find current position
      const currentPosition = items.findIndex((item) => item.id === itemId)
      if (currentPosition < 0) return

      const newPosition = direction === 'up' ? currentPosition - 1 : currentPosition + 1
      if (newPosition < 0 || newPosition >= items.length) return

      // Swap items in array and renumber ALL items with sequential orderIndex (0, 1, 2, 3...)
      const [movedItem] = items.splice(currentPosition, 1)
      items.splice(newPosition, 0, movedItem)

      // Update ALL items with new sequential orderIndex
      const updates = items.map((item, idx) => {
        if (itemType === 'point') {
          return updatePoint(item.id, { orderIndex: idx })
        } else {
          return updateStage(item.id, { orderIndex: idx })
        }
      })

      await Promise.all(updates)

      // Reload to reflect changes
      if (expandedProject) {
        await reloadProject(expandedProject)
      }
    } catch (error) {
      console.error('Failed to move item:', error)
    }
  }

  function findItemInProjects(id: number): any {
    for (const project of projects) {
      if (project.id === id) return project
      for (const module of project.modules || []) {
        if (module.id === id) return module
        for (const stage of module.stages || []) {
          if (stage.id === id) return stage
          for (const point of stage.points || []) {
            if (point.id === id) return point
          }
        }
      }
    }
    return {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="border-b border-red-900/30 bg-gradient-to-r from-red-950/40 to-dark-900 p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert size={32} className="text-red-500" />
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 border-b border-red-900/30">
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'text-red-400 border-red-400'
                  : 'text-dark-400 border-transparent hover:text-dark-300'
              }`}
            >
              <BarChart3 size={18} />
              Projects
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium border-b-2 transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'text-red-400 border-red-400'
                  : 'text-dark-400 border-transparent hover:text-dark-300'
              }`}
            >
              <Users size={18} />
              Users
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'projects' ? (
          <>
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-6 p-6 h-[calc(100vh-220px)]">
          {/* Left Panel */}
          <div className="col-span-2 overflow-auto pr-4 space-y-4">
            {!showNewProjectDialog && (
              <Button
                onClick={() => setShowNewProjectDialog(true)}
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                + New Project
              </Button>
            )}

            {showNewProjectDialog && (
              <Card className="p-4 bg-dark-700 border-dark-600 space-y-3">
                <Input
                  placeholder="Project name"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="h-20"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateProject} className="flex-1 bg-green-600 hover:bg-green-700">
                    Create
                  </Button>
                  <Button onClick={() => setShowNewProjectDialog(false)} className="flex-1 bg-dark-600 hover:bg-dark-500">
                    Cancel
                  </Button>
                </div>
              </Card>
            )}

            {/* Project Tree */}
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id}>
                  <div
                    onClick={() => setSelectedItem({ type: 'project', id: project.id })}
                    className={`${getStatusBorderColor(project.status)} p-4 rounded border cursor-pointer transition ${
                      selectedItem?.type === 'project' && selectedItem?.id === project.id
                        ? 'bg-red-500/20 border-red-500'
                        : 'bg-dark-700/40 border-dark-600 hover:bg-dark-600/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExpandProject(project.id)
                          }}
                          className="p-0 text-dark-300"
                        >
                          {expandedProject === project.id ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{project.name}</h3>
                          <div className="flex gap-2 mt-2 flex-wrap items-center">
                            <span className="text-xs text-dark-300">{Math.round(project.progress || 0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedProject === project.id && (
                    <div className="ml-4 mt-2 space-y-2">
                      {project.modules && project.modules.length > 0 ? (
                        project.modules.map((module) => (
                          <ModuleItemTree
                            key={module.id}
                            module={module}
                            onSelect={(type, id) => setSelectedItem({ type, id })}
                            selectedItem={selectedItem}
                            onAddPoint={handleAddPoint}
                            expandedModules={expandedModules}
                            onToggleModule={(id) => {
                              setExpandedModules((prev) => {
                                const next = new Set(prev)
                                next.has(id) ? next.delete(id) : next.add(id)
                                return next
                              })
                            }}
                            expandedStages={expandedStages}
                            onToggleStage={(id) => {
                              setExpandedStages((prev) => {
                                const next = new Set(prev)
                                next.has(id) ? next.delete(id) : next.add(id)
                                return next
                              })
                            }}
                            onMoveItem={handleMoveItem}
                            stageParentId={module.id}
                            projectId={project.id}
                            onRefresh={reloadProject}
                          />
                        ))
                      ) : (
                        <div className="text-xs text-dark-400 italic">
                          {project.modules ? 'No modules yet' : 'Loading modules...'}
                        </div>
                      )}
                      <Button
                        onClick={() => handleCreateModule(project.id)}
                        className="w-full bg-dark-600 hover:bg-dark-500 text-xs py-2"
                      >
                        + Add Module
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Edit Form */}
          <div className="col-span-1 border-l border-dark-700 pl-6 overflow-auto">
            {selectedItem ? (
              <EditPanel
                item={selectedItem}
                data={findItemInProjects(selectedItem.id)}
                onUpdate={() => {
                  if (expandedProject) {
                    reloadProject(expandedProject)
                  } else {
                    loadProjects()
                  }
                  setSelectedItem(null)
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-dark-400 text-center">
                <p>Select an item from the list to edit</p>
              </div>
            )}
          </div>
        </div>
          </>
        ) : (
          <div className="p-6 h-[calc(100vh-220px)] overflow-auto">
            <UsersManagement />
          </div>
        )}
      </div>
    </div>
  )
}

// Tree component for modules
function ModuleItemTree({
  module,
  onSelect,
  selectedItem,
  onAddPoint,
  expandedModules,
  onToggleModule,
  expandedStages,
  onToggleStage,
  onMoveItem,
  stageParentId,
  projectId,
  onRefresh,
}: {
  module: Module
  onSelect: (type: string, id: number) => void
  selectedItem: { type: string; id: number } | null
  onAddPoint?: (stageId: number, pointName: string) => void
  expandedModules: Set<number>
  onToggleModule: (id: number) => void
  expandedStages: Set<number>
  onToggleStage: (id: number) => void
  onMoveItem: (type: 'point' | 'stage', itemId: number, parentId: number, direction: 'up' | 'down') => void
  stageParentId: number
  projectId: number
  onRefresh: (projectId: number) => void
}) {
  const expanded = expandedModules.has(module.id)
  const isSelected = selectedItem?.type === 'module' && selectedItem?.id === module.id

  const status = calculateStatus(module.stages).toString()

  return (
    <div>
      <div
        onClick={() => onSelect('module', module.id)}
        className={`${getStatusBorderColor(status)} p-3 rounded border cursor-pointer transition ${
          isSelected
            ? 'bg-red-500/20 border-red-500'
            : 'bg-dark-700/40 border-dark-600 hover:bg-dark-600/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <button onClick={(e) => { e.stopPropagation(); onToggleModule(module.id); }} className="p-0 text-dark-300">
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
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
      </div>

      {expanded && module.stages && (
        <div className="ml-4 mt-2 space-y-2">
          {module.stages.map((stage, stageIdx) => (
                <StageItemTree
                  key={stage.id}
                  stage={stage}
                  stageIdx={stageIdx}
                  totalStages={module.stages?.length || 0}
                  onSelect={onSelect}
                  selectedItem={selectedItem}
                  onAddPoint={onAddPoint}
                  expanded={expandedStages.has(stage.id)}
                  onToggleStage={onToggleStage}
                  onMoveItem={onMoveItem}
                  parentId={module.id}
                  projectId={projectId}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}
    </div>
  )
}

// Tree component for stages
function StageItemTree({
  stage,
  stageIdx,
  totalStages,
  onSelect,
  selectedItem,
  onAddPoint,
  expanded,
  onToggleStage,
  onMoveItem,
  parentId,
  projectId,
  onRefresh,
}: {
  stage: Stage
  stageIdx: number
  totalStages: number
  onSelect: (type: string, id: number) => void
  selectedItem: { type: string; id: number } | null
  onAddPoint?: (stageId: number, pointName: string) => void
  expanded: boolean
  onToggleStage: (id: number) => void
  onMoveItem: (type: 'point' | 'stage', itemId: number, parentId: number, direction: 'up' | 'down') => void
  parentId: number
  projectId: number
  onRefresh: (projectId: number) => void
}) {
  const [editingNewPoint, setEditingNewPoint] = useState(false)
  const [newPointName, setNewPointName] = useState('')
  const isSelected = selectedItem?.type === 'stage' && selectedItem?.id === stage.id

  const handleAddPoint = async () => {
    if (!newPointName.trim() || !onAddPoint) return
    await onAddPoint(stage.id, newPointName)
    setNewPointName('')
    setEditingNewPoint(false)
  }

  return (
    <div className={expanded ? 'bg-dark-700/20 rounded' : ''}>
      <div
        onClick={() => onSelect('stage', stage.id)}
        className={`${getStatusBorderColor(calculateStatus(stage.points).toString())} p-2 rounded border text-sm transition ${
          isSelected
            ? 'bg-red-500/20 border-red-500'
            : 'bg-dark-700/30 border-dark-600 hover:bg-dark-600/40'
        }`}
      >
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onToggleStage(stage.id); }} className="p-0 text-dark-300">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          {/* Move buttons */}
          <div className="flex gap-0.5">
            <button
              disabled={stageIdx === 0}
              onClick={(e) => { e.stopPropagation(); onMoveItem('stage', stage.id, parentId, 'up'); }}
              className="p-0.5 text-dark-400 hover:text-red-400 disabled:text-dark-500 disabled:cursor-not-allowed text-xs"
              title="Move up"
            >
              ↑
            </button>
            <button
              disabled={stageIdx === totalStages - 1}
              onClick={(e) => { e.stopPropagation(); onMoveItem('stage', stage.id, parentId, 'down'); }}
              className="p-0.5 text-dark-400 hover:text-red-400 disabled:text-dark-500 disabled:cursor-not-allowed text-xs"
              title="Move down"
            >
              ↓
            </button>
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
              {stage.validatedAt && (
                <span className="text-green-400 font-semibold flex items-center gap-1">
                  ✓ Validé le {new Date(stage.validatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
              <Badge className={`${getStatusColor(calculateStatus(stage.points).toString())} px-1.5 py-0.5 text-xs`}>
                {renderStatusIcon(calculateStatus(stage.points))}
              </Badge>
              <Badge className={`${getPriorityColor(stage.priority || 'medium')} px-1.5 py-0.5 text-xs flex items-center gap-1`}>
                {renderPriorityIcon(stage.priority || 'medium')}
                <span>{getPriorityLabel(stage.priority || 'medium')}</span>
              </Badge>
              <span className="text-dark-300">{Math.round(stage.progress || 0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {stage.points && stage.points.map((point, idx) => (
            <PointItemTree
              key={point.id}
              point={point}
              pointIdx={idx}
              totalPoints={stage.points?.length || 0}
              onSelect={onSelect}
              selectedItem={selectedItem}
              onMoveItem={onMoveItem}
              parentId={stage.id}
              onTogglePoint={(pointId: number, completed: boolean) => {
                console.log('[DEBUG] Toggling point', pointId, 'to completed:', completed)
                updatePoint(pointId, { completed })
                  .then((result) => {
                    console.log('[DEBUG] Point updated:', result)
                    onRefresh(projectId)
                  })
                  .catch((error) => {
                    console.error('[DEBUG] Error updating point:', error)
                  })
              }}
            />
          ))}
          
          {/* Add Point Line */}
          {editingNewPoint ? (
            <div className="p-2 rounded border border-red-500 bg-red-500/10 flex gap-1">
              <input
                type="text"
                value={newPointName}
                onChange={(e) => setNewPointName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddPoint()
                  if (e.key === 'Escape') setEditingNewPoint(false)
                }}
                onBlur={() => !newPointName.trim() && setEditingNewPoint(false)}
                autoFocus
                placeholder="Point name..."
                className="flex-1 bg-dark-600 border border-red-400 rounded px-2 py-1 text-xs text-white placeholder-dark-400 focus:outline-none"
              />
              <button
                onClick={handleAddPoint}
                disabled={!newPointName.trim()}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-dark-500 rounded text-xs text-white transition"
              >
                ✓
              </button>
            </div>
          ) : (
            <div
              onClick={() => setEditingNewPoint(true)}
              className="p-2 rounded border border-dashed border-dark-500 bg-dark-700/30 text-xs text-dark-400 cursor-pointer hover:bg-dark-600/30 hover:border-dark-400 transition flex items-center gap-2"
            >
              <span className="text-dark-500">+</span>
              <span>Add point...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Tree component for points
function PointItemTree({
  point,
  pointIdx,
  totalPoints,
  onSelect,
  selectedItem,
  onMoveItem,
  parentId,
  onTogglePoint,
}: {
  point: Point
  pointIdx: number
  totalPoints: number
  onSelect: (type: string, id: number) => void
  selectedItem: { type: string; id: number } | null
  onMoveItem: (type: 'point' | 'stage', itemId: number, parentId: number, direction: 'up' | 'down') => void
  parentId: number
  onTogglePoint?: (pointId: number, completed: boolean) => void
}) {
  const isSelected = selectedItem?.type === 'point' && selectedItem?.id === point.id
  const completedDate = point.completedAt ? new Date(point.completedAt) : null
  const formattedDate = completedDate ? completedDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }) : null

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`p-2 rounded border text-xs transition ${
        isSelected
          ? 'bg-red-500/20 border-red-500'
          : 'bg-dark-600/30 border-dark-600 hover:bg-dark-600/50'
      }`}
    >
      <div className="flex items-center gap-2">
        <label className="cursor-pointer flex items-center">
          <input
            type="checkbox"
            checked={point.completed}
            onChange={(e) => {
              if (onTogglePoint) {
                onTogglePoint(point.id, e.target.checked)
              }
            }}
            className="cursor-pointer accent-blue-500"
          />
        </label>
        
        {/* Move buttons */}
        <div className="flex gap-0.5">
          <button
            disabled={pointIdx === 0}
            onClick={(e) => { e.stopPropagation(); onMoveItem('point', point.id, parentId, 'up'); }}
            className="p-0.5 text-dark-400 hover:text-red-400 disabled:text-dark-500 disabled:cursor-not-allowed text-xs"
            title="Move up"
          >
            ↑
          </button>
          <button
            disabled={pointIdx === totalPoints - 1}
            onClick={(e) => { e.stopPropagation(); onMoveItem('point', point.id, parentId, 'down'); }}
            className="p-0.5 text-dark-400 hover:text-red-400 disabled:text-dark-500 disabled:cursor-not-allowed text-xs"
            title="Move down"
          >
            ↓
          </button>
        </div>
        
        <span 
          onClick={() => onSelect('point', point.id)}
          className={`flex-1 text-xs cursor-pointer ${point.completed ? 'line-through text-dark-400' : 'text-white'}`}
        >
          {point.name}
        </span>

        {/* Validation date */}
        {point.completed && formattedDate && (
          <span className="text-green-400 text-xs whitespace-nowrap">
            ✓ {formattedDate}
          </span>
        )}
      </div>
    </div>
  )
}
