import { createContext, useContext } from 'react'
import type { AppStateApi } from './useAppState'

export const AppStateContext = createContext<AppStateApi | null>(null)

export function useApp(): AppStateApi {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used within AppStateProvider')
  return ctx
}
