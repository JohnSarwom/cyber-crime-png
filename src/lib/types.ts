/** Case pipeline stages — mirrors the STEP-BY-STEP PROCESS in the source document. */
export type CaseStage =
  | 'filed'
  | 'evidence_review'
  | 'investigation'
  | 'charges_filed'
  | 'in_court'
  | 'resolved'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

/** Decision node outcomes (Section 23, Cybercrime Act 2016). */
export type DecisionOutcome = 'misdemeanour' | 'serious_harm' | 'death_resulting'

export type Platform = 'Facebook' | 'WhatsApp' | 'TikTok' | 'Instagram' | 'Other'

export interface TimelineEvent {
  stage: CaseStage
  date: string // ISO
  note?: string
  officer?: string
}

export interface CaseNote {
  date: string // ISO
  officer: string
  text: string
}

export interface CaseRecord {
  id: string
  ref: string // e.g. RPNGC-2026-000123
  filedAt: string // ISO
  stage: CaseStage
  priority: Priority
  platform: Platform
  province: string

  complainant: { name: string; contact: string; email: string }
  victimSameAsComplainant: boolean
  victimName?: string
  offenderAlias?: string

  natureSummary: string
  impactSummary: string

  /** Evidence checklist ids ticked on the complaint form. */
  evidence: string[]
  attachedFileCount: number

  assignedTo?: string
  decision?: DecisionOutcome
  remedies: { contentRemoval: boolean; protectionOrder: boolean }

  timeline: TimelineEvent[]
  notes: CaseNote[]
}
