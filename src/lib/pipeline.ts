import type { CaseStage, DecisionOutcome } from './types'

/**
 * The case pipeline, taken from the source document's STEP-BY-STEP PROCESS:
 * Incident → Evidence Collection → File Complaint → Investigation →
 * Charges Filed in Court → Decision → Penalties / Victim Remedies.
 *
 * Stage colors are the validated ordinal blue ramp (light→dark = early→late).
 */
export const STAGES: {
  id: CaseStage
  label: string
  short: string
  color: string
  description: string
}[] = [
  {
    id: 'filed',
    label: 'Complaint Filed',
    short: 'Filed',
    color: 'var(--color-stage-1)',
    description: 'Complaint received with evidence and written statement (RPNGC / NICTA).',
  },
  {
    id: 'evidence_review',
    label: 'Evidence Review',
    short: 'Evidence',
    color: 'var(--color-stage-2)',
    description: 'Screenshots, chat logs, emails, timestamps and metadata verified and preserved.',
  },
  {
    id: 'investigation',
    label: 'Under Investigation',
    short: 'Investigation',
    color: 'var(--color-stage-3)',
    description: 'IP addresses traced, accounts verified, suspects identified. Digital forensics as needed.',
  },
  {
    id: 'charges_filed',
    label: 'Charges Filed',
    short: 'Charged',
    color: 'var(--color-stage-4)',
    description: 'Sufficient evidence — charges laid under Section 23 of the Act.',
  },
  {
    id: 'in_court',
    label: 'Court Proceedings',
    short: 'In Court',
    color: 'var(--color-stage-5)',
    description: 'Proceedings before the National Court.',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    short: 'Resolved',
    color: 'var(--color-stage-6)',
    description: 'Decision delivered; penalties and victim remedies applied.',
  },
]

export const STAGE_INDEX: Record<CaseStage, number> = Object.fromEntries(
  STAGES.map((s, i) => [s.id, i]),
) as Record<CaseStage, number>

export const stageOf = (id: CaseStage) => STAGES[STAGE_INDEX[id]]

export const nextStage = (id: CaseStage): CaseStage | null => {
  const i = STAGE_INDEX[id]
  return i < STAGES.length - 1 ? STAGES[i + 1].id : null
}

/** Decision node → penalty, from the document. */
export const DECISIONS: Record<DecisionOutcome, { label: string; penalty: string }> = {
  misdemeanour: { label: 'Misdemeanour', penalty: 'Up to 7 years imprisonment' },
  serious_harm: { label: 'Serious harm', penalty: 'Up to 10 years imprisonment' },
  death_resulting: { label: 'Death resulting', penalty: 'Life imprisonment' },
}

export const SECTION_23 =
  '“A person who uses an electronic system or device to coerce, intimidate, threaten, harass, stalk, or cause emotional distress is guilty of a misdemeanour.” — Section 23, Cybercrime Act 2016'

export const EVIDENCE_TYPES = [
  { id: 'screenshots', label: 'Screenshots of messages/posts' },
  { id: 'chatLogs', label: 'Chat logs or transcripts' },
  { id: 'witnessStatements', label: 'Witness statements' },
  { id: 'otherDocuments', label: 'Other supporting documents' },
] as const

export const OFFICERS = [
  'Sgt. M. Kaupa',
  'Insp. L. Waiko',
  'Const. J. Temu',
  'Sgt. R. Auali',
  'Det. P. Kila',
]
