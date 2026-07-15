import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Bell, Check, Chevron, Clock, Folder, Search, ShieldLock, User } from '../components/icons'
import { PriorityBadge, StageBadge } from '../components/badges'
import { fmtDateTime } from '../lib/format'
import { useCases } from '../lib/store'

const DAY = 86_400_000
type Severity = 'critical' | 'high' | 'medium' | 'info'
type AlertCategory = 'Risk' | 'Assignment' | 'Evidence' | 'Ageing' | 'Intake'

interface OperationalAlert {
  id: string
  caseId: string
  ref: string
  severity: Severity
  category: AlertCategory
  title: string
  message: string
  timestamp: string
}

const severityRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, info: 1 }

export default function AlertsPage() {
  const { cases } = useCases()
  const [severity, setSeverity] = useState<'all' | Severity>('all')
  const [status, setStatus] = useState<'active' | 'acknowledged' | 'all'>('active')
  const [query, setQuery] = useState('')
  const [acknowledged, setAcknowledged] = useState<Set<string>>(() => new Set())
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const newestCaseTime = Math.max(...cases.map((item) => new Date(item.filedAt).getTime()))
  const alerts = useMemo(() => {
    const items: OperationalAlert[] = []
    for (const item of cases) {
      const age = (newestCaseTime - new Date(item.filedAt).getTime()) / DAY
      if (item.priority === 'critical') {
        items.push({ id: `${item.id}-critical`, caseId: item.id, ref: item.ref, severity: 'critical', category: 'Risk', title: 'Critical-risk complaint requires review', message: `${item.natureSummary}. Immediate supervisory review and victim-safety assessment recommended.`, timestamp: item.filedAt })
      }
      if ((item.priority === 'critical' || item.priority === 'high') && !item.assignedTo) {
        items.push({ id: `${item.id}-unassigned`, caseId: item.id, ref: item.ref, severity: 'high', category: 'Assignment', title: 'Priority case has no assigned officer', message: 'This high-priority matter is currently unassigned and may breach operational response expectations.', timestamp: item.filedAt })
      }
      if (item.evidence.length < 2 || item.attachedFileCount === 0) {
        items.push({ id: `${item.id}-evidence`, caseId: item.id, ref: item.ref, severity: item.priority === 'critical' ? 'high' : 'medium', category: 'Evidence', title: 'Evidence package is incomplete', message: `${item.evidence.length} evidence type${item.evidence.length === 1 ? '' : 's'} recorded and ${item.attachedFileCount} attached file${item.attachedFileCount === 1 ? '' : 's'}. Follow-up is required.`, timestamp: item.filedAt })
      }
      if (age >= 45 && item.stage !== 'resolved') {
        items.push({ id: `${item.id}-ageing`, caseId: item.id, ref: item.ref, severity: age >= 70 ? 'high' : 'medium', category: 'Ageing', title: 'Open case is ageing', message: `This case has remained open for ${Math.floor(age)} days and is currently at ${item.stage.replace('_', ' ')} stage.`, timestamp: item.filedAt })
      }
      if (age <= 7) {
        items.push({ id: `${item.id}-new`, caseId: item.id, ref: item.ref, severity: 'info', category: 'Intake', title: 'New complaint received', message: `A new ${item.platform} complaint was filed from ${item.province}.`, timestamp: item.filedAt })
      }
    }
    return items.sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.timestamp.localeCompare(a.timestamp))
  }, [cases, newestCaseTime])

  const available = alerts.filter((item) => !dismissed.has(item.id))
  const filtered = available.filter((item) => {
    if (severity !== 'all' && item.severity !== severity) return false
    if (status === 'active' && acknowledged.has(item.id)) return false
    if (status === 'acknowledged' && !acknowledged.has(item.id)) return false
    const needle = query.trim().toLowerCase()
    return !needle || `${item.ref} ${item.title} ${item.message} ${item.category}`.toLowerCase().includes(needle)
  })
  const selected = available.find((item) => item.id === selectedId) ?? filtered[0] ?? available[0]
  const selectedCase = cases.find((item) => item.id === selected?.caseId)
  const activeCount = available.filter((item) => !acknowledged.has(item.id)).length
  const criticalCount = available.filter((item) => item.severity === 'critical' && !acknowledged.has(item.id)).length
  const highCount = available.filter((item) => item.severity === 'high' && !acknowledged.has(item.id)).length
  const evidenceCount = available.filter((item) => item.category === 'Evidence' && !acknowledged.has(item.id)).length

  function toggleAcknowledged(id: string) {
    setAcknowledged((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function acknowledgeVisible() {
    setAcknowledged((current) => new Set([...current, ...filtered.map((item) => item.id)]))
  }

  function dismissSelected() {
    if (!selected) return
    setDismissed((current) => new Set([...current, selected.id]))
    setSelectedId(null)
  }

  return (
    <div className="alerts-page">
      <header className="alerts-header">
        <div>
          <span className="alerts-eyebrow"><Bell width={14} height={14} /> Operational monitoring</span>
          <h1 className="display">Alerts & Notifications</h1>
          <p>Prioritised case signals requiring review, assignment or evidence follow-up.</p>
        </div>
        <button className="alerts-review-all" type="button" onClick={acknowledgeVisible} disabled={filtered.length === 0}><Check width={16} height={16} /> Mark visible as reviewed</button>
      </header>

      <section className="alerts-kpis" aria-label="Alert totals">
        <article className="alert-kpi critical"><span><Alert width={19} height={19} /></span><div><small>Critical</small><strong>{criticalCount}</strong><em>Immediate review</em></div></article>
        <article className="alert-kpi high"><span><ShieldLock width={19} height={19} /></span><div><small>High priority</small><strong>{highCount}</strong><em>Action required</em></div></article>
        <article className="alert-kpi evidence"><span><Folder width={19} height={19} /></span><div><small>Evidence gaps</small><strong>{evidenceCount}</strong><em>Follow-up needed</em></div></article>
        <article className="alert-kpi active"><span><Bell width={19} height={19} /></span><div><small>Active alerts</small><strong>{activeCount}</strong><em>{acknowledged.size} reviewed</em></div></article>
      </section>

      <section className="alerts-toolbar" aria-label="Alert filters">
        <div className="alerts-search"><Search width={15} height={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search alert or case reference..." aria-label="Search alerts" /></div>
        <select value={severity} onChange={(event) => setSeverity(event.target.value as 'all' | Severity)} aria-label="Filter by severity"><option value="all">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="info">Information</option></select>
        <div className="alert-status-tabs" role="group" aria-label="Alert status">{(['active', 'acknowledged', 'all'] as const).map((item) => <button key={item} type="button" className={status === item ? 'active' : ''} onClick={() => setStatus(item)}>{item === 'acknowledged' ? 'Reviewed' : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
        <span className="alerts-result-count">{filtered.length} shown</span>
      </section>

      <section className="alerts-workspace">
        <div className="alerts-feed" aria-label="Alert list">
          <div className="alerts-feed-head"><div><span>Live queue</span><h2>Priority notifications</h2></div><b>{activeCount} active</b></div>
          <div className="alerts-feed-list">
            {filtered.length ? filtered.map((item) => (
              <button key={item.id} type="button" className={`alert-feed-item ${item.severity} ${selected?.id === item.id ? 'selected' : ''} ${acknowledged.has(item.id) ? 'reviewed' : ''}`} onClick={() => setSelectedId(item.id)}>
                <i className="alert-severity-dot" />
                <span className="alert-feed-copy"><small>{item.category} · {item.severity}</small><strong>{item.title}</strong><em>{item.ref} · {fmtDateTime(item.timestamp)}</em></span>
                {!acknowledged.has(item.id) && <span className="alert-unread-dot" aria-label="Not reviewed" />}
                <Chevron width={14} height={14} />
              </button>
            )) : <div className="alerts-empty"><Check width={24} height={24} /><strong>No alerts match this view</strong><span>Try changing the status, severity or search filter.</span></div>}
          </div>
        </div>

        <aside className="alert-detail" aria-label="Selected alert details">
          {selected && selectedCase ? <>
            <div className={`alert-detail-banner ${selected.severity}`}><span><Alert width={18} height={18} /></span><div><small>{selected.category} alert</small><strong>{selected.title}</strong></div><b>{selected.severity}</b></div>
            <p className="alert-detail-message">{selected.message}</p>
            <div className="alert-detail-meta">
              <div><Folder width={15} height={15} /><span>Case reference</span><strong>{selected.ref}</strong></div>
              <div><Clock width={15} height={15} /><span>Alert timestamp</span><strong>{fmtDateTime(selected.timestamp)}</strong></div>
              <div><User width={15} height={15} /><span>Assigned officer</span><strong>{selectedCase.assignedTo ?? 'Unassigned'}</strong></div>
            </div>
            <div className="alert-case-state"><StageBadge stage={selectedCase.stage} /><PriorityBadge priority={selectedCase.priority} /></div>
            <div className="alert-context"><span>Incident context</span><p>{selectedCase.natureSummary}</p><small>{selectedCase.platform} · {selectedCase.province}</small></div>
            <div className="alert-detail-actions">
              <button type="button" className="alert-acknowledge" onClick={() => toggleAcknowledged(selected.id)}><Check width={15} height={15} />{acknowledged.has(selected.id) ? 'Return to active' : 'Acknowledge alert'}</button>
              <Link to={`/cases/${selected.caseId}`} className="alert-view-case">View case <Chevron width={14} height={14} /></Link>
              <button type="button" className="alert-dismiss" onClick={dismissSelected}>Dismiss</button>
            </div>
          </> : <div className="alerts-empty"><Bell width={24} height={24} /><strong>No alert selected</strong></div>}
        </aside>
      </section>
    </div>
  )
}
