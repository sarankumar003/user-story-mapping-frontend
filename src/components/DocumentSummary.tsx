'use client'

import { useState, useEffect } from 'react'
import { FileText, Users, Target, CheckSquare, AlertTriangle, Clock, Building } from 'lucide-react'
import { getDocumentSummary } from '@/services/api'
import { useRunStore } from '@/store/runStore'

interface DocumentSummaryData {
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

export default function DocumentSummary() {
  const { selectedRun, updateRun } = useRunStore()
  const [summary, setSummary] = useState<DocumentSummaryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedRun) return
    // First check client cache
    const cached = useRunStore.getState().getSummary(selectedRun.id)
    if (cached) {
      setSummary(cached)
      setError(null)
      setLoading(false)
      return
    }
    fetchSummary()
  }, [selectedRun])

  const fetchSummary = async () => {
    if (!selectedRun) return

    setLoading(true)
    setError(null)

    try {
      const summaryData = await getDocumentSummary(selectedRun.id)
      setSummary(summaryData)
      useRunStore.getState().setSummary(selectedRun.id, summaryData)
    } catch (err) {
      console.error('Error fetching summary:', err)
      setError('Failed to load document summary')
    } finally {
      setLoading(false)
    }
  }

  // Update summary step status when summary data is successfully loaded or failed
  useEffect(() => {
    if (selectedRun) {
      if (error && selectedRun.steps.summary.status !== 'failed') {
        // Mark as failed if there's an error
        updateRun(selectedRun.id, {
          steps: {
            ...selectedRun.steps,
            summary: {
              status: 'failed',
              timestamp: new Date().toISOString()
            }
          }
        })
      } else if (summary && !error && selectedRun.steps.summary.status !== 'completed') {
        // Mark as completed if data is successfully loaded
        updateRun(selectedRun.id, {
          steps: {
            ...selectedRun.steps,
            summary: {
              status: 'completed',
              timestamp: new Date().toISOString()
            }
          }
        })
      }
    }
  }, [summary, selectedRun?.id, updateRun, error])

  if (!selectedRun) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Document Summary
        </h2>
        <p className="text-gray-500">
          Select a run from the sidebar to view summary
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Document Summary
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Loading summary...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Document Summary
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchSummary}
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

  if (!summary) {
    return (
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Document Summary
        </h2>
        <p className="text-gray-500">
          No summary available for this run
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Building className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Project Overview</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Project Name</h3>
            <p className="text-gray-900">{summary.project_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
            <p className="text-gray-900 leading-relaxed">{summary.project_description}</p>
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Target className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Objectives</h2>
        </div>
        <ul className="space-y-2">
          {summary.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <CheckSquare className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Scope */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Project Scope</h2>
        </div>
        <div className="space-y-3">
          {summary.scope.map((scopeItem, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-primary-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{scopeItem}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stakeholders */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Stakeholders</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.stakeholders.map((stakeholder, index) => (
            <div key={index} className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              <span className="text-gray-700">{stakeholder}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="card">
        <div className="flex items-center mb-4">
          <CheckSquare className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Key Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {summary.key_features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Requirements */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Technical Requirements</h2>
        </div>
        <div className="space-y-2">
          {summary.technical_requirements.map((requirement, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{requirement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Timeline Estimate</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{summary.timeline_estimate}</p>
      </div>

      {/* Risks */}
      <div className="card">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Risks</h2>
        </div>
        <div className="space-y-2">
          {summary.risks.map((risk, index) => (
            <div key={index} className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assumptions */}
      <div className="card">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-primary-600 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Assumptions</h2>
        </div>
        <div className="space-y-2">
          {summary.assumptions.map((assumption, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{assumption}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

