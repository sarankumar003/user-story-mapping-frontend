import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { clearCorruptedStore, validateStoreData } from '../utils/storeUtils'

export interface Run {
  id: string
  file_name: string
  file_path: string
  file_size: number
  created_at: string
  status: string
  steps: {
    upload: { status: string; timestamp: string | null }
    summary: { status: string; timestamp: string | null }
    decomposition: { status: string; timestamp: string | null }
    gantt: { status: string; timestamp: string | null }
    jira_sync: { status: string; timestamp: string | null }
  }
}

interface RunStore {
  runs: Run[]
  selectedRun: Run | null
  summaries: Record<string, any>
  setRuns: (runs: Run[]) => void
  addRun: (run: Run) => void
  updateRun: (runId: string, updates: Partial<Run>) => void
  selectRun: (run: Run | null) => void
  clearRuns: () => void
  getSummary: (runId: string) => any | undefined
  setSummary: (runId: string, summary: any) => void
}

export const useRunStore = create<RunStore>()(
  persist(
    (set, get) => {
      try {
        return {
      runs: [],
      selectedRun: null,
      summaries: {},
      
      setRuns: (runs) => set({ runs }),
      
      addRun: (run) => set((state) => ({ 
        runs: [run, ...(state.runs || [])] 
      })),
      
      updateRun: (runId, updates) => set((state) => ({
        runs: (state.runs || []).map(run => 
          run.id === runId ? { ...run, ...updates } : run
        ),
        selectedRun: state.selectedRun?.id === runId 
          ? { ...state.selectedRun, ...updates }
          : state.selectedRun
      })),
      
      selectRun: (run) => set({ selectedRun: run }),
      
      getSummary: (runId) => {
        const state = get()
        return state.summaries[runId]
      },

      setSummary: (runId, summary) => set((state) => ({
        summaries: { ...state.summaries, [runId]: summary }
      })),

      clearRuns: () => set({ runs: [], selectedRun: null }),
        }
      } catch (error) {
        console.error('Error initializing run store:', error)
        clearCorruptedStore('run-store')
        return {
          runs: [],
          selectedRun: null,
          summaries: {},
          setRuns: () => {},
          addRun: () => {},
          updateRun: () => {},
          selectRun: () => {},
          clearRuns: () => {},
          getSummary: () => undefined,
          setSummary: () => {}
        }
      }
    },
    {
      name: 'run-store',
      partialize: (state) => ({ 
        runs: state.runs,
        selectedRun: state.selectedRun,
        summaries: state.summaries
      }),
      migrate: (persistedState: any, version: number) => {
        try {
          // Validate the persisted state structure
          const expectedKeys = ['runs', 'selectedRun', 'summaries']
          if (!validateStoreData(persistedState, expectedKeys)) {
            console.warn('Invalid store data detected, clearing store')
            clearCorruptedStore('run-store')
            return {
              runs: [],
              selectedRun: null,
              summaries: {}
            }
          }

          // Ensure runs is always an array
          if (persistedState && typeof persistedState === 'object') {
            return {
              ...persistedState,
              runs: Array.isArray(persistedState.runs) ? persistedState.runs : [],
              summaries: persistedState.summaries || {},
              selectedRun: persistedState.selectedRun || null
            }
          }
          return {
            runs: [],
            selectedRun: null,
            summaries: {}
          }
        } catch (error) {
          console.error('Error during store migration:', error)
          clearCorruptedStore('run-store')
          return {
            runs: [],
            selectedRun: null,
            summaries: {}
          }
        }
      },
      version: 1
    }
  )
)

