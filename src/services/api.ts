import axios from 'axios'
import type { Decomposition } from '@/types/requirements'

// Typed API responses
export type JiraUsersResponse = { users: any[] }
export type SuggestionsResponse = { suggestions: Record<string, any> }

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
export type UploadResponse = { document_id: string; file_name: string }

export const uploadDocument = async (formData: FormData): Promise<UploadResponse> => {
  const data = await longRunningApi.post('/api/v1/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data as unknown as UploadResponse
}

export const getRuns = async (limit: number = 20): Promise<any> => {
  const data = await api.get(`/api/v1/documents/runs?limit=${limit}`)
  return data
}

export const getRun = async (runId: string): Promise<any> => {
  const data = await api.get(`/api/v1/documents/runs/${runId}`)
  return data
}

export type DocumentSummaryData = {
  project_name: string
  project_description: string
  objectives: string[]
  scope: string[]
  stakeholders: string[]
  key_features: string[]
  technical_requirements: string[]
  timeline_estimate: string
  risks: string[]
  assumptions: string[]
}

export const getDocumentSummary = async (runId: string): Promise<DocumentSummaryData> => {
  const data = await api.get(`/api/v1/documents/runs/${runId}/summary`)
  return data as unknown as DocumentSummaryData
}

// Requirements API (read-only + generation)
export const triggerDecomposition = async (runId: string) => {
  // Backend uses POST /api/v1/requirements/decompose/{run_id}; may be disabled; caller should handle 410.
  return longRunningApi.post(`/api/v1/requirements/decompose/${runId}`)
}

export const getDecomposition = async (runId: string): Promise<Decomposition> => {
  // GET /api/v1/requirements/decomposition/{run_id}
  const data = await api.get(`/api/v1/requirements/decomposition/${runId}`)
  return data as unknown as Decomposition
}

export const getDecompositionRaw = async (runId: string): Promise<Decomposition> => {
  // Interceptor returns response.data but Axios types think AxiosResponse.
  const data = await api.get(`/api/v1/requirements/decomposition_raw/${runId}`)
  return data as unknown as Decomposition
}

// Gantt API
export const generateGanttChart = async (
  runId: string, 
  startDate?: string, 
  teamSize: number = 5
) => {
  const data = await api.post(`/api/v1/gantt/generate/${runId}`, {
    start_date: startDate,
    team_size: teamSize,
  })
  return data as unknown as any
}

export const getGanttChart = async (runId: string): Promise<any> => {
  const data = await api.get(`/api/v1/gantt/chart/${runId}`)
  return data
}

// Jira Users Cache API
export const getJiraUsersCached = async (): Promise<JiraUsersResponse> => {
  const data = await api.get('/api/v1/jira/users')
  return data as unknown as JiraUsersResponse
}

export const refreshJiraUsers = async (): Promise<JiraUsersResponse> => {
  const data = await api.get('/api/v1/jira/users/refresh')
  return data as unknown as JiraUsersResponse
}

// Assignment suggestions API
export const generateAssigneeSuggestions = async (
  runId: string,
  users: any[],
  tasks: any[]
): Promise<SuggestionsResponse> => {
  const data = await longRunningApi.post(`/api/v1/assignments/suggest/${runId}`, {
    users,
    tasks
  })
  return data as unknown as SuggestionsResponse
}

export const getAssigneeSuggestions = async (runId: string): Promise<SuggestionsResponse> => {
  const data = await api.get(`/api/v1/assignments/suggestions/${runId}`)
  return data as unknown as SuggestionsResponse
}

export const getFinalAssignments = async (runId: string): Promise<any> => {
  const data = await api.get(`/api/v1/assignments/final/${runId}`)
  return data
}

export const syncToJira = async (runId: string, assignments: any): Promise<any> => {
  const data = await longRunningApi.post(`/api/v1/jira-sync/sync/${runId}`, {
    assignments
  })
  return data
}

export const getJiraSyncResult = async (runId: string): Promise<any> => {
  const data = await api.get(`/api/v1/jira-sync/sync/${runId}`)
  return data
}

export default api
