import type { CaseRecord } from '../../lib/types'
import { stageOf } from '../../lib/pipeline'

const hearingFmt = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
})

function CourtIllustration() {
  return (
    <svg className="court-illustration" viewBox="0 0 180 120" role="img" aria-label="Court building">
      <defs>
        <linearGradient id="court-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8bc9f4" />
          <stop offset=".48" stopColor="#4f83b7" />
          <stop offset="1" stopColor="#1b4d82" />
        </linearGradient>
        <filter id="court-glow" x="-30%" y="-30%" width="160%" height="170%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g fill="url(#court-stone)" stroke="#86c5ef" strokeWidth="1" filter="url(#court-glow)">
        <path d="M28 39 90 8l62 31H28Z" />
        <path d="m90 18 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z" fill="#315f91" />
        <rect x="22" y="39" width="136" height="8" rx="2" />
        {[36, 62, 88, 114, 140].map((x) => <path key={x} d={`M${x} 49h12l-2 7v40l4 6H${x - 2}l4-6V56l-2-7Z`} />)}
        <rect x="20" y="101" width="140" height="7" rx="2" />
        <rect x="13" y="110" width="154" height="6" rx="2" />
      </g>
    </svg>
  )
}

export function CourtProgress({ caseRecord, decisionRequired }: { caseRecord: CaseRecord; decisionRequired: boolean }) {
  const court = caseRecord.court
  const hearing = court?.nextHearingAt ? hearingFmt.format(new Date(court.nextHearingAt)).replace(',', ' -') : 'TBA'
  const rows = [
    ['Court', court?.court ?? (caseRecord.stage === 'in_court' || caseRecord.stage === 'resolved' ? 'National Court' : 'TBA')],
    ['Next Hearing', hearing],
    ['Presiding Officer', court?.presidingOfficer ?? 'TBA'],
    ['Hearing Type', court?.hearingType ?? 'TBA'],
  ]

  return (
    <section className="case-panel court-progress-panel" aria-labelledby="court-progress-title">
      <h2 id="court-progress-title" className="case-panel__title">Court progress</h2>
      <CourtIllustration />
      <dl className="court-facts">
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        <div className="court-status-row">
          <dt>Status</dt>
          <dd><span className="court-status-pill"><i aria-hidden="true" />{stageOf(caseRecord.stage).short}</span></dd>
        </div>
      </dl>
      {decisionRequired && <a className="court-decision-prompt" href="#case-decision">Court decision required before resolution</a>}
    </section>
  )
}
