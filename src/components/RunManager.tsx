'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  RefreshCw,
  Calendar,
  HardDrive
} from 'lucide-react'
import { useRunStore } from '@/store/runStore'
import { getRuns } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'

export default function RunManager() {
  const { runs, selectedRun, setRuns, selectRun } = useRunStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRuns()
  }, []) // Only load runs once on mount

  const loadRuns = async () => {
    setIsLoading(true)
    try {
      const response = await getRuns()
      const runsData = Array.isArray(response) ? response : (response?.runs || [])
      setRuns(runsData)
    } catch (error) {
      console.error('Error loading runs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      case 'pending':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Processing History
          </h2>
          <button
            onClick={loadRuns}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh runs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {runs?.length || 0} document{(runs?.length || 0) !== 1 ? 's' : ''} processed
        </p>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading runs...</p>
          </div>
        ) : (runs?.length || 0) === 0 ? (
          <div className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-2">No documents processed yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Upload a BRD document to get started
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {(runs || []).map((run) => (
              <div
                key={run.id}
                onClick={() => selectRun(run)}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-colors
                  ${selectedRun?.id === run.id
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {/* File Info */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {run.file_name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <HardDrive className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatFileSize(run.file_size)}
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(run.status)}`}>
                    {run.status}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="flex items-center space-x-1 mb-3">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(run.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Processing Steps */}
                <div className="space-y-1">
                  {Object.entries(run.steps).map(([step, stepData]) => (
                    <div key={step} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(stepData.status)}
                        <span className="text-xs text-gray-600 capitalize">
                          {step.replace('_', ' ')}
                        </span>
                      </div>
                      {stepData.timestamp && (
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(stepData.timestamp), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Run Details */}
      {selectedRun && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Run Details
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div>
              <span className="font-medium">ID:</span> {selectedRun.id}
            </div>
            <div>
              <span className="font-medium">File:</span> {selectedRun.file_name}
            </div>
            <div>
              <span className="font-medium">Size:</span> {formatFileSize(selectedRun.file_size)}
            </div>
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(selectedRun.created_at).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
