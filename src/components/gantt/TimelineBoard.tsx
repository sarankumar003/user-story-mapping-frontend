'use client'

import { useMemo } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { Decomposition } from '@/types/requirements'
import { buildGanttTasks } from '@/utils/gantt'

type Props = {
  runId: string
  decomposition: Decomposition
}

export default function TimelineBoard({ runId, decomposition }: Props) {
  const { project, epics, stories } = useMemo(() => buildGanttTasks(runId, decomposition), [runId, decomposition])

  const toTask = (t: any): Task => ({
    id: t.id,
    name: t.name,
    start: t.start,
    end: t.end,
    type: t.type === 'project' ? 'project' : 'task',
    progress: t.progress,
    isDisabled: false,
  })

  const projectTasks: Task[] = project.map(toTask)
  const epicTasks: Task[] = epics.map(toTask)
  const storyTasks: Task[] = stories.map(toTask)

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Timeline</h3>
        <Gantt tasks={projectTasks} viewMode={ViewMode.Week} listCellWidth="155px" />
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Epics Timeline</h3>
        <Gantt 
          tasks={epicTasks} 
          viewMode={ViewMode.Day} 
          listCellWidth="155px"
          barBackgroundColor="#3B82F6"
          barBackgroundSelectedColor="#1D4ED8"
        />
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Stories Timeline</h3>
        <Gantt 
          tasks={storyTasks} 
          viewMode={ViewMode.Day} 
          listCellWidth="155px"
          barBackgroundColor="#3B82F6"
          barBackgroundSelectedColor="#1D4ED8"
        />
      </section>
    </div>
  )
}


