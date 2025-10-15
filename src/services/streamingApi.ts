/**
 * Streaming API Service
 * Handles streaming responses from the backend for long-running operations
 */

import { API_BASE_URL } from './api'

export interface StreamingProgress {
  type: 'status' | 'progress' | 'chunk_start' | 'chunk_complete' | 'complete' | 'error' | 'end'
  message?: string
  chunks_received?: number
  response_length?: number
  chunk_index?: number
  total_chunks?: number
  epics_count?: number
  total_hours?: number
  warnings?: string[]
  was_repaired?: boolean
  validation?: any
  error?: string
}

export class StreamingAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  /**
   * Decompose requirements with streaming progress updates
   */
  async decomposeRequirementsStreaming(
    runId: string,
    onProgress: (progress: StreamingProgress) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/v1/requirements/decompose_streaming/${runId}`
      console.log('Streaming API URL:', url)
      console.log('Base URL:', this.baseUrl)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      
      // Simulate progress updates for non-streaming response
      onProgress({
        type: 'status',
        message: 'Starting decomposition...'
      })
      
      onProgress({
        type: 'progress',
        chunks_received: 1,
        response_length: JSON.stringify(result).length
      })
      
      onComplete(result)
      
    } catch (error) {
      console.error('Streaming API error:', error)
      onError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  /**
   * Decompose requirements with validation
   */
  async decomposeRequirementsWithValidation(
    runId: string,
    onProgress: (progress: StreamingProgress) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      const url = `${this.baseUrl}/api/v1/requirements/decompose_enhanced/${runId}`
      console.log('Enhanced API URL:', url)
      console.log('Base URL:', this.baseUrl)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      const result = await response.json()
      
      // Simulate progress updates for non-streaming response
      onProgress({
        type: 'status',
        message: 'Starting enhanced decomposition...'
      })
      
      onProgress({
        type: 'progress',
        chunks_received: 1,
        response_length: JSON.stringify(result).length
      })
      
      onComplete(result)
      
    } catch (error) {
      console.error('Streaming API error:', error)
      onError(error instanceof Error ? error.message : 'Unknown error occurred')
    }
  }

  /**
   * Validate decomposition for a run
   */
  async validateDecomposition(runId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/requirements/decomposition_validation/${runId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Validation API error:', error)
      throw error
    }
  }

  /**
   * Enhanced decomposition (non-streaming but with validation)
   */
  async decomposeRequirementsEnhanced(runId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/requirements/decompose_enhanced/${runId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Enhanced decomposition API error:', error)
      throw error
    }
  }
}

// Export singleton instance
export const streamingApi = new StreamingAPI()
