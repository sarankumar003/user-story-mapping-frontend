'use client'

import React from 'react'
import { Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useStreamingDecomposition } from '@/hooks/useStreamingDecomposition'
import { useRunStore } from '@/store/runStore'

type Props = {
  hideStartButton?: boolean
}

export default function StreamingDecomposition({ hideStartButton = false }: Props) {
  const { selectedRun } = useRunStore()
  const {
    isStreaming,
    progress,
    currentChunk,
    totalChunks,
    epicsCount,
    totalHours,
    warnings,
    wasRepaired,
    error,
    startStreamingDecomposition,
    reset,
  } = useStreamingDecomposition()

  const handleStreamingDecomposition = () => {
    if (selectedRun) {
      startStreamingDecomposition(selectedRun.id)
    }
  }

  // Enhanced and validation flows are hidden in UI per request

  const getProgressMessage = () => {
    if (!progress) return 'Ready to start'
    
    switch (progress.type) {
      case 'status':
        return progress.message || 'Processing...'
      case 'progress':
        return `Processing... ${progress.chunks_received} chunks received (${progress.response_length} chars)`
      case 'chunk_start':
        return `Processing chunk ${progress.chunk_index} of ${progress.total_chunks}...`
      case 'chunk_complete':
        return `Completed chunk ${progress.chunk_index} (${progress.epics_count} epics)...`
      case 'complete':
        return `Completed with ${progress.epics_count} epics (${progress.total_hours}h)`
      case 'error':
        return `Error: ${progress.error}`
      default:
        return 'Processing...'
    }
  }

  const getProgressPercentage = () => {
    if (totalChunks > 0 && currentChunk > 0) {
      return Math.round((currentChunk / totalChunks) * 100)
    }
    return 0
  }

  if (!selectedRun) {
    return (
      <div className="text-center py-8 text-gray-500">
        Select a run from the left to start decomposition
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Streaming Decomposition</h3>

        {!hideStartButton && (
          <button
            onClick={handleStreamingDecomposition}
            disabled={isStreaming}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start Streaming Decomposition
          </button>
        )}
      </div>

      {/* Progress Section */}
      {isStreaming && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Decomposition Progress</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{getProgressMessage()}</span>
              {totalChunks > 0 && (
                <span>Chunk {currentChunk} of {totalChunks}</span>
              )}
            </div>

            {totalChunks > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}

            {epicsCount > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="font-medium text-blue-900">Epics Generated</div>
                  <div className="text-blue-700">{epicsCount}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-md">
                  <div className="font-medium text-green-900">Total Hours</div>
                  <div className="text-green-700">{totalHours}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {!isStreaming && (epicsCount > 0 || warnings.length > 0 || wasRepaired || error) && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Decomposition Results</h4>
          
          <div className="space-y-4">
            {epicsCount > 0 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Successfully generated {epicsCount} epics with {totalHours} total hours</span>
              </div>
            )}

            {wasRepaired && (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Response was repaired due to truncation - some content may be incomplete</span>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center text-yellow-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>Warnings:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-gray-600 ml-7">
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Error: {error}</span>
              </div>
            )}

            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Info section removed per request */}
    </div>
  )
}

