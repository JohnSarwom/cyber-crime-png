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

export interface EvidenceFileMeta {
  name: string
  size: number
  type: string
}

export interface CourtDetails {
  court?: string
  nextHearingAt?: string
  presidingOfficer?: string
  hearingType?: string
}

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

  complainant: { name: string; contact: string; email: string; address?: string }
  victimSameAsComplainant: boolean
  victimName?: string
  victimRelationship?: string
  offenderAlias?: string
  offenderContact?: string
  incidentDate?: string

  natureSummary: string
  impactSummary: string

  /** Evidence checklist ids ticked on the complaint form. */
  evidence: string[]
  attachedFileCount: number
  evidenceFiles?: EvidenceFileMeta[]
  reliefSought?: string[]

  assignedTo?: string
  decision?: DecisionOutcome
  /** Optional while existing locally persisted demo records migrate lazily. */
  court?: CourtDetails
  remedies: { contentRemoval: boolean; protectionOrder: boolean }

  timeline: TimelineEvent[]
  notes: CaseNote[]

  /** True for records lodged through the public client portal (vs. seeded demo data). */
  source?: 'portal' | 'demo'
}

/**
 * Data captured by the public client portal intake wizard. This is the citizen-
 * facing slice of a complaint — everything an officer later adds (assignment,
 * decision, court, remedies) is populated through the dashboard workflow.
 */
export interface ComplaintInput {
  platform: Platform
  province: string
  /** ISO date the incident occurred (from a date input). */
  incidentDate: string
  offenderAlias?: string
  offenderContact?: string
  natureSummary: string
  impactSummary: string
  /** Citizen self-assessed severity; maps to case priority. */
  severity: 'low' | 'medium' | 'high'
  /** Someone is in immediate danger — escalates the case to critical. */
  immediateDanger: boolean
  evidence: string[]
  attachedFileCount: number
  evidenceFiles: EvidenceFileMeta[]
  reliefSought: string[]
  complainant: { name: string; contact: string; email: string; address: string }
  victimSameAsComplainant: boolean
  victimName?: string
  victimRelationship?: string
}
