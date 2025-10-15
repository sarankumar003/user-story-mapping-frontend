import { create } from 'zustand'
import { Decomposition } from '../types/requirements'
import { triggerDecomposition, getDecompositionRaw } from '../services/api'

interface RequirementsState {
  decompositionRaw: Decomposition | null
  loading: boolean
  error: string | null
  generate: (runId: string) => Promise<void>
  loadRaw: (runId: string) => Promise<void>
  clear: () => void
}

export const useRequirementsStore = create<RequirementsState>((set) => ({
  decompositionRaw: null,
  loading: false,
  error: null,

  clear: () => set({ decompositionRaw: null, error: null }),

  loadRaw: async (runId: string) => {
    set({ loading: true, error: null })
    try {
      const data = await getDecompositionRaw(runId)
      set({ decompositionRaw: data, loading: false })
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load decomposition', loading: false })
    }
  },

  generate: async (runId: string) => {
    set({ loading: true, error: null })
    try {
      // Show toast notification
      const { default: toast } = await import('react-hot-toast')
      toast.loading('Starting decomposition process...', { id: 'decomposition' })
      
      const result = await triggerDecomposition(runId)
      
      // Update toast with success message
      toast.success('Decomposition completed successfully!', { id: 'decomposition' })
      
      // After triggering, fetch the parsed raw data
      const data = await getDecompositionRaw(runId)
      set({ decompositionRaw: data, loading: false })
    } catch (e: any) {
      // Update toast with error message
      const { default: toast } = await import('react-hot-toast')
      toast.error(e?.message || 'Failed to generate decomposition', { id: 'decomposition' })
      set({ error: e?.message || 'Failed to generate decomposition', loading: false })
    }
  },
}))
