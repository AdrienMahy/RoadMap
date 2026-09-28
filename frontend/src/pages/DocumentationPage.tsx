import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { ArrowLeft, BookOpen, FileText, Search } from 'lucide-react'
import { Card } from '../components/Card'
import { fetchDocumentation, fetchProjects } from '../lib/api'

interface DocumentationDocument {
  id: number
  projectId: number | null
  title: string
  fileName: string
  contentMarkdown: string
  orderIndex: number
  updatedAt: string
}

interface Project {
  id: number
  name: string
  description?: string
}

function getDocumentHeadings(markdown: string) {
  return markdown
    .split('\n')
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match, index) => ({
      id: `documentation-heading-${index}`,
      level: match[1].length,
      text: match[2].replace(/[*_`]/g, '').trim(),
    }))
}

export default function DocumentationPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [documents, setDocuments] = useState<DocumentationDocument[]>([])
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [error, setError] = useState('')

  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const selectedDocument = documents.find((document) => document.id === selectedDocumentId)
  const headings = useMemo(() => getDocumentHeadings(selectedDocument?.contentMarkdown || ''), [selectedDocument])
  const renderedContent = useMemo(() => {
    if (!selectedDocument) return ''
    let headingIndex = 0
    const html = marked.parse(selectedDocument.contentMarkdown, { async: false }) as string
    return DOMPurify.sanitize(html.replace(/<(h[1-3])>([\s\S]*?)<\/\1>/g, (match, tag, content) => {
      const heading = headings[headingIndex++]
      return heading ? `<${tag} id="${heading.id}">${content}</${tag}>` : match
    }))
  }, [headings, selectedDocument])

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((loadError) => {
        console.error('Failed to load projects:', loadError)
        setError('Impossible de charger les projets.')
      })
      .finally(() => setLoadingProjects(false))
  }, [])

  useEffect(() => {
    if (selectedProjectId === null) {
      setDocuments([])
      setSelectedDocumentId(null)
      return
    }

    setLoadingDocuments(true)
    fetchDocumentation(selectedProjectId)
      .then((data) => {
        setDocuments(data)
        setSelectedDocumentId(null)
      })
      .catch((loadError) => {
        console.error('Failed to load documentation:', loadError)
        setError('Impossible de charger la documentation.')
      })
      .finally(() => setLoadingDocuments(false))
  }, [selectedProjectId])

  const filteredDocuments = documents.filter((document) =>
    document.title.toLowerCase().includes(search.toLowerCase()),
  )

  if (selectedDocument) {
    return (
      <div className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 p-6">
        <div className="mx-auto max-w-8xl">
          <button onClick={() => setSelectedDocumentId(null)} className="mb-6 flex items-center gap-2 text-sm text-dark-400 transition hover:text-white">
            <ArrowLeft size={17} />
            Retour aux documentations
          </button>
          <Card className="overflow-hidden">
            <div className="border-b border-dark-700 bg-dark-800/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <FileText className="text-red-500" size={22} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-dark-500">{selectedProject?.name || 'Documentation générale'}</p>
                  <h2 className="text-2xl font-bold text-white">{selectedDocument.title}</h2>
                  <p className="mt-1 text-xs text-dark-500">{selectedDocument.fileName}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-8 p-6 xl:flex-row">
              {headings.length > 0 && <nav className="h-fit min-w-[210px] xl:order-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-dark-500">Sommaire</p>
                <div className="space-y-2 border-l border-dark-700 pl-3">{headings.map((heading) => <a key={heading.id} href={`#${heading.id}`} className={`block text-sm text-dark-400 hover:text-red-300 ${heading.level === 2 ? 'pl-2' : heading.level === 3 ? 'pl-4' : ''}`}>{heading.text}</a>)}</div>
              </nav>}
              <article className="documentation-content min-w-0 max-w-4xl flex-1" dangerouslySetInnerHTML={{ __html: renderedContent }} />
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-180px)] bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 p-6">
      <div className="mx-auto max-w-8xl space-y-8">
        <div className="flex items-center gap-3">
          <BookOpen className="text-red-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-white">Documentation</h1>
            <p className="text-sm text-dark-400">Guides et ressources utilisateur</p>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        {selectedProjectId === null ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Choisir un projet</h2>
              <p className="text-sm text-dark-400">Accédez aux documentations classées par projet.</p>
            </div>
            {loadingProjects ? <p className="text-dark-400">Chargement...</p> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card onClick={() => setSelectedProjectId(0)} className="cursor-pointer border-red-900/30 bg-red-950/20 p-5 transition hover:border-red-500/50 hover:bg-red-950/30">
                <div className="flex items-center gap-3"><BookOpen className="text-red-400" size={22} /><div><h3 className="font-semibold text-white">Documentation générale</h3><p className="mt-1 text-xs text-dark-400">Guides communs à tous les projets</p></div></div>
              </Card>
              {projects.map((project) => <Card key={project.id} onClick={() => setSelectedProjectId(project.id)} className="cursor-pointer p-5 transition hover:border-red-500/50 hover:bg-dark-800/70">
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                {project.description && <p className="mt-2 line-clamp-2 text-sm text-dark-400">{project.description}</p>}
                <p className="mt-4 text-xs font-medium text-red-400">Voir les guides →</p>
              </Card>)}
            </div>}
          </section>
        ) : (
          <section className="space-y-5">
            <button onClick={() => setSelectedProjectId(null)} className="flex items-center gap-2 text-sm text-dark-400 transition hover:text-white"><ArrowLeft size={17} /> Tous les projets</button>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-sm text-red-400">{selectedProject?.name || 'Documentation générale'}</p><h2 className="text-2xl font-bold text-white">Guides disponibles</h2></div>
              <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 text-dark-500" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher" className="w-full rounded-lg border border-dark-600 bg-dark-800 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-red-500" /></div>
            </div>
            {loadingDocuments ? <p className="text-dark-400">Chargement...</p> : filteredDocuments.length === 0 ? <Card className="p-8 text-center text-dark-400">Aucune documentation disponible pour ce projet.</Card> : <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{filteredDocuments.map((document) => <Card key={document.id} onClick={() => setSelectedDocumentId(document.id)} className="cursor-pointer p-5 transition hover:border-red-500/50 hover:bg-dark-800/70">
              <div className="flex items-start gap-3"><FileText className="mt-0.5 flex-shrink-0 text-red-400" size={21} /><div className="min-w-0"><h3 className="truncate font-semibold text-white">{document.title}</h3><p className="mt-2 line-clamp-3 text-sm text-dark-400">{document.contentMarkdown.replace(/^#+\s*/gm, '').slice(0, 150)}</p><p className="mt-4 text-xs font-medium text-red-400">Lire la documentation →</p></div></div>
            </Card>)}</div>}
          </section>
        )}
      </div>
    </div>
  )
}
