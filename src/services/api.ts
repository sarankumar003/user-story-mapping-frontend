import axios from 'axios'
import type { Decomposition } from '@/types/requirements'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
//export const API_BASE_URL = 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Long-running operations API client with extended timeout
const longRunningApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for long-running operations
})

// Request interceptor for regular API
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for regular API
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const message = typeof data === 'string' ? data : (data?.detail || error.message || 'Request failed')
    console.error('API Error:', message)
    // Normalize to an object to avoid setting properties on string primitives
    const normalized = typeof data === 'object' && data !== null ? { ...data } : { message }
    if (status) (normalized as any).status = status
    return Promise.reject(normalized)
  }
)

// Request interceptor for long-running API
longRunningApi.interceptors.request.use(
  (config) => {
    console.log(`Making long-running ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for long-running API
longRunningApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error?.response?.status
    const data = error?.response?.data
    const message = typeof data === 'string' ? data : (data?.detail || error.message || 'Request failed')
    console.error('Long-running API Error:', message)
    // Normalize to an object to avoid setting properties on string primitives
    const normalized = typeof data === 'object' && data !== null ? { ...data } : { message }
    if (status) (normalized as any).status = status
    return Promise.reject(normalized)
  }
)

// Document API
export const uploadDocument = async (formData: FormData) => {
  return longRunningApi.post('/api/v1/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getRuns = async (limit: number = 20) => {
  return api.get(`/api/v1/documents/runs?limit=${limit}`)
}

export const getRun = async (runId: string) => {
  return api.get(`/api/v1/documents/runs/${runId}`)
}

export const getDocumentSummary = async (runId: string) => {
  return api.get(`/api/v1/documents/runs/${runId}/summary`)
}

// Requirements API (read-only + generation)
export const triggerDecomposition = async (runId: string) => {
  // Backend uses POST /api/v1/requirements/decompose/{run_id}; may be disabled; caller should handle 410.
  return longRunningApi.post(`/api/v1/requirements/decompose/${runId}`)
}

export const getDecomposition = async (runId: string) => {
  // GET /api/v1/requirements/decomposition/{run_id}
  return api.get(`/api/v1/requirements/decomposition/${runId}`)
}

export const getDecompositionRaw = async (runId: string) => {
  // GET /api/v1/requirements/decomposition_raw/{run_id}
  return api.get<Decomposition>(`/api/v1/requirements/decomposition_raw/${runId}`)
}

// Gantt API
export const generateGanttChart = async (
  runId: string, 
  startDate?: string, 
  teamSize: number = 5
) => {
  return api.post(`/api/v1/gantt/generate/${runId}`, {
    start_date: startDate,
    team_size: teamSize,
  })
}

export const getGanttChart = async (runId: string) => {
  return api.get(`/api/v1/gantt/chart/${runId}`)
}

// Jira Users Cache API
export const getJiraUsersCached = async () => {
  return api.get('/api/v1/jira/users')
}

export const refreshJiraUsers = async () => {
  return api.get('/api/v1/jira/users/refresh')
}

// Assignment suggestions API
export const generateAssigneeSuggestions = async (runId: string, users: any[], tasks: any[]) => {
  return longRunningApi.post(`/api/v1/assignments/suggest/${runId}`, {
    users,
    tasks
  })
}

export const getAssigneeSuggestions = async (runId: string) => {
  return api.get(`/api/v1/assignments/suggestions/${runId}`)
}

export const getFinalAssignments = async (runId: string) => {
  return api.get(`/api/v1/assignments/final/${runId}`)
}

export const syncToJira = async (runId: string, assignments: any) => {
  return longRunningApi.post(`/api/v1/jira-sync/sync/${runId}`, {
    assignments
  })
}

export const getJiraSyncResult = async (runId: string) => {
  return api.get(`/api/v1/jira-sync/sync/${runId}`)
}

export default api
