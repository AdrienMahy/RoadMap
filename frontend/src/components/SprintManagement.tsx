import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { CalendarPlus, Layers3, Plus, Trash2 } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { addSprintItem, createSprint, deleteSprint, fetchProjects, fetchSprints, removeSprintItem } from '../lib/api'

interface Project {
  id: number
  name: string
  modules?: Module[]
}

interface Module {
  id: number
  name: string
  stages?: Stage[]
}

interface Stage {
  id: number
  name: string
}

interface SprintItem {
  id: number
  type: string
  project?: { name: string } | null
  module?: { name: string } | null
  stage?: { name: string } | null
}

interface Sprint {
  id: number
  name: string
  goal?: string | null
  startDate: string
  endDate: string
  items: SprintItem[]
}

type Target = { key: string; label: string; moduleId?: number; stageId?: number }

export function SprintManagement() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)
  const [target, setTarget] = useState('')
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    try {
      setLoading(true)
      const [sprintData, projectData] = await Promise.all([fetchSprints(), fetchProjects()])
      setSprints(sprintData)
      setProjects(projectData)
      setSelectedSprintId((current) => current && sprintData.some((sprint: Sprint) => sprint.id === current) ? current : sprintData[0]?.id ?? null)
    } catch {
      setError('Impossible de charger les données Sprint.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!form.name.trim() || !form.startDate || !form.endDate) return
    try {
      setSaving(true)
      await createSprint(form)
      setForm({ name: '', goal: '', startDate: '', endDate: '' })
      await load()
    } catch (creationError: any) {
      setError(creationError.response?.data?.message || 'Impossible de créer le Sprint.')
    } finally {
      setSaving(false)
    }
  }

  const targets: Target[] = projects.flatMap((project) => (project.modules || []).flatMap((module) => [
    { key: `module-${module.id}`, label: `${project.name} / Module / ${module.name}`, moduleId: module.id },
    ...(module.stages || []).map((stage) => ({ key: `stage-${stage.id}`, label: `${project.name} / Étape / ${stage.name}`, stageId: stage.id })),
  ]))
  const selectedSprint = sprints.find((sprint) => sprint.id === selectedSprintId)
  const selectedTarget = targets.find((item) => item.key === target)

  async function handleAddItem() {
    if (!selectedSprint || !selectedTarget) return
    try {
      setSaving(true)
      await addSprintItem(selectedSprint.id, { moduleId: selectedTarget.moduleId, stageId: selectedTarget.stageId })
      setTarget('')
      await load()
    } catch (addError: any) {
      setError(addError.response?.data?.message || 'Impossible d’ajouter cet élément.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce Sprint ?')) return
    try {
      setSaving(true)
      await deleteSprint(id)
      await load()
    } catch {
      setError('Impossible de supprimer le Sprint.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveItem(itemId: number) {
    if (!selectedSprint) return
    try {
      setSaving(true)
      await removeSprintItem(selectedSprint.id, itemId)
      await load()
    } catch {
      setError('Impossible de retirer cet élément.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Sprints</h2>
        <p className="mt-1 text-sm text-dark-400">Crée des collections temporelles à partir des modules et étapes existants.</p>
      </div>
      {error && <p className="rounded border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><CalendarPlus size={17} className="text-red-400" /> Nouveau Sprint</div>
        <div className="grid gap-3 md:grid-cols-2">
          <FieldLabel label="Nom du Sprint">
            <Input placeholder="Ex. Sprint Data Q4" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </FieldLabel>
          <FieldLabel label="Date de début">
            <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </FieldLabel>
          <FieldLabel label="Date de fin">
            <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          </FieldLabel>
          <FieldLabel label="Objectif du Sprint (optionnel)">
            <Textarea placeholder="Décris le résultat attendu" value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} className="h-10" />
          </FieldLabel>
        </div>
        <Button disabled={saving} onClick={handleCreate} className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700"><Plus size={16} /> Créer le Sprint</Button>
      </Card>

      {loading ? <p className="text-sm text-dark-400">Chargement...</p> : sprints.length === 0 ? <p className="text-sm text-dark-400">Aucun Sprint.</p> : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-2">
            {sprints.map((sprint) => <div key={sprint.id} className={`flex items-center gap-2 rounded border p-3 ${selectedSprintId === sprint.id ? 'border-red-500 bg-red-950/30' : 'border-dark-700 bg-dark-900'}`}>
              <button className="min-w-0 flex-1 text-left" onClick={() => setSelectedSprintId(sprint.id)}><p className="truncate font-semibold text-white">{sprint.name}</p><p className="text-xs text-dark-400">{sprint.startDate} → {sprint.endDate}</p></button>
              <button title="Supprimer" onClick={() => handleDelete(sprint.id)} className="text-dark-500 hover:text-red-400"><Trash2 size={16} /></button>
            </div>)}
          </div>
          {selectedSprint && <Card className="p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h3 className="text-lg font-semibold text-white">{selectedSprint.name}</h3><p className="text-sm text-dark-400">{selectedSprint.goal || 'Sans objectif défini'}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><FieldLabel label="Élément à ajouter"><select value={target} onChange={(event) => setTarget(event.target.value)} className="min-w-0 rounded border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white"><option value="">Choisir un module ou une étape</option>{targets.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></FieldLabel><Button disabled={saving || !selectedTarget} onClick={handleAddItem} className="flex items-center gap-2"><Plus size={15} /> Ajouter</Button></div></div>
            <div className="mt-5 space-y-2">{selectedSprint.items.length === 0 ? <p className="text-sm text-dark-500">Aucun élément dans ce Sprint.</p> : selectedSprint.items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded border border-dark-700 bg-dark-800/50 p-3"><Layers3 size={16} className="text-red-400" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-white">{item.module?.name || item.stage?.name}</p><p className="text-xs text-dark-400">{item.type} · {item.project?.name}</p></div><button title="Retirer" onClick={() => handleRemoveItem(item.id)} className="text-dark-500 hover:text-red-400"><Trash2 size={16} /></button></div>)}</div>
          </Card>}
        </div>
      )}
    </div>
  )
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-dark-300">{label}</span>
      {children}
    </label>
  )
}
