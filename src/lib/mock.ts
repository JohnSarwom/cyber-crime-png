import type { CaseRecord, CaseStage, DecisionOutcome, Platform, Priority } from './types'
import { OFFICERS, STAGES, STAGE_INDEX } from './pipeline'

/**
 * Deterministic mock dataset (seeded PRNG) standing in for the future
 * submissions API. Same seed → same cases on every load.
 */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260714)

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)]
const pickWeighted = <T,>(entries: readonly [T, number][]) => {
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = rnd() * total
  for (const [value, w] of entries) {
    roll -= w
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

const FIRST = ['John', 'Mary', 'Peter', 'Grace', 'Michael', 'Ruth', 'David', 'Sarah', 'Joseph', 'Anna', 'Paul', 'Esther', 'James', 'Naomi', 'Thomas', 'Lydia']
const LAST = ['Kila', 'Temu', 'Kaupa', 'Waiko', 'Namaliu', 'Auali', 'Siaguru', 'Momis', 'Wingti', 'Natera', 'Parkop', 'Kapris', 'Gima', 'Toua']

const PROVINCES: readonly [string, number][] = [
  ['National Capital District', 30],
  ['Morobe', 16],
  ['East New Britain', 10],
  ['Western Highlands', 9],
  ['Eastern Highlands', 8],
  ['Madang', 7],
  ['Enga', 6],
  ['Milne Bay', 5],
  ['Simbu', 5],
  ['Western', 4],
]

const PLATFORMS: readonly [Platform, number][] = [
  ['Facebook', 44],
  ['WhatsApp', 22],
  ['TikTok', 14],
  ['Instagram', 11],
  ['Other', 9],
]

const PRIORITIES: readonly [Priority, number][] = [
  ['low', 18],
  ['medium', 42],
  ['high', 28],
  ['critical', 12],
]

const NATURES = [
  'Repeated threatening messages sent over several days',
  'Abusive posts targeting the victim on a public page',
  'Intimidating voice notes and messages from anonymous accounts',
  'Harassing comments and doctored images shared in groups',
  'Persistent stalking behaviour across multiple accounts',
  'Threats of violence following a financial dispute',
  'Defamatory posts intended to damage the victim’s reputation',
  'Coercive messages demanding money to stop publication',
]

const IMPACTS = [
  'Severe emotional distress and anxiety',
  'Reputational harm within the victim’s community',
  'Fear for personal safety; victim relocated temporarily',
  'Distress affecting the victim’s work and family life',
  'Ongoing intimidation and loss of sleep',
]

const EVIDENCE_IDS = ['screenshots', 'chatLogs', 'witnessStatements', 'otherDocuments']

/** Stage mix: recent cases skew early-stage, older cases skew late-stage. */
function stageFor(ageDays: number): CaseStage {
  if (ageDays < 10) return pickWeighted([['filed', 50], ['evidence_review', 30], ['investigation', 20]])
  if (ageDays < 30)
    return pickWeighted([
      ['filed', 10],
      ['evidence_review', 22],
      ['investigation', 40],
      ['charges_filed', 18],
      ['in_court', 10],
    ])
  return pickWeighted([
    ['evidence_review', 6],
    ['investigation', 22],
    ['charges_filed', 20],
    ['in_court', 24],
    ['resolved', 28],
  ])
}

const DAY = 86_400_000

export function generateCases(now = new Date()): CaseRecord[] {
  const cases: CaseRecord[] = []
  const N = 52

  for (let i = 0; i < N; i++) {
    // Age skews recent (quadratic) across a 90-day window.
    const ageDays = Math.floor(Math.pow(rnd(), 1.4) * 90)
    const filed = new Date(now.getTime() - ageDays * DAY - Math.floor(rnd() * DAY))
    const stage = stageFor(ageDays)
    const stageIdx = STAGE_INDEX[stage]

    // Timeline: one event per completed stage, dates spread between filing and now.
    const span = now.getTime() - filed.getTime()
    const timeline = STAGES.slice(0, stageIdx + 1).map((s, k) => ({
      stage: s.id,
      date: new Date(filed.getTime() + (span * k) / (stageIdx + 1)).toISOString(),
      officer: k > 0 ? pick(OFFICERS) : undefined,
    }))

    const name = `${pick(FIRST)} ${pick(LAST)}`
    const sameVictim = rnd() < 0.72
    const decision: DecisionOutcome | undefined =
      stageIdx >= STAGE_INDEX.in_court
        ? pickWeighted<DecisionOutcome>([
            ['misdemeanour', 70],
            ['serious_harm', 26],
            ['death_resulting', 4],
          ])
        : undefined

    const evidence = EVIDENCE_IDS.filter(() => rnd() < 0.6)
    if (evidence.length === 0) evidence.push('screenshots')

    cases.push({
      id: `c${i + 1}`,
      ref: `RPNGC-2026-${String(140 + i).padStart(6, '0')}`,
      filedAt: filed.toISOString(),
      stage,
      priority: pickWeighted(PRIORITIES),
      platform: pickWeighted(PLATFORMS),
      province: pickWeighted(PROVINCES),
      complainant: {
        name,
        contact: `+675 7${Math.floor(rnd() * 900 + 100)} ${Math.floor(rnd() * 9000 + 1000)}`,
        email: `${name.toLowerCase().replace(' ', '.')}@example.pg`,
      },
      victimSameAsComplainant: sameVictim,
      victimName: sameVictim ? undefined : `${pick(FIRST)} ${pick(LAST)}`,
      offenderAlias: rnd() < 0.7 ? `@${pick(['pngwarrior', 'anon_kila', 'mosbi_boy', 'islander', 'hagen_talk', 'lae_city'])}${Math.floor(rnd() * 90 + 10)}` : undefined,
      natureSummary: pick(NATURES),
      impactSummary: pick(IMPACTS),
      evidence,
      attachedFileCount: Math.floor(rnd() * 6),
      assignedTo: stageIdx >= 1 || rnd() < 0.4 ? pick(OFFICERS) : undefined,
      decision,
      remedies: {
        contentRemoval: stage === 'resolved' && rnd() < 0.7,
        protectionOrder: stage === 'resolved' && rnd() < 0.45,
      },
      timeline,
      notes:
        stageIdx >= 2
          ? [
              {
                date: timeline[Math.min(2, timeline.length - 1)].date,
                officer: pick(OFFICERS),
                text: 'Preliminary review complete; suspect account flagged with platform operator.',
              },
            ]
          : [],
    })
  }

  // Newest first
  return cases.sort((a, b) => b.filedAt.localeCompare(a.filedAt))
}
