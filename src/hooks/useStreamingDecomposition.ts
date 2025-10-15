/**
 * Custom hook for handling streaming decomposition
 */

import { useState, useCallback } from 'react'
import { streamingApi, StreamingProgress } from '../services/streamingApi'
import { useRunStore } from '../store/runStore'
import { useRequirementsStore } from '../store/requirementsStore'
import { getRuns } from '../services/api'
import toast from 'react-hot-toast'

export interface StreamingDecompositionState {
  isStreaming: boolean
  progress: StreamingProgress | null
  currentChunk: number
  totalChunks: number
  epicsCount: number
  totalHours: number
  warnings: string[]
  wasRepaired: boolean
  error: string | null
}

export const useStreamingDecomposition = () => {
  const [state, setState] = useState<StreamingDecompositionState>({
    isStreaming: false,
    progress: null,
    currentChunk: 0,
    totalChunks: 0,
    epicsCount: 0,
    totalHours: 0,
    warnings: [],
    wasRepaired: false,
    error: null,
  })

  const { selectedRun, setRuns } = useRunStore()
  const { loadRaw } = useRequirementsStore()

  const refreshRuns = useCallback(async () => {
    try {
      const response = await getRuns()
      setRuns(response.data)
    } catch (error) {
      console.error('Failed to refresh runs:', error)
    }
  }, [setRuns])

  const refreshDecomposition = useCallback(async (runId: string) => {
    try {
      await loadRaw(runId)
    } catch (error) {
      console.error('Failed to refresh decomposition:', error)
    }
  }, [loadRaw])

  const startStreamingDecomposition = useCallback(async (runId: string) => {
    if (!runId) {
      toast.error('No run selected')
      return
    }

    console.log('Starting streaming decomposition for run:', runId)

    setState({
      isStreaming: true,
      progress: null,
      currentChunk: 0,
      totalChunks: 0,
      epicsCount: 0,
      totalHours: 0,
      warnings: [],
      wasRepaired: false,
      error: null,
    })

    toast.loading('Starting decomposition...', { id: 'decomposition' })

    try {
      await streamingApi.decomposeRequirementsStreaming(
        runId,
        // onProgress
        (progress: StreamingProgress) => {
          setState(prev => ({
            ...prev,
            progress,
            currentChunk: progress.chunk_index || prev.currentChunk,
            totalChunks: progress.total_chunks || prev.totalChunks,
            epicsCount: progress.epics_count || prev.epicsCount,
            totalHours: progress.total_hours || prev.totalHours,
            warnings: progress.warnings || prev.warnings,
            wasRepaired: progress.was_repaired || prev.wasRepaired,
          }))

          // Update toast with progress
          if (progress.type === 'progress') {
            toast.loading(
              `Processing... ${progress.chunks_received} chunks received (${progress.response_length} chars)`,
              { id: 'decomposition' }
            )
          } else if (progress.type === 'chunk_start') {
            toast.loading(
              `Processing chunk ${progress.chunk_index} of ${progress.total_chunks}...`,
              { id: 'decomposition' }
            )
          } else if (progress.type === 'chunk_complete') {
            toast.loading(
              `Completed chunk ${progress.chunk_index} (${progress.epics_count} epics)...`,
              { id: 'decomposition' }
            )
          }
        },
        // onComplete
        async (result: any) => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
            epicsCount: result.epics_count || prev.epicsCount,
            totalHours: result.total_hours || prev.totalHours,
            warnings: result.warnings || prev.warnings,
            wasRepaired: result.was_repaired || prev.wasRepaired,
          }))

          // Show completion toast
          if (result.was_repaired) {
            toast.success(
              `Decomposition completed with ${result.epics_count} epics (${result.total_hours}h) - Response was repaired due to truncation`,
              { id: 'decomposition', duration: 6000 }
            )
          } else {
            toast.success(
              `Decomposition completed with ${result.epics_count} epics (${result.total_hours}h)`,
              { id: 'decomposition' }
            )
          }

          // Show warnings if any
          if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach((warning: string) => {
              toast.warning(warning, { duration: 5000 })
            })
          }

          // Refresh runs and decomposition data to update the UI
          await Promise.all([
            refreshRuns(),
            refreshDecomposition(runId)
          ])
        },
        // onError
        (error: string) => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
            error,
          }))

          toast.error(`Decomposition failed: ${error}`, { id: 'decomposition' })
        }
      )
    } catch (error) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))

      toast.error('Failed to start streaming decomposition', { id: 'decomposition' })
    }
  }, [refreshRuns, refreshDecomposition])

  const startEnhancedDecomposition = useCallback(async (runId: string) => {
    if (!runId) {
      toast.error('No run selected')
      return
    }

    console.log('Starting enhanced decomposition for run:', runId)

    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
    }))

    toast.loading('Starting enhanced decomposition...', { id: 'decomposition' })

    try {
      const result = await streamingApi.decomposeRequirementsEnhanced(runId)
      
      setState(prev => ({
        ...prev,
        isStreaming: false,
        epicsCount: result.epics_count || 0,
        totalHours: result.total_hours || 0,
        warnings: result.warnings || [],
        wasRepaired: result.was_repaired || false,
      }))

      // Show completion toast
      if (result.was_repaired) {
        toast.success(
          `Enhanced decomposition completed with ${result.epics_count} epics (${result.total_hours}h) - Response was repaired due to truncation`,
          { id: 'decomposition', duration: 6000 }
        )
      } else {
        toast.success(
          `Enhanced decomposition completed with ${result.epics_count} epics (${result.total_hours}h)`,
          { id: 'decomposition' }
        )
      }

      // Show warnings if any
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          toast.warning(warning, { duration: 5000 })
        })
      }

      // Refresh runs and decomposition data to update the UI
      await Promise.all([
        refreshRuns(),
        refreshDecomposition(runId)
      ])

    } catch (error) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))

      toast.error(`Enhanced decomposition failed: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: 'decomposition' })
    }
  }, [refreshRuns, refreshDecomposition])

  const validateDecomposition = useCallback(async (runId: string) => {
    try {
      const validation = await streamingApi.validateDecomposition(runId)
      
      if (validation.is_valid) {
        toast.success(`Decomposition is valid (${validation.statistics.epics_count} epics, ${validation.statistics.stories_count} stories, ${validation.statistics.subtasks_count} subtasks)`)
      } else {
        toast.error(`Decomposition validation failed: ${validation.errors.join(', ')}`)
      }

      if (validation.warnings && validation.warnings.length > 0) {
        validation.warnings.forEach((warning: string) => {
          toast.warning(warning, { duration: 5000 })
        })
      }

      return validation
    } catch (error) {
      toast.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isStreaming: false,
      progress: null,
      currentChunk: 0,
      totalChunks: 0,
      epicsCount: 0,
      totalHours: 0,
      warnings: [],
      wasRepaired: false,
      error: null,
    })
  }, [])

  return {
    ...state,
    startStreamingDecomposition,
    startEnhancedDecomposition,
    validateDecomposition,
    reset,
  }
}
