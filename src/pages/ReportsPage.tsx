import { useMemo, useState } from 'react'
import { Alert, Calendar, Check, Doc, Download, Gavel, Reports, Scales, ShieldLock } from '../components/icons'
import { useCases } from '../lib/store'
import { EVIDENCE_TYPES, STAGES, stageOf } from '../lib/pipeline'
import type { CaseRecord } from '../lib/types'

const DAY = 86_400_000
const PERIODS = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'all', label: 'All records' },
  { value: 'custom', label: 'Custom date range' },
] as const

const REPORT_TYPES = [
  { value: 'operational', label: 'Operational summary', detail: 'Complaint intake, workload and case progression' },
  { value: 'evidence', label: 'Evidence readiness', detail: 'Evidence coverage and investigation readiness' },
  { value: 'prosecution', label: 'Prosecution status', detail: 'Charges, court proceedings and legal outcomes' },
  { value: 'remedies', label: 'Victim remedies', detail: 'Content removal and protection-order outcomes' },
] as const

type Period = (typeof PERIODS)[number]['value']
type ReportType = (typeof REPORT_TYPES)[number]['value']

function percentage(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0
}

function csvCell(value: string | number | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function reportRows(cases: CaseRecord[]) {
  return cases.map((c) => [
    c.ref,
    c.filedAt.slice(0, 10),
    c.complainant.name,
    c.platform,
    c.province,
    c.priority,
    stageOf(c.stage).label,
    c.evidence.length,
    c.attachedFileCount,
    c.assignedTo ?? 'Unassigned',
    c.decision ?? '',
    c.remedies.contentRemoval ? 'Yes' : 'No',
    c.remedies.protectionOrder ? 'Yes' : 'No',
  ])
}

export default function ReportsPage() {
  const { cases } = useCases()
  const [period, setPeriod] = useState<Period>('90')
  const [reportType, setReportType] = useState<ReportType>('operational')
  const newestCaseDate = Math.max(...cases.map((c) => new Date(c.filedAt).getTime()))
  const [customStart, setCustomStart] = useState(() => new Date(newestCaseDate - 29 * DAY).toISOString().slice(0, 10))
  const [customEnd, setCustomEnd] = useState(() => new Date(newestCaseDate).toISOString().slice(0, 10))

  const dateBounds = useMemo(() => {
    const newest = Math.max(...cases.map((c) => new Date(c.filedAt).getTime()))
    const oldest = Math.min(...cases.map((c) => new Date(c.filedAt).getTime()))
    if (period === 'custom') {
      const start = new Date(`${customStart}T00:00:00`).getTime()
      const end = new Date(`${customEnd}T23:59:59.999`).getTime()
      return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : { start: newest, end: newest + DAY - 1 }
    }
    if (period === 'all') return { start: oldest, end: newest + DAY - 1 }
    return { start: newest - (Number(period) - 1) * DAY, end: newest + DAY - 1 }
  }, [cases, period, customStart, customEnd])

  const dateError = period === 'custom' && (!customStart || !customEnd)
    ? 'Select both a start and end date.'
    : period === 'custom' && dateBounds.start > dateBounds.end ? 'Start date must be before the end date.' : ''

  const filtered = useMemo(() => {
    if (dateError) return []
    return cases.filter((c) => {
      const filed = new Date(c.filedAt).getTime()
      return filed >= dateBounds.start && filed <= dateBounds.end
    })
  }, [cases, dateBounds, dateError])

  const stats = useMemo(() => {
    const total = filtered.length
    const stageCounts = Object.fromEntries(STAGES.map((s) => [s.id, filtered.filter((c) => c.stage === s.id).length])) as Record<string, number>
    const evidenceCounts = EVIDENCE_TYPES.map((item) => ({
      ...item,
      count: filtered.filter((c) => c.evidence.includes(item.id)).length,
    }))
    const platforms = Array.from(new Set(filtered.map((c) => c.platform)))
      .map((name) => ({ name, count: filtered.filter((c) => c.platform === name).length }))
      .sort((a, b) => b.count - a.count)
    const provinces = Array.from(new Set(filtered.map((c) => c.province)))
      .map((name) => ({ name, count: filtered.filter((c) => c.province === name).length }))
      .sort((a, b) => b.count - a.count)
    const spanDays = Math.max(1, Math.ceil((dateBounds.end - dateBounds.start) / DAY))
    const bucketCount = Math.min(8, spanDays)
    const bucketDays = Math.max(1, Math.ceil(spanDays / bucketCount))
    const trend = Array.from({ length: bucketCount }, (_, index) => {
      const start = dateBounds.start + index * bucketDays * DAY
      const end = Math.min(start + bucketDays * DAY, dateBounds.end + 1)
      return {
        label: new Date(start).toLocaleDateString('en-PG', { day: 'numeric', month: 'short' }),
        count: filtered.filter((c) => {
          const filed = new Date(c.filedAt).getTime()
          return filed >= start && filed < end
        }).length,
      }
    })
    return {
      total,
      stageCounts,
      evidenceCounts,
      platforms,
      provinces,
      trend,
      active: stageCounts.evidence_review + stageCounts.investigation,
      prosecution: stageCounts.charges_filed + stageCounts.in_court,
      resolved: stageCounts.resolved,
      evidenceReady: filtered.filter((c) => c.evidence.length >= 3 && c.attachedFileCount > 0).length,
      highRisk: filtered.filter((c) => c.priority === 'high' || c.priority === 'critical').length,
      unassigned: filtered.filter((c) => !c.assignedTo).length,
      contentRemoval: filtered.filter((c) => c.remedies.contentRemoval).length,
      protectionOrders: filtered.filter((c) => c.remedies.protectionOrder).length,
      misdemeanour: filtered.filter((c) => c.decision === 'misdemeanour').length,
      seriousHarm: filtered.filter((c) => c.decision === 'serious_harm').length,
      lifeOutcome: filtered.filter((c) => c.decision === 'death_resulting').length,
    }
  }, [filtered, dateBounds])

  const selectedReport = REPORT_TYPES.find((item) => item.value === reportType) ?? REPORT_TYPES[0]
  const maxTrend = Math.max(...stats.trend.map((item) => item.count), 1)

  function downloadReport() {
    const headers = ['Reference', 'Filed', 'Complainant', 'Platform', 'Province', 'Priority', 'Stage', 'Evidence types', 'Attachments', 'Officer', 'Decision', 'Content removed', 'Protection order']
    const csv = [headers, ...reportRows(filtered)].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rpngc-${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <span className="reports-eyebrow"><ShieldLock width={14} height={14} /> Restricted operational reporting</span>
          <h1 className="display">Reports</h1>
          <p>Section 23 cyber harassment intelligence, evidence readiness and case outcomes.</p>
        </div>
        <div className="reports-actions">
          <button className="report-secondary" type="button" onClick={() => window.print()}><Doc width={17} height={17} /> Print view</button>
          <button className="report-primary" type="button" onClick={downloadReport} disabled={Boolean(dateError)}><Download width={17} height={17} /> Export report</button>
        </div>
      </header>

      <section className="report-toolbar" aria-label="Report controls">
        <div className="report-control">
          <label htmlFor="report-type">Report type</label>
          <select id="report-type" value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>
            {REPORT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="report-control report-control--period">
          <label htmlFor="report-period">Reporting period</label>
          <span className="report-control-icon"><Calendar width={16} height={16} /></span>
          <select id="report-period" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
            {PERIODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        {period === 'custom' && <div className="report-custom-range" aria-label="Custom reporting dates">
          <label><span>From</span><input type="date" required value={customStart} max={customEnd} onChange={(event) => setCustomStart(event.target.value)} /></label>
          <span className="report-date-separator">to</span>
          <label><span>To</span><input type="date" required value={customEnd} min={customStart} onChange={(event) => setCustomEnd(event.target.value)} /></label>
          {dateError && <small role="alert">{dateError}</small>}
        </div>}
        <div className="report-context">
          <span>Current view</span>
          <strong>{selectedReport.label}</strong>
          <small>{selectedReport.detail}</small>
        </div>
      </section>

      <section className="report-kpis" aria-label="Key report indicators">
        <article className="report-kpi report-kpi--blue"><span><Reports width={20} height={20} /></span><div><small>Complaints filed</small><strong>{stats.total}</strong><em>In selected period</em></div></article>
        <article className="report-kpi report-kpi--cyan"><span><Check width={20} height={20} /></span><div><small>Evidence ready</small><strong>{percentage(stats.evidenceReady, stats.total)}%</strong><em>{stats.evidenceReady} cases ready</em></div></article>
        <article className="report-kpi report-kpi--violet"><span><Gavel width={20} height={20} /></span><div><small>Active workload</small><strong>{stats.active}</strong><em>Review or investigation</em></div></article>
        <article className="report-kpi report-kpi--orange"><span><Scales width={20} height={20} /></span><div><small>Prosecution</small><strong>{stats.prosecution}</strong><em>Charged or in court</em></div></article>
        <article className="report-kpi report-kpi--red"><span><Alert width={20} height={20} /></span><div><small>High-risk matters</small><strong>{stats.highRisk}</strong><em>{stats.unassigned} unassigned cases</em></div></article>
      </section>

      <section className="reports-main-grid">
        <article className="report-panel filing-trend">
          <div className="report-panel-head"><div><span>Complaint intake</span><h2>Filing activity</h2></div><strong>{stats.total} total</strong></div>
          <div className="report-bars" aria-label="Complaints filed over time">
            {stats.trend.map((item) => (
              <div className="report-bar-column" key={item.label}>
                <span>{item.count}</span>
                <i style={{ height: `${Math.max((item.count / maxTrend) * 100, item.count ? 12 : 2)}%` }} />
                <small>{item.label}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="report-panel pipeline-report">
          <div className="report-panel-head"><div><span>Case lifecycle</span><h2>Pipeline distribution</h2></div></div>
          <div className="report-progress-list">
            {STAGES.map((stage) => {
              const count = stats.stageCounts[stage.id]
              return <div className="report-progress-row" key={stage.id}><span><i style={{ background: stage.color }} />{stage.label}</span><b>{count}</b><div><i style={{ width: `${percentage(count, stats.total)}%`, background: stage.color }} /></div><small>{percentage(count, stats.total)}%</small></div>
            })}
          </div>
        </article>
      </section>

      <section className="reports-detail-grid">
        <article className="report-panel">
          <div className="report-panel-head"><div><span>Evidence collection</span><h2>Evidence coverage</h2></div><strong>{percentage(stats.evidenceReady, stats.total)}% ready</strong></div>
          <div className="evidence-report-list">
            {stats.evidenceCounts.map((item) => <div key={item.id}><span><Check width={14} height={14} />{item.label}</span><div><i style={{ width: `${percentage(item.count, stats.total)}%` }} /></div><b>{item.count}</b><small>{percentage(item.count, stats.total)}%</small></div>)}
          </div>
        </article>

        <article className="report-panel">
          <div className="report-panel-head"><div><span>Incident channel</span><h2>Platform distribution</h2></div></div>
          <div className="platform-report-list">
            {stats.platforms.slice(0, 5).map((item, index) => <div key={item.name}><b>{index + 1}</b><span>{item.name}<i><em style={{ width: `${percentage(item.count, stats.total)}%` }} /></i></span><strong>{item.count}</strong><small>{percentage(item.count, stats.total)}%</small></div>)}
          </div>
        </article>

        <article className="report-panel legal-report">
          <div className="report-panel-head"><div><span>Section 23 outcomes</span><h2>Decisions & remedies</h2></div></div>
          <div className="legal-summary">
            <div><span>Misdemeanour</span><strong>{stats.misdemeanour}</strong><small>Up to 7 years</small></div>
            <div><span>Serious harm</span><strong>{stats.seriousHarm}</strong><small>Up to 10 years</small></div>
            <div><span>Death resulting</span><strong>{stats.lifeOutcome}</strong><small>Life imprisonment</small></div>
          </div>
          <div className="remedy-summary"><span><Check width={15} height={15} /> Harmful content removed <b>{stats.contentRemoval}</b></span><span><ShieldLock width={15} height={15} /> Protection orders <b>{stats.protectionOrders}</b></span></div>
        </article>
      </section>

      <section className="report-panel report-register">
        <div className="report-panel-head"><div><span>Geographic intelligence</span><h2>Highest-volume provinces</h2></div><small>Live from {stats.total} complaints</small></div>
        <div className="province-grid">
          {stats.provinces.slice(0, 5).map((item, index) => <div key={item.name}><b>{String(index + 1).padStart(2, '0')}</b><span>{item.name}</span><i><em style={{ width: `${percentage(item.count, stats.provinces[0]?.count ?? 1)}%` }} /></i><strong>{item.count}</strong><small>{percentage(item.count, stats.total)}%</small></div>)}
        </div>
      </section>
    </div>
  )
}
