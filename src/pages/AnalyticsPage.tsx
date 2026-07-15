import { useMemo, useState, type CSSProperties } from 'react'
import { Alert, Analytics, Check, Clock, Download, MapPin, Reports, Search, ShieldLock, Users } from '../components/icons'
import { OFFICERS, STAGES, STAGE_INDEX } from '../lib/pipeline'
import { useCases } from '../lib/store'
import type { Platform, Priority } from '../lib/types'

const DAY = 86_400_000
const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical']
const PRIORITY_LABELS: Record<Priority, string> = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' }

function pct(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

export default function AnalyticsPage() {
  const { cases } = useCases()
  const [period, setPeriod] = useState<'30' | '60' | '90' | 'all'>('90')
  const [platform, setPlatform] = useState<'all' | Platform>('all')

  const newestCaseTime = Math.max(...cases.map((item) => new Date(item.filedAt).getTime()))
  const filtered = useMemo(() => {
    const cutoff = period === 'all' ? -Infinity : newestCaseTime - Number(period) * DAY
    return cases.filter((item) => new Date(item.filedAt).getTime() >= cutoff && (platform === 'all' || item.platform === platform))
  }, [cases, newestCaseTime, period, platform])

  const analysis = useMemo(() => {
    const total = filtered.length
    const spanDays = period === 'all' ? 90 : Number(period)
    const bucketDays = Math.ceil(spanDays / 10)
    const trend = Array.from({ length: 10 }, (_, index) => {
      const start = newestCaseTime - (10 - index) * bucketDays * DAY
      const end = start + bucketDays * DAY
      return {
        label: new Date(start).toLocaleDateString('en-PG', { day: 'numeric', month: 'short' }),
        count: filtered.filter((item) => {
          const filed = new Date(item.filedAt).getTime()
          return filed >= start && filed < end
        }).length,
      }
    })
    const platforms = Array.from(new Set(cases.map((item) => item.platform)))
    const matrix = platforms.map((name) => ({
      name,
      values: PRIORITIES.map((priority) => filtered.filter((item) => item.platform === name && item.priority === priority).length),
    }))
    const provinces = Array.from(new Set(filtered.map((item) => item.province))).map((name) => {
      const records = filtered.filter((item) => item.province === name)
      const highRisk = records.filter((item) => item.priority === 'high' || item.priority === 'critical').length
      const unassigned = records.filter((item) => !item.assignedTo).length
      return { name, count: records.length, highRisk, unassigned, score: records.length + highRisk * 2 + unassigned }
    }).sort((a, b) => b.score - a.score)
    const officers = [...OFFICERS, 'Unassigned'].map((name) => {
      const records = filtered.filter((item) => name === 'Unassigned' ? !item.assignedTo : item.assignedTo === name)
      return {
        name,
        count: records.length,
        active: records.filter((item) => item.stage !== 'resolved').length,
        highRisk: records.filter((item) => item.priority === 'high' || item.priority === 'critical').length,
      }
    }).sort((a, b) => b.active - a.active)
    const investigationLeadTimes = filtered.flatMap((item) => {
      const event = item.timeline.find((entry) => entry.stage === 'investigation')
      return event ? [(new Date(event.date).getTime() - new Date(item.filedAt).getTime()) / DAY] : []
    })
    const resolved = filtered.filter((item) => item.stage === 'resolved')
    const evidenceGap = filtered.filter((item) => item.evidence.length < 2 || item.attachedFileCount === 0).length
    const topPlatform = Array.from(new Set(filtered.map((item) => item.platform))).map((name) => ({ name, count: filtered.filter((item) => item.platform === name).length })).sort((a, b) => b.count - a.count)[0]
    return {
      total,
      trend,
      matrix,
      provinces,
      officers,
      velocity: total / Math.max(spanDays / 7, 1),
      highRisk: filtered.filter((item) => item.priority === 'high' || item.priority === 'critical').length,
      assigned: filtered.filter((item) => item.assignedTo).length,
      evidenceAverage: average(filtered.map((item) => item.evidence.length)),
      evidenceGap,
      attachmentCoverage: filtered.filter((item) => item.attachedFileCount > 0).length,
      resolutionRate: pct(resolved.length, total),
      remedyRate: pct(resolved.filter((item) => item.remedies.contentRemoval || item.remedies.protectionOrder).length, resolved.length),
      investigationLead: average(investigationLeadTimes),
      averageAge: average(filtered.map((item) => (newestCaseTime - new Date(item.filedAt).getTime()) / DAY)),
      funnel: STAGES.map((stage, index) => ({ ...stage, count: filtered.filter((item) => STAGE_INDEX[item.stage] >= index).length })),
      topPlatform,
    }
  }, [cases, filtered, newestCaseTime, period])

  const maxTrend = Math.max(...analysis.trend.map((item) => item.count), 1)
  const maxMatrix = Math.max(...analysis.matrix.flatMap((item) => item.values), 1)
  const maxOfficer = Math.max(...analysis.officers.map((item) => item.active), 1)
  const platformOptions = Array.from(new Set(cases.map((item) => item.platform)))

  function exportAnalytics() {
    const rows = [
      ['Metric', 'Value'],
      ['Cases analysed', analysis.total],
      ['Complaint velocity per week', analysis.velocity.toFixed(1)],
      ['High-risk cases', analysis.highRisk],
      ['Assignment coverage', `${pct(analysis.assigned, analysis.total)}%`],
      ['Average evidence types', analysis.evidenceAverage.toFixed(1)],
      ['Resolution rate', `${analysis.resolutionRate}%`],
      ['Average investigation lead days', analysis.investigationLead.toFixed(1)],
    ]
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rpngc-analytics-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow"><Analytics width={14} height={14} /> Investigative intelligence</span>
          <h1 className="display">Analytics</h1>
          <p>Explore complaint patterns, risk concentration and operational performance.</p>
        </div>
        <button className="analytics-export" type="button" onClick={exportAnalytics}><Download width={17} height={17} /> Export analytics</button>
      </header>

      <section className="analytics-toolbar" aria-label="Analytics filters">
        <div className="analytics-filter"><Search width={15} height={15} /><label htmlFor="analytics-platform">Platform</label><select id="analytics-platform" value={platform} onChange={(event) => setPlatform(event.target.value as 'all' | Platform)}><option value="all">All platforms</option>{platformOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
        <div className="analytics-period" role="group" aria-label="Analysis period">
          {(['30', '60', '90', 'all'] as const).map((value) => <button key={value} type="button" className={period === value ? 'active' : ''} onClick={() => setPeriod(value)}>{value === 'all' ? 'All' : `${value} days`}</button>)}
        </div>
        <span className="analytics-scope"><i /> Live scope: <b>{analysis.total} complaints</b></span>
      </section>

      <section className="analytics-kpis" aria-label="Analytics indicators">
        <article><span className="akpi-icon blue"><Reports width={19} height={19} /></span><div><small>Complaint velocity</small><strong>{analysis.velocity.toFixed(1)}</strong><em>cases per week</em></div></article>
        <article><span className="akpi-icon red"><Alert width={19} height={19} /></span><div><small>High-risk share</small><strong>{pct(analysis.highRisk, analysis.total)}%</strong><em>{analysis.highRisk} priority cases</em></div></article>
        <article><span className="akpi-icon cyan"><Users width={19} height={19} /></span><div><small>Assignment coverage</small><strong>{pct(analysis.assigned, analysis.total)}%</strong><em>{analysis.total - analysis.assigned} unassigned</em></div></article>
        <article><span className="akpi-icon violet"><Check width={19} height={19} /></span><div><small>Evidence density</small><strong>{analysis.evidenceAverage.toFixed(1)}</strong><em>types per complaint</em></div></article>
        <article><span className="akpi-icon green"><ShieldLock width={19} height={19} /></span><div><small>Resolution rate</small><strong>{analysis.resolutionRate}%</strong><em>{analysis.remedyRate}% with remedies</em></div></article>
      </section>

      <section className="analytics-primary-grid">
        <article className="analytics-panel volume-analysis">
          <div className="analytics-panel-head"><div><span>Temporal analysis</span><h2>Complaint volume trend</h2></div><strong>{analysis.velocity.toFixed(1)} / week</strong></div>
          <div className="analytics-volume-chart">
            {analysis.trend.map((item) => <div key={item.label}><b>{item.count}</b><i style={{ height: `${Math.max((item.count / maxTrend) * 100, item.count ? 10 : 2)}%` }} /><small>{item.label}</small></div>)}
          </div>
        </article>

        <article className="analytics-panel risk-matrix">
          <div className="analytics-panel-head"><div><span>Correlation</span><h2>Platform × priority matrix</h2></div></div>
          <div className="matrix-grid">
            <span />{PRIORITIES.map((item) => <b key={item}>{PRIORITY_LABELS[item]}</b>)}
            {analysis.matrix.flatMap((row) => [<strong key={`${row.name}-label`}>{row.name}</strong>, ...row.values.map((value, index) => <i key={`${row.name}-${PRIORITIES[index]}`} style={{ '--heat': value / maxMatrix } as CSSProperties}><em>{value}</em></i>)])}
          </div>
          <div className="matrix-legend"><span>Lower concentration</span><i /><i /><i /><i /><span>Higher</span></div>
        </article>
      </section>

      <section className="analytics-secondary-grid">
        <article className="analytics-panel funnel-analysis">
          <div className="analytics-panel-head"><div><span>Case conversion</span><h2>Pipeline progression</h2></div></div>
          <div className="analytics-funnel">
            {analysis.funnel.map((item) => <div key={item.id}><span>{item.short}</span><i style={{ width: `${Math.max(pct(item.count, analysis.total), 4)}%`, background: item.color }}><b>{item.count}</b></i><small>{pct(item.count, analysis.total)}%</small></div>)}
          </div>
        </article>

        <article className="analytics-panel efficiency-analysis">
          <div className="analytics-panel-head"><div><span>Operational efficiency</span><h2>Process health</h2></div></div>
          <div className="efficiency-grid">
            <div><Clock width={17} height={17} /><span>Investigation lead</span><strong>{analysis.investigationLead.toFixed(1)} days</strong><small>Filing to investigation</small></div>
            <div><Clock width={17} height={17} /><span>Average case age</span><strong>{analysis.averageAge.toFixed(0)} days</strong><small>Current selected cohort</small></div>
            <div><Check width={17} height={17} /><span>Attachment coverage</span><strong>{pct(analysis.attachmentCoverage, analysis.total)}%</strong><small>At least one file</small></div>
            <div><Alert width={17} height={17} /><span>Evidence gaps</span><strong>{analysis.evidenceGap}</strong><small>Needs follow-up</small></div>
          </div>
        </article>

        <article className="analytics-panel insight-analysis">
          <div className="analytics-panel-head"><div><span>Decision support</span><h2>Key insights</h2></div></div>
          <div className="insight-list">
            <p><i className="cyan" /><span><b>{analysis.topPlatform?.name ?? 'No platform'} leads complaint volume</b>{analysis.topPlatform ? `${analysis.topPlatform.count} matters (${pct(analysis.topPlatform.count, analysis.total)}% of scope).` : 'No cases in the current scope.'}</span></p>
            <p><i className="orange" /><span><b>{analysis.provinces[0]?.name ?? 'No province'} is the highest attention area</b>{analysis.provinces[0] ? `${analysis.provinces[0].highRisk} high-risk and ${analysis.provinces[0].unassigned} unassigned matters.` : 'No geographic data in scope.'}</span></p>
            <p><i className="red" /><span><b>{analysis.evidenceGap} cases have evidence gaps</b>Prioritise missing attachments or complaints with fewer than two evidence types.</span></p>
          </div>
        </article>
      </section>

      <section className="analytics-bottom-grid">
        <article className="analytics-panel hotspot-analysis">
          <div className="analytics-panel-head"><div><span>Geographic risk</span><h2>Provincial hotspots</h2></div><MapPin width={18} height={18} /></div>
          <div className="hotspot-table"><div className="hotspot-head"><span>Province</span><span>Cases</span><span>High risk</span><span>Unassigned</span><span>Attention</span></div>{analysis.provinces.slice(0, 6).map((item) => <div key={item.name}><strong>{item.name}</strong><span>{item.count}</span><span>{item.highRisk}</span><span>{item.unassigned}</span><i><em style={{ width: `${pct(item.score, analysis.provinces[0]?.score ?? 1)}%` }} /></i></div>)}</div>
        </article>

        <article className="analytics-panel workload-analysis">
          <div className="analytics-panel-head"><div><span>Resource allocation</span><h2>Officer workload</h2></div><Users width={18} height={18} /></div>
          <div className="workload-list">{analysis.officers.map((item) => <div key={item.name}><span>{item.name}<small>{item.highRisk} high risk</small></span><i><em style={{ width: `${pct(item.active, maxOfficer)}%` }} /></i><strong>{item.active}</strong></div>)}</div>
        </article>
      </section>
    </div>
  )
}
