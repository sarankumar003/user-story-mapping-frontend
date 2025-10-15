'use client'

import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Users,
  FileText
} from 'lucide-react'
import { useRunStore } from '@/store/runStore'
import { getFinalAssignments, syncToJira, getJiraSyncResult } from '@/services/api'
import toast from 'react-hot-toast'

interface FinalAssignment {
  run_id: string
  saved_at: string
  epics: Array<{
    id: string
    title: string
    description: string
    assignee: string
    assignee_name: string
    stories: Array<{
      id: string
      title: string
      description: string
      assignee: string
      assignee_name: string
      subtasks: Array<{
        id: string
        title: string
        description: string
        assignee: string
        assignee_name: string
      }>
    }>
  }>
}

interface SyncStatus {
  [taskId: string]: 'pending' | 'success' | 'error' | 'not_synced'
}

function JiraSync() {
  const { selectedRun, updateRun } = useRunStore()
  const [assignments, setAssignments] = useState<FinalAssignment | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedRun) return
    ;(async () => {
      await loadFinalAssignments()
      await loadJiraSyncResults()
    })()
  }, [selectedRun])

  const loadFinalAssignments = async () => {
    if (!selectedRun) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await getFinalAssignments(selectedRun.id)
      setAssignments(response)
        
        // Initialize sync status for all tasks
        const status: SyncStatus = {}
        response.epics?.forEach((epic: any) => {
          status[epic.id] = 'not_synced'
          epic.stories?.forEach((story: any) => {
            status[story.id] = 'not_synced'
            story.subtasks?.forEach((subtask: any) => {
              status[subtask.id] = 'not_synced'
            })
          })
        })
        setSyncStatus(status)
    } catch (err: any) {
      console.error('Error loading final assignments:', err)
      setError(err.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const loadJiraSyncResults = async () => {
    if (!selectedRun) return
    
    try {
      const syncResult = await getJiraSyncResult(selectedRun.id)
      if (syncResult && syncResult.sync_status) {
        setSyncStatus(syncResult.sync_status)
        
        // Update run's jira_sync step status if sync was successful
        if (selectedRun && selectedRun.steps.jira_sync.status !== 'completed') {
          const hasErrors = Object.values(syncResult.sync_status).some(status => status === 'error')
          if (!hasErrors) {
            updateRun(selectedRun.id, {
              steps: {
                ...selectedRun.steps,
                jira_sync: {
                  status: 'completed',
                  timestamp: new Date().toISOString()
                }
              }
            })
          }
        }
      }
    } catch (err: any) {
      // Jira sync results not found - this is normal for runs that haven't been synced yet
      console.log('No Jira sync results found for run:', selectedRun.id)
    }
  }

  const handleSyncToJira = async () => {
    if (!selectedRun || !assignments) return
    
    setSyncing(true)
    setError(null)
    
    try {
      // Call the sync API and wait for completion
      console.log('Calling syncToJira API with:', { runId: selectedRun.id, assignments })
      const result = await syncToJira(selectedRun.id, assignments)
      console.log('Sync API response:', result)
      
      // Update sync status with the response
      setSyncStatus(result.sync_status || {})
      
      // Update run's jira_sync step status (mark completed even if some items failed)
      if (selectedRun) {
        updateRun(selectedRun.id, {
          steps: {
            ...selectedRun.steps,
            jira_sync: {
              status: 'completed',
              timestamp: new Date().toISOString()
            }
          }
        })
      }
      
      // Show completion message
      const successCount = Object.values(result.sync_status || {}).filter(s => s === 'success').length
      const errorCount = Object.values(result.sync_status || {}).filter(s => s === 'error').length
      
      if (errorCount === 0) {
        toast.success(`All ${successCount} tickets created successfully!`)
      } else {
        toast.error(`${successCount} tickets created, ${errorCount} failed. Check details below.`)
      }
      
    } catch (err: any) {
      console.error('Error syncing to Jira:', err)
      setError(err.message || 'Failed to sync to Jira')
      toast.error('Failed to sync to Jira')
    } finally {
      setSyncing(false)
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-300" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Synced'
      case 'error':
        return 'Failed'
      case 'pending':
        return 'Syncing...'
      default:
        return 'Not Synced'
    }
  }

  if (!selectedRun) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Please select a run to view Jira sync options.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadFinalAssignments}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!assignments) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">
          No final assignments found. Please save assignments in the Assignees tab first.
        </p>
        <button
          onClick={loadFinalAssignments}
          className="btn-primary"
        >
          Refresh
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">
              Jira Sync
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Sync assignments to Jira tickets
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncToJira}
              disabled={syncing}
              className="btn-primary flex items-center"
            >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating Jira tickets...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync to Jira
              </>
            )}
            </button>
            
            <button
              onClick={() => {
                loadFinalAssignments()
                loadJiraSyncResults()
              }}
              disabled={syncing}
              className="btn-secondary flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="card">
        <h3 className="text-md font-medium text-gray-900 mb-4">
          Assignment Summary
        </h3>
        <div className="space-y-4">
          {assignments.epics?.map((epic) => (
            <div key={epic.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(syncStatus[epic.id] || 'not_synced')}
                  <h4 className="font-medium text-gray-900">{epic.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Assigned to:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {epic.assignee_name || 'Unassigned'}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({getStatusText(syncStatus[epic.id] || 'not_synced')})
                  </span>
                </div>
              </div>
              
              {epic.stories?.map((story) => (
                <div key={story.id} className="ml-4 border-l-2 border-gray-100 pl-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(syncStatus[story.id] || 'not_synced')}
                      <h5 className="font-medium text-gray-800">{story.title}</h5>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Assigned to:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {story.assignee_name || 'Unassigned'}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({getStatusText(syncStatus[story.id] || 'not_synced')})
                      </span>
                    </div>
                  </div>
                  
                  {story.subtasks?.map((subtask) => (
                    <div key={subtask.id} className="ml-4 border-l-2 border-gray-50 pl-4 mb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(syncStatus[subtask.id] || 'not_synced')}
                          <span className="text-sm text-gray-700">{subtask.title}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Assigned to:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {subtask.assignee_name || 'Unassigned'}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({getStatusText(syncStatus[subtask.id] || 'not_synced')})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default JiraSync
