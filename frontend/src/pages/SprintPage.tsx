import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, CircleDashed, Layers3, Target, Timer } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { fetchSprints } from '../lib/api'
import { getStatusColor } from '../lib/status'

interface SprintItem {
  id: number
  type: 'module' | 'stage' | 'unknown'
  project?: { id: number; name: string } | null
  module?: { id: number; name: string; description?: string | null; progress?: number } | null
  stage?: { id: number; moduleId: number; name: string; description?: string | null } | null
  progress: number
}

interface Sprint {
  id: number
  name: string
  goal?: string | null
  startDate: string
  endDate: string
  status: string
  progress: number
  items: SprintItem[]
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function groupSprintItems(items: SprintItem[]) {
  const groups = new Map<number, { module: SprintItem | null; stages: SprintItem[] }>()
  const standaloneItems: SprintItem[] = []

  items.forEach((item) => {
    if (item.type === 'module' && item.module) {
      const group = groups.get(item.module.id) || { module: null, stages: [] }
      group.module = item
      groups.set(item.module.id, group)
      return
    }

    if (item.type === 'stage' && item.stage && item.module) {
      const group = groups.get(item.module.id) || { module: null, stages: [] }
      group.stages.push(item)
      groups.set(item.module.id, group)
      return
    }

    standaloneItems.push(item)
  })

  return { groups: Array.from(groups.values()), standaloneItems }
}

export default function SprintPage() {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [expandedSprintIds, setExpandedSprintIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSprints()
      .then((data) => {
        setSprints(data)
      })
      .catch(() => setError('Impossible de charger les sprints.'))
      .finally(() => setLoading(false))
  }, [])

  function toggleSprint(sprintId: number) {
    setExpandedSprintIds((current) => {
      const next = new Set(current)
      if (next.has(sprintId)) next.delete(sprintId)
      else next.add(sprintId)
      return next
    })
  }

  return (
    <div className="min-h-[calc(100vh-180px)] overflow-auto bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Temporal view</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Sprints</h1>
            <p className="mt-2 max-w-2xl text-sm text-dark-400">Regroupe les modules et étapes prioritaires, même lorsqu’ils appartiennent à plusieurs projets.</p>
          </div>
        </div>

        {loading && <Card className="p-8 text-center text-dark-400">Chargement des sprints...</Card>}
        {!loading && error && <Card className="p-8 text-center text-red-300">{error}</Card>}
        {!loading && !error && sprints.length === 0 && (
          <Card className="p-10 text-center">
            <Timer className="mx-auto text-dark-500" size={32} />
            <h2 className="mt-4 text-lg font-semibold text-white">Aucun sprint planifié</h2>
            <p className="mt-2 text-sm text-dark-400">Les prochains sprints apparaîtront ici dès qu’ils seront créés dans l’Admin.</p>
          </Card>
        )}

        {!loading && !error && sprints.length > 0 && (
          <div className="space-y-3">
            {sprints.map((sprint) => {
              const isExpanded = expandedSprintIds.has(sprint.id)
              const { groups, standaloneItems } = groupSprintItems(sprint.items)
              return (
                <Card key={sprint.id} className={`overflow-hidden border-dark-700/80 ${isExpanded ? 'border-red-900/50' : ''}`}>
                  <button
                    type="button"
                    onClick={() => toggleSprint(sprint.id)}
                    aria-expanded={isExpanded}
                    className="w-full p-5 text-left transition hover:bg-dark-800/60"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={`mt-1 text-lg text-red-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>›</span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h2 className="truncate text-xl font-bold text-white">{sprint.name}</h2>
                            <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-dark-400">
                            <CalendarDays size={15} className="text-red-400" />
                            {formatDate(sprint.startDate)} <span className="text-dark-600">→</span> {formatDate(sprint.endDate)}
                            <span className="text-dark-600">·</span>
                            {sprint.items.length} élément{sprint.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="flex min-w-[180px] items-center gap-3 md:w-56">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-dark-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${sprint.progress}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-red-300">{sprint.progress}%</span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && <div className="border-t border-dark-700 bg-dark-950/30">
                    <div className="border-b border-dark-700 bg-gradient-to-r from-red-950/30 to-dark-900 px-6 py-5">
                      {sprint.goal && <p className="max-w-2xl text-sm text-dark-300">{sprint.goal}</p>}
                      <div className="mt-4 grid grid-cols-2 divide-x divide-dark-700 md:grid-cols-4">
                        <Summary label="Éléments" value={sprint.items.length} icon={<Layers3 size={16} />} />
                        <Summary label="Terminés" value={sprint.items.filter((item) => item.progress === 100).length} icon={<CheckCircle2 size={16} />} />
                        <Summary label="En cours" value={sprint.items.filter((item) => item.progress > 0 && item.progress < 100).length} icon={<Timer size={16} />} />
                        <Summary label="Projets" value={new Set(sprint.items.map((item) => item.project?.id).filter(Boolean)).size} icon={<Target size={16} />} />
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      {groups.map((group) => {
                        const moduleItem = group.module
                        const moduleName = moduleItem?.module?.name || group.stages[0]?.module?.name || 'Module indisponible'
                        const moduleDescription = moduleItem?.module?.description || group.stages[0]?.module?.description
                        const moduleProgress = moduleItem?.progress ?? group.stages[0]?.module?.progress ?? 0

                        return (
                          <div key={moduleItem?.module?.id || group.stages[0]?.module?.id} className="rounded-lg border border-dark-700 bg-dark-900/60 p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-red-400">
                                  <Layers3 size={15} />
                                  Module · {moduleItem?.project?.name || group.stages[0]?.project?.name || 'Projet inconnu'}
                                </div>
                                <h3 className="mt-2 truncate text-lg font-semibold text-white">{moduleName}</h3>
                                {moduleDescription && <p className="mt-2 line-clamp-2 text-sm text-dark-400">{moduleDescription}</p>}
                              </div>
                              <span className="text-sm font-semibold text-red-300">{moduleProgress}%</span>
                            </div>
                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-dark-700">
                              <div className="h-full rounded-full bg-red-500" style={{ width: `${moduleProgress}%` }} />
                            </div>

                            {group.stages.length > 0 && (
                              <div className="mt-4 space-y-2 border-l border-red-500/40 pl-4">
                                {group.stages.map((item) => (
                                  <div key={item.id} className="rounded border border-dark-700/80 bg-dark-800/60 p-3">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-dark-400">
                                          <CircleDashed size={14} /> Stage
                                        </div>
                                        <h4 className="mt-1 truncate font-medium text-white">{item.stage?.name || 'Stage indisponible'}</h4>
                                        {item.stage?.description && <p className="mt-1 line-clamp-2 text-sm text-dark-400">{item.stage.description}</p>}
                                      </div>
                                      <span className="text-sm font-semibold text-red-300">{item.progress}%</span>
                                    </div>
                                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-dark-700">
                                      <div className="h-full rounded-full bg-red-500" style={{ width: `${item.progress}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {standaloneItems.map((item) => (
                        <Card key={item.id} className="p-5 transition hover:border-red-500/40">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-red-400">
                                {item.type === 'module' ? <Layers3 size={15} /> : <CircleDashed size={15} />}
                                {item.type} · {item.project?.name || 'Projet inconnu'}
                              </div>
                              <h3 className="mt-2 truncate text-lg font-semibold text-white">Élément indisponible</h3>
                            </div>
                            <span className="text-sm font-semibold text-red-300">{item.progress}%</span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-red-400">{icon}</span>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-dark-400">{label}</p>
      </div>
    </div>
  )
}
