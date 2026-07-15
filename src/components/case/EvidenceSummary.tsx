import type { CaseRecord } from '../../lib/types'
import { evidenceSummary } from '../../lib/caseDetail'

export function EvidenceSummary({ caseRecord }: { caseRecord: CaseRecord }) {
  const items = evidenceSummary(caseRecord)
  const total = items.reduce((sum, item) => sum + item.value, 0)
  let offset = 0

  function openEvidence() {
    const target = document.getElementById('case-evidence-detail')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    target?.focus({ preventScroll: true })
  }

  return (
    <section className="case-panel evidence-summary-panel" aria-labelledby="evidence-summary-title">
      <h2 id="evidence-summary-title" className="case-panel__title">Evidence provided</h2>
      <div className="evidence-summary-content">
        <div className="evidence-donut" role="img" aria-label={`${total} evidence files attached`}>
          <svg viewBox="0 0 42 42" aria-hidden="true">
            <circle className="evidence-donut__track" cx="21" cy="21" r="15.9155" />
            {total > 0 && items.map((item) => {
              const value = (item.value / total) * 100
              const circle = <circle key={item.id} cx="21" cy="21" r="15.9155" stroke={item.color} strokeDasharray={`${value} ${100 - value}`} strokeDashoffset={-offset} />
              offset += value
              return circle
            })}
          </svg>
          <span><strong>{total}</strong><small>files</small></span>
        </div>
        <ul className="evidence-legend">
          {items.map((item) => <li key={item.id}><i style={{ background: item.color }} aria-hidden="true" /><span>{item.label}</span><strong>{item.value}</strong></li>)}
        </ul>
      </div>
      <button type="button" className="case-control evidence-view-button" onClick={openEvidence}>View Evidence</button>
    </section>
  )
}
