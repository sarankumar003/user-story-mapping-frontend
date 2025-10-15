'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react'
import { 
  getDecompositionRaw,
  getJiraUsersCached,
  refreshJiraUsers,
  generateAssigneeSuggestions,
  getAssigneeSuggestions
} from '@/services/api'
import api from '@/services/api'
import { useRunStore } from '@/store/runStore'
import toast from 'react-hot-toast'

interface User { account_id: string; display_name: string; email_address?: string; role?: string }

interface AssigneeMapping {
  task_id: string
  task_type: string
  assignee_id: string
  assignee_name: string
  team?: string
}

export default function AssigneeMapping() {
  const { selectedRun } = useRunStore()
  const [requirements, setRequirements] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [suggesting, setSuggesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshingUsers, setRefreshingUsers] = useState(false)

  useEffect(() => {
    if (selectedRun) {
      fetchData(true)
    }
  }, [selectedRun])

  const fetchData = async (refreshUsers = false) => {
    if (!selectedRun) return

    setLoading(true)
    setError(null)

    try {
      // Load parsed raw decomposition
      const requirementsData = await getDecompositionRaw(selectedRun.id)
      setRequirements(requirementsData)
      // Load cached users once
      const usersRes = await getJiraUsersCached()
      setUsers(usersRes.users || [])
      
      // Load saved suggestions if they exist
      await loadSavedSuggestions()
    } catch (err: any) {
      console.error('Error fetching data:', err)
      const msg = err?.message || err?.detail || 'Failed to load data'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = async () => {
    if (!requirements || !selectedRun) return
    setSuggesting(true)
    try {
      // Prepare tasks data for AI
      const tasks = []
      
      for (const epic of requirements.epics || []) {
        // Add epic as a task
        tasks.push({
          id: epic.id,
          title: epic.title,
          description: epic.description || '',
          team: epic.team || 'product',
          priority: epic.priority || 'medium',
          task_type: 'epic'
        })
        
        // Add stories
        for (const story of epic.stories || []) {
          tasks.push({
            id: story.id,
            title: story.title,
            description: story.description || '',
            team: story.team || 'backend',
            priority: story.priority || 'medium',
            task_type: 'story'
          })
          
          // Add subtasks
          for (const subtask of story.subtasks || []) {
            tasks.push({
              id: subtask.id,
              title: subtask.title,
              description: subtask.description || '',
              team: subtask.team || story.team || 'backend',
              priority: subtask.priority || 'medium',
              task_type: 'subtask'
            })
          }
        }
      }
      
      // Clean users data to ensure no null values
      const cleanUsers = users.map(user => ({
        account_id: user.account_id || '',
        display_name: user.display_name || '',
        email_address: user.email_address || null,
        role: user.role || ''
      }))
      
      // Call the AI-powered suggestion API
      const response = await generateAssigneeSuggestions(selectedRun.id, cleanUsers, tasks)
      
      console.log('AI Response:', response)
      console.log('Suggestions:', response.suggestions)
      
      const newSuggestions = response.suggestions || {}
      setSuggestions(newSuggestions)
      
      // Automatically apply suggestions to assignments
      setAssignments(newSuggestions)
      
      toast.success('AI-powered assignee suggestions generated and applied!')
    } catch (err) {
      console.error('Error generating suggestions:', err)
      toast.error('Failed to generate suggestions')
    } finally {
      setSuggesting(false)
    }
  }


  const loadSavedSuggestions = async () => {
    if (!selectedRun) return
    try {
      const response = await getAssigneeSuggestions(selectedRun.id)
      if (response.suggestions) {
        setSuggestions(response.suggestions)
        setAssignments(response.suggestions)
        toast.success('Saved suggestions loaded automatically!')
      }
    } catch (err) {
      // No saved suggestions found - this is normal for new runs
      console.log('No saved suggestions found for this run')
    }
  }

  const saveAssignments = async () => {
    if (!selectedRun || !requirements) return
    
    setSaving(true)
    try {
      // Create final assignments JSON structure
      const finalAssignments = {
        run_id: selectedRun.id,
        saved_at: new Date().toISOString(),
        epics: requirements.epics?.map((epic: any) => ({
          id: epic.id,
          title: epic.title,
          description: epic.description || '',
          assignee: assignments[epic.id] || '',
          assignee_name: users.find(u => u.account_id === assignments[epic.id])?.display_name || '',
          stories: epic.stories?.map((story: any) => ({
            id: story.id,
            title: story.title,
            description: story.description || '',
            assignee: assignments[story.id] || '',
            assignee_name: users.find(u => u.account_id === assignments[story.id])?.display_name || '',
            subtasks: story.subtasks?.map((subtask: any) => ({
              id: subtask.id,
              title: subtask.title,
              description: subtask.description || '',
              assignee: assignments[subtask.id] || '',
              assignee_name: users.find(u => u.account_id === assignments[subtask.id])?.display_name || ''
            })) || []
          })) || []
        })) || []
      }
      
      // Save to backend
      await api.post(`/api/v1/assignments/final/${selectedRun.id}`, finalAssignments)
      toast.success('Final assignments saved successfully!')
    } catch (err) {
      console.error('Error saving assignments:', err)
      toast.error('Failed to save assignments')
    } finally {
      setSaving(false)
    }
  }

  const updateAssignment = (taskId: string, assigneeId: string) => {
    setAssignments(prev => ({
      ...prev,
      [taskId]: assigneeId
    }))
  }

  if (!selectedRun) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Assignee Mapping
        </h2>
        <p className="text-gray-500">
          Select a run from the sidebar to view assignees
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Assignee Mapping
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Assignee Mapping
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => fetchData(true)}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!requirements) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Assignee Mapping
        </h2>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">
            No requirements found. Please complete requirements decomposition first.
          </p>
        </div>
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
              Assignee Mapping
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Map tasks to team members for development
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={async () => {
                setRefreshingUsers(true)
                try {
                  const res = await refreshJiraUsers()
                  setUsers(res.users || [])
                  toast.success('Users refreshed from Jira!')
                } catch (e) {
                  toast.error('Failed to refresh users')
                } finally {
                  setRefreshingUsers(false)
                }
              }}
              className="btn-secondary flex items-center"
              disabled={refreshingUsers}
            >
              {refreshingUsers ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Refresh Users
                </>
              )}
            </button>
            <button
              onClick={generateSuggestions}
              disabled={suggesting}
              className="btn-secondary flex items-center"
            >
              {suggesting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </button>
            <button
              onClick={saveAssignments}
              disabled={saving || Object.keys(assignments).length === 0}
              className="btn-primary flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Assignments
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-900">
            Available Team Members
          </h3>
          <div className="text-xs text-gray-500">
            Edit roles in <code className="bg-gray-100 px-1 rounded">users.json</code>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((user) => (
            <div key={user.account_id} className="flex items-center p-3 bg-gray-50 rounded-md">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-primary-600">
                  {user.display_name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.display_name}</p>
                {user.email_address && (
                  <p className="text-xs text-gray-500">{user.email_address}</p>
                )}
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-400 mr-1">Role:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.role || 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Assignments */}
      <div className="space-y-4">
        {requirements.epics?.map((epic: any) => (
          <div key={epic.id} className="card">
            <h3 className="text-md font-medium text-gray-900 mb-4">{epic.title}</h3>
            
            {epic.stories?.map((story: any) => (
              <div key={story.id} className="mb-4 p-4 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{story.title}</h4>
                  <select
                    value={assignments[story.id] || ''}
                    onChange={(e) => updateAssignment(story.id, e.target.value)}
                    className="input-field w-48"
                  >
                    <option value="">Select assignee...</option>
                    {users.map((user) => (
                      <option key={user.account_id} value={user.account_id}>
                        {user.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {story.subtasks?.map((subtask: any) => (
                  <div key={subtask.id} className="ml-4 flex items-center justify-between py-2">
                    <span className="text-sm text-gray-700">{subtask.title}</span>
                    <select
                      value={assignments[subtask.id] || ''}
                      onChange={(e) => updateAssignment(subtask.id, e.target.value)}
                      className="input-field w-40 text-sm"
                    >
                      <option value="">Select assignee...</option>
                      {users.map((user) => (
                        <option key={user.account_id} value={user.account_id}>
                          {user.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

    </div>
  )
}
