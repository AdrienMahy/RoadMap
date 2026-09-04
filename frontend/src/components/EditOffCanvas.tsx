import { useEffect, useRef, useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Button } from './Button'
import { PrioritySelector } from './PrioritySelector'
import { IconPicker } from './IconPicker'
import { fetchProject, fetchModule, fetchStage, deleteProject, deleteModule, deleteStage, fetchProjects } from '../lib/api'

interface EditOffCanvasProps {
  isOpen: boolean
  onClose: () => void
  item: {
    type: 'project' | 'module' | 'stage'
    id: number
  } | null
  onSave: (data: any) => void
  onDelete?: () => void
  onAddChild?: (parentId: number, childType: string, name: string) => void
  isSaving?: boolean
}

export function EditOffCanvas({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
  onAddChild,
  isSaving = false,
}: EditOffCanvasProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [itemData, setItemData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [allProjects, setAllProjects] = useState<any[]>([])
  const [allModules, setAllModules] = useState<any[]>([])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Load item data when item or isOpen changes
  useEffect(() => {
    if (isOpen && item) {
      loadItemData()
      loadAvailableItems()
    }
  }, [isOpen, item?.id, item?.type])

  async function loadAvailableItems() {
    try {
      const projects = await fetchProjects()
      setAllProjects(projects)
      
      // Extract all modules from all projects
      const modules: any[] = []
      projects.forEach((project: any) => {
        if (project.modules) {
          modules.push(...project.modules)
        }
      })
      setAllModules(modules)
    } catch (error) {
      console.error('Failed to load available items:', error)
    }
  }

  async function loadItemData() {
    if (!item) return
    setLoading(true)
    try {
      let data: any
      if (item.type === 'project') {
        data = await fetchProject(item.id)
      } else if (item.type === 'module') {
        data = await fetchModule(item.id)
      } else if (item.type === 'stage') {
        data = await fetchStage(item.id)
      }
      console.log(`[DEBUG] Loaded ${item.type}:`, data)
      setItemData(data)
    } catch (error) {
      console.error(`Failed to load ${item?.type}:`, error)
      setItemData(null)
    } finally {
      setLoading(false)
    }
  }

  if (!item || !itemData) return null

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete this ${item.type}? This action cannot be undone.`)) {
      return
    }

    try {
      if (item.type === 'project') {
        await deleteProject(item.id)
      } else if (item.type === 'module') {
        await deleteModule(item.id)
      } else if (item.type === 'stage') {
        await deleteStage(item.id)
      }
      onClose()
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete this item')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-screen w-96 bg-dark-900 border-l border-dark-700 shadow-2xl z-50 overflow-y-auto transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white capitalize">Edit {item.type}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-700 rounded transition text-dark-300 hover:text-dark-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center text-dark-400">Loading...</div>
          ) : item.type === 'project' && itemData ? (
            <ProjectEditForm
              data={itemData}
              onSave={onSave}
              onDelete={handleDelete}
              onAddModule={onAddChild ? () => onAddChild(item.id, 'module', 'New Module') : undefined}
              isSaving={isSaving}
            />
          ) : item.type === 'module' && itemData ? (
            <ModuleEditForm
              data={itemData}
              onSave={onSave}
              onDelete={handleDelete}
              onAddStage={onAddChild ? () => onAddChild(item.id, 'stage', 'New Stage') : undefined}
              isSaving={isSaving}
              allProjects={allProjects}
            />
          ) : item.type === 'stage' && itemData ? (
            <StageEditForm
              data={itemData}
              onSave={onSave}
              onDelete={handleDelete}
              isSaving={isSaving}
              allModules={allModules}
            />
          ) : null}
        </div>
      </div>
    </>
  )
}

function ProjectEditForm({
  data,
  onSave,
  onDelete,
  onAddModule,
  isSaving,
}: {
  data: any
  onSave: (data: any) => void
  onDelete?: () => void
  onAddModule?: () => void
  isSaving?: boolean
}) {
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    setFormData(data)
  }, [data])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Project Name</label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter project name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter project description"
          className="h-24"
        />
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Save Project
          </Button>
          {onDelete && (
            <Button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="flex-1 bg-red-900 hover:bg-red-950 border border-red-700"
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          )}
        </div>
        {onAddModule && (
          <Button
            type="button"
            onClick={onAddModule}
            variant="secondary"
            className="w-full"
          >
            + Add Module
          </Button>
        )}
      </div>
    </form>
  )
}

function ModuleEditForm({
  data,
  onSave,
  onDelete,
  onAddStage,
  isSaving,
  allProjects,
}: {
  data: any
  onSave: (data: any) => void
  onDelete?: () => void
  onAddStage?: () => void
  isSaving?: boolean
  allProjects?: any[]
}) {
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    setFormData(data)
  }, [data])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Module Name</label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter module name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter module description"
          className="h-24"
        />
      </div>

      <PrioritySelector
        value={formData.priority || 'medium'}
        onChange={(priority) => setFormData({ ...formData, priority })}
        label="Priority"
      />

      <IconPicker
        value={formData.icon}
        onChange={(icon) => setFormData({ ...formData, icon })}
        label="Icon"
      />

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Move to Project</label>
        <select
          value={formData.projectId || ''}
          onChange={(e) => setFormData({ ...formData, projectId: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-dark-100 text-sm hover:border-dark-500 focus:border-red-500 focus:outline-none"
        >
          <option value="">Select a project...</option>
          {allProjects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Save Module
          </Button>
          {onDelete && (
            <Button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="flex-1 bg-red-900 hover:bg-red-950 border border-red-700"
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          )}
        </div>
        {onAddStage && (
          <Button
            type="button"
            onClick={onAddStage}
            variant="secondary"
            className="w-full"
          >
            + Add Stage
          </Button>
        )}
      </div>
    </form>
  )
}

function StageEditForm({
  data,
  onSave,
  onDelete,
  isSaving,
  allModules,
}: {
  data: any
  onSave: (data: any) => void
  onDelete?: () => void
  isSaving?: boolean
  allModules?: any[]
}) {
  const [formData, setFormData] = useState(data)

  useEffect(() => {
    setFormData(data)
  }, [data])

  const handleToggleStop = async (e: React.MouseEvent) => {
    e.preventDefault()
    const newStatus = formData.status === 'stopped' ? 'pending' : 'stopped'
    setFormData({ ...formData, status: newStatus })
    await onSave({ ...formData, status: newStatus })
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(formData)
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Stage Name</label>
        <Input
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter stage name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Description</label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter stage description"
          className="h-24"
        />
      </div>

      <PrioritySelector
        value={formData.priority || 'medium'}
        onChange={(priority) => setFormData({ ...formData, priority })}
        label="Priority"
      />

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Delivery Date</label>
        <Input
          type="date"
          value={formData.deliveryDate || ''}
          onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Move to Module</label>
        <select
          value={formData.moduleId || ''}
          onChange={(e) => setFormData({ ...formData, moduleId: parseInt(e.target.value) })}
          className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded text-dark-100 text-sm hover:border-dark-500 focus:border-red-500 focus:outline-none"
        >
          <option value="">Select a module...</option>
          {allModules?.map((module) => (
            <option key={module.id} value={module.id}>
              {module.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 pt-4">
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Save Stage
          </Button>
          {onDelete && (
            <Button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="flex-1 bg-red-900 hover:bg-red-950 border border-red-700"
            >
              <Trash2 size={16} className="mr-1" /> Delete
            </Button>
          )}
        </div>
        <Button
          type="button"
          onClick={handleToggleStop}
          disabled={isSaving}
          className={`w-full font-semibold ${
            formData.status === 'stopped'
              ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500/50'
              : 'bg-black hover:bg-dark-900 text-dark-300 border border-dark-600'
          }`}
        >
          {formData.status === 'stopped' ? '🛑 Stopped' : '⏸ Stop'}
        </Button>
      </div>
    </form>
  )
}
