"use client"

import React, { useState, useMemo } from 'react'
import { useRequirementsStore } from '../../store/requirementsStore'
import { useRunStore } from '../../store/runStore'
import { Decomposition, Epic, Story, Subtask } from '../../types/requirements'
import { Play, Loader2 } from 'lucide-react'
import { useStreamingDecomposition } from '@/hooks/useStreamingDecomposition'

interface Props {
  runId: string
}

const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-blue-100 text-blue-700' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${color}`}>{children}</span>
)

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-sm font-semibold text-gray-700 tracking-wide uppercase">{children}</h2>
)

// Expand/Collapse button component
const ExpandButton: React.FC<{ 
  isExpanded: boolean; 
  onClick: () => void; 
  hasChildren: boolean 
}> = ({ isExpanded, onClick, hasChildren }) => {
  if (!hasChildren) return null
  
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-100 transition-colors"
    >
      {isExpanded ? (
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

// Tree item component with indentation
const TreeItem: React.FC<{ 
  level: number; 
  children: React.ReactNode; 
  isExpanded?: boolean; 
  onToggle?: () => void; 
  hasChildren?: boolean;
}> = ({ level, children, isExpanded, onToggle, hasChildren = false }) => {
  const indentClass = `ml-${level * 4}`
  
  return (
    <div className={`${indentClass} border-l border-gray-200 pl-4`}>
      <div className="flex items-start gap-2 py-2">
        <ExpandButton 
          isExpanded={isExpanded || false} 
          onClick={onToggle || (() => {})} 
          hasChildren={hasChildren}
        />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// Calculate estimated hours for a story (sum of all subtask hours)
const calculateStoryHours = (story: Story): number => {
  return (story.subtasks || []).reduce((total, subtask) => {
    return total + (subtask.estimated_hours || 0)
  }, 0)
}

// Calculate estimated hours for an epic (sum of all story hours)
const calculateEpicHours = (epic: Epic): number => {
  return (epic.stories || []).reduce((total, story) => {
    return total + calculateStoryHours(story)
  }, 0)
}

// Subtask component
const SubtaskItem: React.FC<{ subtask: Subtask }> = ({ subtask }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900">{subtask.title}</div>
          {subtask.description && (
            <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{subtask.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge>{subtask.team}</Badge>
          <Badge color="bg-gray-100 text-gray-700">{subtask.priority}</Badge>
          {subtask.estimates?.hours != null && (
            <Badge color="bg-amber-100 text-amber-700">{subtask.estimates.hours}h</Badge>
          )}
          <Badge color="bg-purple-100 text-purple-700">{subtask.status}</Badge>
        </div>
      </div>
    </div>
  )
}

// Story component with calculated hours
const StoryItem: React.FC<{ 
  story: Story; 
  isExpanded: boolean; 
  onToggle: () => void 
}> = ({ story, isExpanded, onToggle }) => {
  const totalHours = useMemo(() => calculateStoryHours(story), [story.subtasks])
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-900">{story.title}</div>
            {story.description && (
              <div className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{story.description}</div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge>{story.team}</Badge>
            <Badge color="bg-gray-100 text-gray-700">{story.priority}</Badge>
            {story.story_points != null && (
              <Badge color="bg-amber-100 text-amber-700">{story.story_points} SP</Badge>
            )}
            {totalHours > 0 && (
              <Badge color="bg-green-100 text-green-700">{totalHours}h</Badge>
            )}
            <Badge color="bg-purple-100 text-purple-700">{story.status}</Badge>
          </div>
        </div>
      </div>
      
      {story.subtasks?.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="p-3">
            <div className="flex items-start gap-2">
              <ExpandButton 
                isExpanded={isExpanded} 
                onClick={onToggle} 
                hasChildren={true}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Subtasks ({story.subtasks.length})
                </div>
                {isExpanded && (
                  <div className="space-y-2">
                    {story.subtasks.map((subtask) => (
                      <SubtaskItem key={subtask.id} subtask={subtask} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Epic component with calculated hours
const EpicItem: React.FC<{ 
  epic: Epic; 
  isExpanded: boolean; 
  onToggle: () => void;
  expandedStories: Set<string>;
  onToggleStory: (storyId: string) => void;
}> = ({ epic, isExpanded, onToggle, expandedStories, onToggleStory }) => {
  const totalHours = useMemo(() => calculateEpicHours(epic), [epic.stories])
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">{epic.title}</div>
            {epic.description && (
              <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{epic.description}</div>
            )}
            {epic.labels?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {epic.labels.map((label) => (
                  <Badge key={label} color="bg-sky-50 text-sky-700">{label}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Badge color="bg-gray-100 text-gray-700">{epic.priority}</Badge>
            {totalHours > 0 && (
              <Badge color="bg-green-100 text-green-700">{totalHours}h</Badge>
            )}
            <Badge color="bg-purple-100 text-purple-700">{epic.status}</Badge>
          </div>
        </div>
      </div>
      
      {epic.stories?.length > 0 && (
        <div className="border-t border-gray-100">
          <div className="p-4">
            <div className="flex items-start gap-2">
              <ExpandButton 
                isExpanded={isExpanded} 
                onClick={onToggle} 
                hasChildren={true}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-500 mb-3">
                  Stories ({epic.stories.length})
                </div>
                {isExpanded && (
                  <div className="space-y-3">
                    {epic.stories.map((story) => (
                      <StoryItem 
                        key={story.id} 
                        story={story} 
                        isExpanded={expandedStories.has(story.id)} 
                        onToggle={() => onToggleStory(story.id)} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const RequirementsBoard: React.FC<Props> = ({ runId }) => {
  const { decompositionRaw, loading, error, /* generate */ loadRaw } = useRequirementsStore()
  const { selectedRun, updateRun } = useRunStore()
  // Hide generate-from-summary in UI; use streaming component instead

  const {
    isStreaming,
    startStreamingDecomposition,
    epicsCount,
    totalHours,
  } = useStreamingDecomposition()

  React.useEffect(() => {
    loadRaw(runId)
  }, [runId, loadRaw])

  // Update decomposition step status when data is successfully loaded or failed
  React.useEffect(() => {
    if (selectedRun) {
      if (error && selectedRun.steps.decomposition.status !== 'failed') {
        // Mark as failed if there's an error
        updateRun(selectedRun.id, {
          steps: {
            ...selectedRun.steps,
            decomposition: {
              status: 'failed',
              timestamp: new Date().toISOString()
            }
          }
        })
      } else if (decompositionRaw && decompositionRaw.epics && decompositionRaw.epics.length > 0 && !error && selectedRun && selectedRun.steps.decomposition.status !== 'completed') {
        // Mark as completed if data is successfully loaded
        updateRun(selectedRun.id, {
          steps: {
            ...selectedRun.steps,
            decomposition: {
              status: 'completed',
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    }
  }, [decompositionRaw, selectedRun?.id, updateRun, error])

  // Refresh decomposition data when streaming completes
  React.useEffect(() => {
    if (!isStreaming && (epicsCount > 0 || totalHours > 0)) {
      // Streaming just completed, refresh the decomposition data
      loadRaw(runId)
    }
  }, [isStreaming, epicsCount, totalHours, runId, loadRaw])

  // Removed onGenerate handler for hidden UI action

  const onRefresh = async () => {
    await loadRaw(runId)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Decomposition</h1>
          <p className="text-sm text-gray-600">LLM-generated decomposition from BRD summary.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => startStreamingDecomposition(runId)}
            disabled={isStreaming}
            className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Start Streaming Decomposition
          </button>
          <button onClick={onRefresh} className="px-3 py-2 rounded-md bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">Refresh</button>
        </div>
      </div>

      {/* Streaming section removed as requested */}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Processing decomposition...</div>
            <div className="text-sm text-gray-500 mt-2">This may take a few minutes. Please wait.</div>
          </div>
        </div>
      ) : error ? (
        <div className="text-red-700 bg-red-50 border border-red-100 p-3 rounded-md">{error}</div>
      ) : !decompositionRaw ? (
        <div className="text-gray-700">No decomposition found. Use the streaming decomposition above to generate it.</div>
      ) : (
        <DecompositionView data={decompositionRaw} />
      )}
    </div>
  )
}

function coercePriority(p: any): any {
  if (!p) return 'medium'
  const s = String(p).toLowerCase()
  if (['highest','high','medium','low','lowest'].includes(s)) return s
  if (['critical'].includes(s)) return 'highest'
  return 'medium'
}

function coerceStatus(s: any): any {
  if (!s) return 'todo'
  const v = String(s).toLowerCase()
  if (v.includes('in progress')) return 'in_progress'
  if (v.includes('done')) return 'done'
  if (v.includes('block')) return 'blocked'
  return 'todo'
}

// Backend now returns properly structured data, no mapping needed


const DecompositionView: React.FC<{ data: Decomposition }> = ({ data }) => {
  // State for managing expanded/collapsed items
  const [expandedEpics, setExpandedEpics] = useState<Set<string>>(new Set())
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set())

  // Toggle epic expansion
  const toggleEpic = (epicId: string) => {
    const newExpanded = new Set(expandedEpics)
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId)
    } else {
      newExpanded.add(epicId)
    }
    setExpandedEpics(newExpanded)
  }

  // Toggle story expansion
  const toggleStory = (storyId: string) => {
    const newExpanded = new Set(expandedStories)
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId)
    } else {
      newExpanded.add(storyId)
    }
    setExpandedStories(newExpanded)
  }

  // Calculate total hours for all epics
  const totalProjectHours = useMemo(() => {
    return data.epics.reduce((total, epic) => {
      return total + calculateEpicHours(epic)
    }, 0)
  }, [data.epics])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <SectionTitle>Overview</SectionTitle>
        <Badge color="bg-gray-100 text-gray-700">Run: {data.run_id}</Badge>
        <Badge color="bg-gray-100 text-gray-700">Generated: {new Date(data.generated_at).toLocaleString()}</Badge>
        <Badge color="bg-gray-100 text-gray-700">Schema: {data.schema_version}</Badge>
        {totalProjectHours > 0 && (
          <Badge color="bg-green-100 text-green-700">Total: {totalProjectHours}h</Badge>
        )}
      </div>

      <div className="space-y-4">
        {data.epics.map((epic) => (
          <EpicItem 
            key={epic.id} 
            epic={epic} 
            isExpanded={expandedEpics.has(epic.id)} 
            onToggle={() => toggleEpic(epic.id)}
            expandedStories={expandedStories}
            onToggleStory={toggleStory}
          />
        ))}
      </div>

      {data.warnings?.length ? (
        <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-md text-sm text-yellow-800">
          <div className="font-medium mb-1">Warnings</div>
          <ul className="list-disc ml-5">
            {data.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default RequirementsBoard
