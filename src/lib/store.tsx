import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CaseRecord, CaseStage, DecisionOutcome } from './types'
import { generateCases } from './mock'
import { nextStage } from './pipeline'

const STORAGE_KEY = 'rpngc-cases-v1'

/** Signed in officer (mock — auth is a later phase). */
export const CURRENT_OFFICER = 'Insp. L. Waiko'

interface CaseContextValue {
  cases: CaseRecord[]
  advance: (id: string, note?: string) => void
  assign: (id: string, officer: string) => void
  addNote: (id: string, text: string) => void
  setDecision: (id: string, decision: DecisionOutcome) => void
  resetData: () => void
}

const CaseContext = createContext<CaseContextValue | null>(null)

function load(): CaseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CaseRecord[]
  } catch {
    /* corrupted storage → regenerate */
  }
  return generateCases()
}

function persist(cases: CaseRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
  } catch {
    /* storage full/unavailable — in-memory state still works */
  }
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(load)

  const value = useMemo<CaseContextValue>(() => {
    const update = (fn: (prev: CaseRecord[]) => CaseRecord[]) =>
      setCases((prev) => {
        const next = fn(prev)
        persist(next)
        return next
      })

    return {
      cases,
      advance: (id, note) =>
        update((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c
            const to = nextStage(c.stage)
            if (!to) return c
            const event = {
              stage: to as CaseStage,
              date: new Date().toISOString(),
              officer: CURRENT_OFFICER,
              note,
            }
            return { ...c, stage: to, timeline: [...c.timeline, event] }
          }),
        ),
      assign: (id, officer) =>
        update((prev) => prev.map((c) => (c.id === id ? { ...c, assignedTo: officer } : c))),
      addNote: (id, text) =>
        update((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  notes: [
                    ...c.notes,
                    { date: new Date().toISOString(), officer: CURRENT_OFFICER, text },
                  ],
                }
              : c,
          ),
        ),
      setDecision: (id, decision) =>
        update((prev) => prev.map((c) => (c.id === id ? { ...c, decision } : c))),
      resetData: () => {
        localStorage.removeItem(STORAGE_KEY)
        setCases(generateCases())
      },
    }
  }, [cases])

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCases() {
  const ctx = useContext(CaseContext)
  if (!ctx) throw new Error('useCases must be used within a CaseProvider')
  return ctx
}
