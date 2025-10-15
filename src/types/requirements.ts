export interface Subtask {
  id?: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  estimated_hours?: number
  status?: string
}

export interface Story {
  id?: string
  title: string
  description?: string
  acceptance_criteria?: string[]
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  estimated_hours?: number
  status?: string
  subtasks?: Subtask[]
}

export interface Epic {
  id?: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  estimated_hours?: number
  status?: string
  stories?: Story[]
}

export interface Decomposition {
  epics: Epic[]
  total_estimated_hours?: number
  timeline_weeks?: number
}




