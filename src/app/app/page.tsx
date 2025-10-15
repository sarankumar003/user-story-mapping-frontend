'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Users, LayoutList, RefreshCw, Calendar } from 'lucide-react'
import DocumentUpload from '@/components/DocumentUpload'
import RunManager from '@/components/RunManager'
import DocumentSummary from '@/components/DocumentSummary'
import AssigneeMapping from '@/components/AssigneeMapping'
import RequirementsBoard from '@/components/requirements/RequirementsBoard'
import JiraSync from '@/components/JiraSync'
import { useRunStore } from '@/store/runStore'
import TimelineBoard from '@/components/gantt/TimelineBoard'
import { getDecompositionRaw } from '@/services/api'
import { Decomposition } from '@/types/requirements'

export default function AppHomePage() {
  const [activeTab, setActiveTab] = useState('upload')
  const { selectedRun, updateRun } = useRunStore()
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [timelineError, setTimelineError] = useState<string | null>(null)
  const [timelineData, setTimelineData] = useState<Decomposition | null>(null)

  const tabs = [
    { id: 'upload', label: 'Upload BRD', icon: Upload },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'decomposition', label: 'Decomposition', icon: LayoutList },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'assignees', label: 'Assignees', icon: Users },
    { id: 'jira-sync', label: 'Jira Sync', icon: RefreshCw },
  ]

  useEffect(() => {
    if (activeTab !== 'timeline' || !selectedRun?.id) return
    const load = async () => {
      setTimelineLoading(true)
      setTimelineError(null)
      try {
        const data = await getDecompositionRaw(selectedRun.id)
        setTimelineData(data)
        
        // Update run's gantt step status to completed when timeline data is successfully loaded
        if (data && data.epics && data.epics.length > 0 && selectedRun && selectedRun.steps.gantt.status !== 'completed') {
          updateRun(selectedRun.id, {
            steps: {
              ...selectedRun.steps,
              gantt: {
                status: 'completed',
                timestamp: new Date().toISOString()
              }
            }
          })
        }
      } catch (e: any) {
        setTimelineError(e?.message || 'Failed to load decomposition')
      } finally {
        setTimelineLoading(false)
      }
    }
    load()
  }, [activeTab, selectedRun?.id, updateRun])

  // Update gantt step status when timeline loading fails
  useEffect(() => {
    if (timelineError && selectedRun && selectedRun.steps.gantt.status !== 'failed') {
      updateRun(selectedRun.id, {
        steps: {
          ...selectedRun.steps,
          gantt: {
            status: 'failed',
            timestamp: new Date().toISOString()
          }
        }
      })
    }
  }, [timelineError, selectedRun?.id, updateRun])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">StoryLab</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Turn BRDs into Jira-ready plans</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-80 sidebar">
          <RunManager />
        </div>

        <div className="main-content">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            <div className="space-y-6">
              {activeTab === 'upload' && <DocumentUpload />}
              {activeTab === 'summary' && <DocumentSummary />}
              {activeTab === 'decomposition' && (
                selectedRun ? (
                  <RequirementsBoard runId={selectedRun.id} />
                ) : (
                  <div className="text-gray-700">Select a run from the left to view decomposition.</div>
                )
              )}
              {activeTab === 'assignees' && <AssigneeMapping />}
              {activeTab === 'jira-sync' && <JiraSync />}
              {activeTab === 'timeline' && (
                !selectedRun ? (
                  <div className="text-gray-700">Select a run from the left to view the timeline.</div>
                ) : timelineLoading ? (
                  <div className="text-gray-700">Loading decomposition...</div>
                ) : timelineError ? (
                  <div className="text-red-600">{timelineError}</div>
                ) : !timelineData ? (
                  <div className="text-gray-700">No decomposition found for this run.</div>
                ) : (
                  <TimelineBoard runId={selectedRun.id} decomposition={timelineData} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


