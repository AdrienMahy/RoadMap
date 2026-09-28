import { useEffect, useState } from 'react'
import { BookOpen, FileText, Trash2, Upload } from 'lucide-react'
import { Button } from './Button'
import { Card } from './Card'
import { Input } from './Input'
import { fetchDocumentation, fetchProjects, createDocumentation, deleteDocumentation } from '../lib/api'

interface Project {
  id: number
  name: string
}

interface DocumentationDocument {
  id: number
  projectId?: number | null
  title: string
  fileName: string
  contentMarkdown: string
  createdAt: string
}

export function DocumentationManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<DocumentationDocument[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadDocuments() {
    const [generalDocuments, projectData] = await Promise.all([
      fetchDocumentation(null),
      fetchProjects(),
    ])
    const projectDocuments = await Promise.all(
      projectData.map((project: Project) => fetchDocumentation(project.id))
    )
    setProjects(projectData)
    setDocuments([
      ...generalDocuments,
      ...projectDocuments.flat(),
    ])
  }

  useEffect(() => {
    loadDocuments()
      .catch(() => setError('Impossible de charger la documentation.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleImport() {
    if (!file || !file.name.toLowerCase().endsWith('.md')) {
      setError('Sélectionne un fichier Markdown (.md).')
      return
    }
    try {
      setSaving(true)
      setError('')
      const contentMarkdown = await file.text()
      await createDocumentation({
        projectId: selectedProjectId ? Number(selectedProjectId) : null,
        title: title.trim() || file.name.replace(/\.md$/i, ''),
        fileName: file.name,
        contentMarkdown,
      })
      setTitle('')
      setFile(null)
      const input = document.getElementById('documentation-file') as HTMLInputElement | null
      if (input) input.value = ''
      await loadDocuments()
    } catch (importError: any) {
      setError(importError.response?.data?.message || 'Impossible d’importer le document.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette documentation ?')) return
    try {
      setSaving(true)
      await deleteDocumentation(id)
      setDocuments((current) => current.filter((document) => document.id !== id))
    } catch {
      setError('Impossible de supprimer la documentation.')
    } finally {
      setSaving(false)
    }
  }

  function projectName(projectId?: number | null) {
    return projectId ? projects.find((project) => project.id === projectId)?.name || 'Projet inconnu' : 'Documentation générale'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Documentation</h2>
        <p className="mt-1 text-sm text-dark-400">Importe et organise les documents Markdown visibles dans le Board.</p>
      </div>
      {error && <p className="rounded border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}
      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Upload size={17} className="text-red-400" /> Importer un document Markdown</div>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Titre (optionnel)" value={title} onChange={(event) => setTitle(event.target.value)} />
          <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
            <option value="">Documentation générale</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
          <input id="documentation-file" type="file" accept=".md,text/markdown" onChange={(event) => setFile(event.target.files?.[0] || null)} className="block w-full rounded-lg border border-dark-600 bg-dark-800 px-3 py-2 text-sm text-dark-300 file:mr-3 file:rounded file:border-0 file:bg-red-600 file:px-3 file:py-1.5 file:text-sm file:text-white" />
        </div>
        <Button disabled={saving || !file} onClick={handleImport} className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700"><Upload size={16} /> Importer</Button>
      </Card>
      <Card>
        <div className="flex items-center gap-2 border-b border-dark-700 px-5 py-4 text-sm font-semibold text-white"><BookOpen size={17} className="text-red-400" /> Documents disponibles</div>
        {loading ? <p className="p-5 text-sm text-dark-400">Chargement...</p> : documents.length === 0 ? <p className="p-5 text-sm text-dark-400">Aucune documentation importée.</p> : <div className="divide-y divide-dark-700">{documents.map((document) => <div key={document.id} className="flex items-center gap-3 px-5 py-4"><FileText size={18} className="flex-shrink-0 text-red-400" /><div className="min-w-0 flex-1"><p className="truncate font-medium text-white">{document.title}</p><p className="text-xs text-dark-400">{document.fileName} · {projectName(document.projectId)}</p></div><button title="Supprimer" disabled={saving} onClick={() => handleDelete(document.id)} className="text-dark-500 hover:text-red-400"><Trash2 size={17} /></button></div>)}</div>}
      </Card>
    </div>
  )
}
