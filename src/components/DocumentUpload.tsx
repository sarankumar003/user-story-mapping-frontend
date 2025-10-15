'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRunStore } from '@/store/runStore'
import { uploadDocument, getRun } from '@/services/api'

export default function DocumentUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { addRun, updateRun } = useRunStore()

  const pollForSummaryCompletion = useCallback(async (runId: string) => {
    let attempts = 0
    const maxAttempts = 30 // 30 attempts * 2 seconds = 1 minute max
    
    const poll = async () => {
      try {
        const run = await getRun(runId)
        updateRun(runId, run)
        
        // Check if summary is completed or failed
        if (run.steps.summary.status === 'completed') {
          toast.success('Summary generation completed!')
          return
        } else if (run.steps.summary.status === 'failed') {
          toast.error('Summary generation failed. Please try again.')
          return
        }
        
        // Continue polling if still in progress
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000) // Poll every 2 seconds
        } else {
          toast.error('Summary generation is taking longer than expected. Please check the run status.')
        }
      } catch (error) {
        console.error('Error polling for summary completion:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000)
        }
      }
    }
    
    // Start polling after a short delay
    setTimeout(poll, 2000)
  }, [updateRun])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.doc']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a PDF or Word document (.pdf, .docx, .doc)')
      return
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await uploadDocument(formData)
      
      if (response.document_id) {
        // Add run to store with proper status tracking
        const newRun = {
          id: response.document_id,
          file_name: response.file_name,
          file_path: '',
          file_size: file.size,
          created_at: new Date().toISOString(),
          status: 'uploaded', // Initial status after upload
          steps: {
            upload: { status: 'completed', timestamp: new Date().toISOString() },
            summary: { status: 'in_progress', timestamp: new Date().toISOString() }, // Summary starts immediately
            decomposition: { status: 'pending', timestamp: null },
            gantt: { status: 'pending', timestamp: null },
            jira_sync: { status: 'pending', timestamp: null }
          }
        }
        
        addRun(newRun)
        toast.success('Document uploaded successfully! Summary generation in progress...')
        
        // Start polling for summary completion
        pollForSummaryCompletion(response.document_id)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }, [addRun])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    multiple: false,
    disabled: isUploading
  })

  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Upload BRD Document
        </h2>
        <p className="text-sm text-gray-600">
          Upload a Business Requirements Document (BRD) to start the processing workflow.
          Supported formats: PDF, DOCX, DOC (max 10MB)
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary-400 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            {isUploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            ) : (
              <Upload className="w-full h-full" />
            )}
          </div>
          
          <div>
            {isUploading ? (
              <p className="text-sm font-medium text-gray-900">
                Uploading and processing document...
              </p>
            ) : isDragActive ? (
              <p className="text-sm font-medium text-primary-600">
                Drop the file here
              </p>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Drag and drop your BRD document here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse files
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Guidelines */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Document Requirements
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Document should contain clear project objectives and scope</li>
                <li>Include stakeholder information and key features</li>
                <li>Technical requirements and constraints should be specified</li>
                <li>Timeline estimates and risk assessments are helpful</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Processing Workflow
        </h3>
        <div className="space-y-2">
          {[
            { step: 'Upload', description: 'Document uploaded and validated' },
            { step: 'Summary', description: 'AI extracts key information' },
            { step: 'Decomposition', description: 'Requirements broken into epics/stories' },
            { step: 'Gantt Chart', description: 'Timeline and dependencies created' },
            { step: 'Jira Sync', description: 'Tickets created in Jira board' }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.step}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

