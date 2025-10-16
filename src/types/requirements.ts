export interface Subtask {
  id?: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  estimated_hours?: number
  status?: string
  team?: string
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
  team?: string
  story_points?: number
}

export interface Epic {
  id?: string
  title: string
  description?: string
  priority?: 'Low' | 'Medium' | 'High' | 'Critical'
  estimated_hours?: number
  status?: string
  stories?: Story[]
  labels?: string[]
}

export interface Decomposition {
  epics: Epic[]
  total_estimated_hours?: number
  timeline_weeks?: number
  run_id?: string
  generated_at?: string
  schema_version?: string
  warnings?: string[]
}





