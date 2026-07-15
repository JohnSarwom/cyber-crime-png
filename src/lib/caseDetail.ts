import type { CaseRecord, CaseStage } from './types'
import { STAGES, STAGE_INDEX } from './pipeline'

export type StageState = 'complete' | 'current' | 'pending'

export interface EvidenceSummaryItem {
  id: 'screenshots' | 'messages' | 'documents' | 'other'
  label: string
  value: number
  color: string
}

export function stageState(stage: CaseStage, index: number): StageState {
  const current = STAGE_INDEX[stage]
  if (index < current) return 'complete'
  if (index === current) return 'current'
  return 'pending'
}

export function stageDate(c: CaseRecord, stage: CaseStage): string | undefined {
  return c.timeline.find((event) => event.stage === stage)?.date
}

/** One entered stage out of six is 17%; In Court is 83%; Resolved is 100%. */
export function caseProgress(stage: CaseStage): number {
  return Math.round(((STAGE_INDEX[stage] + 1) / STAGES.length) * 100)
}

/** Allocate the known attachment total across the checked evidence categories. */
export function evidenceSummary(c: CaseRecord): EvidenceSummaryItem[] {
  const present = {
    screenshots: c.evidence.includes('screenshots'),
    messages: c.evidence.includes('chatLogs'),
    documents: c.evidence.includes('witnessStatements'),
    other: c.evidence.includes('otherDocuments'),
  }
  const keys = (Object.keys(present) as Array<keyof typeof present>).filter((key) => present[key])
  const counts = { screenshots: 0, messages: 0, documents: 0, other: 0 }
  const total = Math.max(0, c.attachedFileCount)

  if (keys.length && total) {
    for (let index = 0; index < total; index += 1) counts[keys[index % keys.length]] += 1
  }

  return [
    { id: 'screenshots', label: 'Screenshots', value: counts.screenshots, color: '#168cf0' },
    { id: 'messages', label: 'Messages', value: counts.messages, color: '#0aa8df' },
    { id: 'documents', label: 'Documents', value: counts.documents, color: '#5668ef' },
    { id: 'other', label: 'Other', value: counts.other, color: '#4ba2c5' },
  ]
}
