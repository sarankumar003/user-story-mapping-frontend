import { Decomposition, Epic, Story } from '../types/requirements'

export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  type: 'project' | 'task' | 'milestone'
  progress: number
  dependencies?: string
  styles?: { progressColor?: string; progressSelectedColor?: string }
}

// Convert hours to business days, assuming 6 working hours per day
function hoursToBusinessDays(hours: number | undefined): number {
  if (!hours || hours <= 0) return 1
  return Math.max(1, Math.ceil(hours / 6))
}

// Add business days (skip Saturday=6 and Sunday=0)
function addBusinessDays(date: Date, days: number): Date {
  const d = new Date(date)
  let remaining = days
  while (remaining > 0) {
    d.setDate(d.getDate() + 1)
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      remaining -= 1
    }
  }
  return d
}

export function buildGanttTasks(
  runId: string,
  decomposition: Decomposition,
  startDate: Date = new Date()
): { project: GanttTask[]; epics: GanttTask[]; stories: GanttTask[] } {
  const projectHours = decomposition.total_estimated_hours ||
    (decomposition.epics || []).reduce((sum, e) => sum + (e.estimated_hours || 0), 0)

  const projectDays = hoursToBusinessDays(projectHours)
  const projectEnd = addBusinessDays(startDate, projectDays)

  const projectTask: GanttTask = {
    id: `RUN-${runId}`,
    name: `Project Timeline — ${projectHours || 0}h`,
    start: startDate,
    end: projectEnd,
    type: 'project',
    progress: 0,
  }

  let cursor = new Date(startDate)
  const epicTasks: GanttTask[] = []
  const storyTasks: GanttTask[] = []

  ;(decomposition.epics || []).forEach((epic, epicIndex) => {
    const epicId = epic.id || `EPIC-${epicIndex + 1}`
    const epicHours = epic.estimated_hours ||
      (epic.stories || []).reduce((sum, s) => sum + (s.estimated_hours || 0), 0)
    const epicDays = hoursToBusinessDays(epicHours)
    const epicStart = new Date(cursor)
    const epicEnd = addBusinessDays(epicStart, epicDays)

    epicTasks.push({
      id: epicId,
      name: `${epic.title} — ${epicHours || 0}h`,
      start: epicStart,
      end: epicEnd,
      type: 'task',
      progress: 0,
      dependencies: projectTask.id,
    })

    let storyCursor = new Date(epicStart)
    ;(epic.stories || []).forEach((story, storyIndex) => {
      const storyId = story.id || `${epicId}-S${storyIndex + 1}`
      const storyHours = story.estimated_hours || 0
      const storyDays = hoursToBusinessDays(storyHours)
      const storyStart = new Date(storyCursor)
      const storyEnd = addBusinessDays(storyStart, storyDays)

      storyTasks.push({
        id: storyId,
        name: `${story.title} — ${storyHours || 0}h`,
        start: storyStart,
        end: storyEnd,
        type: 'task',
        progress: 0,
        dependencies: epicId,
      })

      storyCursor = new Date(storyEnd)
    })

    cursor = new Date(epicEnd)
  })

  return { project: [projectTask], epics: epicTasks, stories: storyTasks }
}


