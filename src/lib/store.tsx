import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CaseRecord, CaseStage, ComplaintInput, DecisionOutcome, EvidenceFileMeta } from './types'
import { generateCases } from './mock'
import { nextStage, stageOf } from './pipeline'
import { useAuth } from './authStore'

const STORAGE_KEY = 'rpngc-cases-v1'

interface CaseContextValue {
  cases: CaseRecord[]
  allCases: CaseRecord[]
  submitForApproval: (id: string, comment: string) => void
  approveRequest: (id: string, comment: string) => void
  returnRequest: (id: string, comment: string) => void
  assign: (id: string, officer: string) => void
  addNote: (id: string, text: string, attachments?: EvidenceFileMeta[]) => void
  setDecision: (id: string, decision: DecisionOutcome) => void
  /** Lodge a complaint from the public client portal; returns the created record. */
  submitComplaint: (input: ComplaintInput) => CaseRecord
  resetData: () => void
}

const APPROVER_BY_STAGE: Partial<Record<CaseStage, string>> = {
  evidence_review: 'Sgt. R. Auali',
  investigation: 'Sgt. M. Kaupa',
  charges_filed: 'Sgt. M. Kaupa',
  in_court: 'Insp. L. Waiko',
  resolved: 'Insp. L. Waiko',
}

function approvalAssignee(target: CaseStage, requester: string) {
  const preferred = APPROVER_BY_STAGE[target] ?? 'Insp. L. Waiko'
  if (preferred !== requester) return preferred
  const alternate = preferred === 'Sgt. M. Kaupa' ? 'Sgt. R. Auali' : 'Insp. L. Waiko'
  return alternate !== requester ? alternate : 'Sgt. M. Kaupa'
}

/** Next sequential case reference, continuing from the highest existing number. */
function nextRef(cases: CaseRecord[]): string {
  const year = new Date().getFullYear()
  const highest = cases.reduce((max, c) => {
    const n = Number(/RPNGC-\d{4}-(\d+)/.exec(c.ref)?.[1])
    return Number.isFinite(n) && n > max ? n : max
  }, 140)
  return `RPNGC-${year}-${String(highest + 1).padStart(6, '0')}`
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
  const [allCases, setAllCases] = useState<CaseRecord[]>(load)
  const { activeOfficer } = useAuth()
  const canViewAll = activeOfficer.role === 'Administrator' || activeOfficer.role === 'Supervisor'
  const cases = canViewAll ? allCases : allCases.filter((item) => item.assignedTo === activeOfficer.name)

  const value = useMemo<CaseContextValue>(() => {
    const update = (fn: (prev: CaseRecord[]) => CaseRecord[]) =>
      setAllCases((prev) => {
        const next = fn(prev)
        persist(next)
        return next
      })

    return {
      cases,
      allCases,
      submitForApproval: (id, comment) =>
        update((prev) =>
          prev.map((c) => {
            if (c.id !== id) return c
            const to = nextStage(c.stage)
            if (!to || c.pendingApproval || c.assignedTo !== activeOfficer.name) return c
            return {
              ...c,
              pendingApproval: {
                targetStage: to,
                requestedBy: activeOfficer.name,
                requestedAt: new Date().toISOString(),
                assignedTo: approvalAssignee(to, activeOfficer.name),
                submissionComment: comment,
              },
            }
          }),
        ),
      approveRequest: (id, comment) =>
        update((prev) => prev.map((c) => {
          const request = c.pendingApproval
          if (c.id !== id || !request || (request.assignedTo !== activeOfficer.name && activeOfficer.role !== 'Administrator')) return c
          const now = new Date().toISOString()
          return {
            ...c,
            stage: request.targetStage,
            pendingApproval: undefined,
            approvalHistory: [...(c.approvalHistory ?? []), { ...request, status: 'approved', reviewedBy: activeOfficer.name, reviewedAt: now, reviewComment: comment }],
            timeline: [...c.timeline, { stage: request.targetStage, date: now, officer: activeOfficer.name, note: `Approved: ${comment}` }],
            notes: [...c.notes, { date: now, officer: activeOfficer.name, text: `Approved for ${stageOf(request.targetStage).label}: ${comment}` }],
          }
        })),
      returnRequest: (id, comment) =>
        update((prev) => prev.map((c) => {
          const request = c.pendingApproval
          if (c.id !== id || !request || (request.assignedTo !== activeOfficer.name && activeOfficer.role !== 'Administrator')) return c
          const now = new Date().toISOString()
          return {
            ...c,
            pendingApproval: undefined,
            approvalHistory: [...(c.approvalHistory ?? []), { ...request, status: 'returned', reviewedBy: activeOfficer.name, reviewedAt: now, reviewComment: comment }],
            notes: [...c.notes, { date: now, officer: activeOfficer.name, text: `Returned for changes before ${stageOf(request.targetStage).label}: ${comment}` }],
          }
        })),
      assign: (id, officer) =>
        update((prev) => prev.map((c) => (c.id === id ? { ...c, assignedTo: officer } : c))),
      addNote: (id, text, attachments = []) =>
        update((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  notes: [
                    ...c.notes,
                    { date: new Date().toISOString(), officer: activeOfficer.name, text, attachments },
                  ],
                }
              : c,
          ),
        ),
      setDecision: (id, decision) =>
        update((prev) => prev.map((c) => (c.id === id ? { ...c, decision } : c))),
      submitComplaint: (input) => {
        const now = new Date().toISOString()
        // Build the record outside the state updater so its id/ref/timestamp stay
        // stable across React's StrictMode double-invocation of the updater.
        const record: CaseRecord = {
          id: `pub-${Date.now()}`,
          ref: nextRef(allCases),
          filedAt: now,
          stage: 'filed',
          priority: input.immediateDanger ? 'critical' : input.severity,
          platform: input.platform,
          province: input.province,
          complainant: input.complainant,
          victimSameAsComplainant: input.victimSameAsComplainant,
          victimName: input.victimSameAsComplainant ? undefined : input.victimName?.trim() || undefined,
          victimRelationship: input.victimSameAsComplainant ? undefined : input.victimRelationship?.trim() || undefined,
          offenderAlias: input.offenderAlias?.trim() || undefined,
          offenderContact: input.offenderContact?.trim() || undefined,
          incidentDate: input.incidentDate,
          natureSummary: input.natureSummary.trim(),
          impactSummary: input.impactSummary.trim(),
          evidence: input.evidence,
          attachedFileCount: input.attachedFileCount,
          evidenceFiles: input.evidenceFiles,
          reliefSought: input.reliefSought,
          assignedTo: undefined,
          pendingApproval: undefined,
          approvalHistory: [],
          decision: undefined,
          court: undefined,
          remedies: { contentRemoval: false, protectionOrder: false },
          timeline: [
            { stage: 'filed', date: now, note: 'Complaint lodged via the public client portal.' },
          ],
          notes: [],
          source: 'portal',
        }
        update((prev) => [record, ...prev])
        return record
      },
      resetData: () => {
        localStorage.removeItem(STORAGE_KEY)
        setAllCases(generateCases())
      },
    }
  }, [cases, allCases, activeOfficer.name, activeOfficer.role])

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCases() {
  const ctx = useContext(CaseContext)
  if (!ctx) throw new Error('useCases must be used within a CaseProvider')
  return ctx
}
