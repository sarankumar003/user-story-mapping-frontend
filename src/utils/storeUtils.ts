/**
 * Utility functions for store management and localStorage handling
 */

export const clearCorruptedStore = (storeName: string) => {
  try {
    localStorage.removeItem(storeName)
    console.log(`Cleared corrupted store: ${storeName}`)
  } catch (error) {
    console.error(`Failed to clear store ${storeName}:`, error)
  }
}

export const validateStoreData = (data: any, expectedKeys: string[]): boolean => {
  if (!data || typeof data !== 'object') {
    return false
  }
  
  for (const key of expectedKeys) {
    if (!(key in data)) {
      return false
    }
  }
  
  return true
}

export const safeParseJSON = (jsonString: string, fallback: any = null): any => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to parse JSON:', error)
    return fallback
  }
}
