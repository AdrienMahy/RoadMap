import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3101/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Projects
export async function fetchProjects() {
  const { data } = await api.get('/projects')
  return data.data
}

export async function fetchProject(id: number) {
  const { data } = await api.get(`/projects/${id}`)
  return data.data
}

export async function createProject(project: any) {
  const { data } = await api.post('/projects', project)
  return data.data
}

export async function updateProject(id: number, updates: any) {
  const { data } = await api.put(`/projects/${id}`, updates)
  return data.data
}

export async function deleteProject(id: number) {
  await api.delete(`/projects/${id}`)
}

// Modules
export async function fetchModulesByProject(projectId: number) {
  const { data } = await api.get(`/modules/project/${projectId}`)
  return data.data
}

export async function fetchModule(id: number) {
  const { data } = await api.get(`/modules/${id}`)
  return data.data
}

export async function createModule(module: any) {
  const { data } = await api.post('/modules', module)
  return data.data
}

export async function updateModule(id: number, updates: any) {
  const { data } = await api.put(`/modules/${id}`, updates)
  return data.data
}

export async function deleteModule(id: number) {
  await api.delete(`/modules/${id}`)
}

// Stages
export async function fetchStagesByModule(moduleId: number) {
  const { data } = await api.get(`/stages/module/${moduleId}`)
  return data.data
}

export async function fetchStage(id: number) {
  const { data } = await api.get(`/stages/${id}`)
  return data.data
}

export async function createStage(stage: any) {
  const { data } = await api.post('/stages', stage)
  return data.data
}

export async function updateStage(id: number, updates: any) {
  const { data } = await api.put(`/stages/${id}`, updates)
  return data.data
}

export async function deleteStage(id: number) {
  await api.delete(`/stages/${id}`)
}

// Points
export async function fetchPoints(stageId: number) {
  const { data } = await api.get(`/points/stage/${stageId}`)
  return data.data
}

export async function createPoint(point: any) {
  const { data } = await api.post('/points', point)
  return data.data
}

export async function updatePoint(id: number, updates: any) {
  const { data } = await api.put(`/points/${id}`, updates)
  return data.data
}

export async function deletePoint(id: number) {
  await api.delete(`/points/${id}`)
}
