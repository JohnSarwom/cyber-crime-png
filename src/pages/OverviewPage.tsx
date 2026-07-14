import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '../lib/store'
import {
  Alert, Bell, Calendar, Check, Clock, Doc, Download, Gavel, MapPin, Plus, Search,
  ShieldLock, User,
} from '../components/icons'

const ranges = [
  { id: '7', label: 'Last 7 days', ratio: .22 },
  { id: '30', label: 'Last 30 days', ratio: .58 },
  { id: '90', label: 'Last 90 days', ratio: 1 },
  { id: 'all', label: 'All', ratio: 1.18 },
] as const

const baseTrend = [4, 6, 8, 7, 1, 3, 2, 2, 4, 7, 3, 9, 3, 6]

function Spark({ color, points }: { color: string; points: number[] }) {
  const width = 74
  const height = 31
  const max = Math.max(...points)
  const min = Math.min(...points)
  const d = points.map((n, i) => {
    const x = (i / (points.length - 1)) * (width - 7) + 2
    const y = height - 4 - ((n - min) / (max - min || 1)) * 22
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
  return <svg viewBox={`0 0 ${width} ${height}`} className="spark" aria-hidden><path d={d} stroke={color} /><circle cx={width - 5} cy={height - 4 - ((points[points.length - 1] - min) / (max - min || 1)) * 22} r="3" fill={color} /></svg>
}

function MetricCard({ label, value, color, icon, points }: { label: string; value: number; color: string; icon: ReactNode; points: number[] }) {
  return (
    <article className="metric-card">
      <span className="metric-icon" style={{ color, background: `${color}26` }}>{icon}</span>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>— vs prior 90d</small></div>
      <Spark color={color} points={points} />
    </article>
  )
}

function TrendChart({ ratio }: { ratio: number }) {
  const values = baseTrend.map(n => Math.max(0, Math.round(n * ratio)))
  const W = 720, H = 178, L = 36, R = 18, T = 12, B = 28
  const max = 10
  const x = (i: number) => L + i * ((W - L - R) / (values.length - 1))
  const y = (v: number) => T + (max - v) * ((H - T - B) / max)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ')
  const area = `${line} L${x(values.length - 1)} ${H - B} L${L} ${H - B} Z`
  const labels = ['Apr 20', 'Apr 30', 'May 10', 'May 20', 'May 30', 'Jun 9', 'Jun 19', 'Jun 29', 'Jul 9', 'Jul 19']
  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Complaints filed over time">
        {[0, 2, 4, 6, 8, 10].map(v => <g key={v}><line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="grid-line" /><text x={L - 12} y={y(v) + 4} className="axis-label">{v}</text></g>)}
        <path d={area} className="trend-area" /><path d={line} className="trend-line" />
        {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 2.4} className="trend-dot" />)}
        {labels.map((label, i) => <text key={label} x={L + i * ((W - L - R) / (labels.length - 1))} y={H - 5} className="x-label">{label}</text>)}
        <text x={x(values.length - 1) + 12} y={y(values[values.length - 1]) + 5} className="end-label">{values[values.length - 1]}</text>
      </svg>
    </div>
  )
}

function Donut({ colors, values, center, sub }: { colors: string[]; values: number[]; center: string; sub: string }) {
  let cursor = 0
  const stops = values.map((value, i) => {
    const start = cursor
    cursor += value
    return `${colors[i]} ${start}% ${cursor}%`
  }).join(',')
  return <div className="donut" style={{ background: `conic-gradient(${stops})` }}><span><strong>{center}</strong><small>{sub}</small></span></div>
}

function MiniPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="dashboard-panel mini-panel"><h3>{title}</h3>{children}</section>
}

export default function OverviewPage() {
  const { cases } = useCases()
  const [range, setRange] = useState<(typeof ranges)[number]['id']>('90')
  const selected = ranges.find(r => r.id === range)!
  const totals = useMemo(() => ({
    new: Math.round(52 * selected.ratio), active: Math.round(23 * selected.ratio), charged: Math.round(19 * selected.ratio), resolved: Math.round(6 * selected.ratio),
  }), [selected])

  const categories = [
    ['Online Harassment', 32, '#1477ef'], ['Threats & Intimidation', 12, '#793bd0'], ['Identity Misuse', 6, '#23a943'], ['Other', 2, '#ed7905'],
  ] as const
  const risks = [['Critical', 8, '#ff3137'], ['High', 18, '#e66f00'], ['Medium', 16, '#f3af00'], ['Low', 8, '#249d3c']] as const
  const provinces = [['NCD', '24 (48%)'], ['Central', '10 (20%)'], ['Morobe', '8 (16%)'], ['Lae', '6 (12%)'], ['Other Provinces', '2 (4%)']]
  const ages = [['0 – 7 days', '14 (28%)'], ['8 – 30 days', '20 (40%)'], ['31 – 60 days', '12 (24%)'], ['61 – 90 days', '4 (8%)'], ['Over 90 days', '2 (4%)']]

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div><h1>Overview</h1><p>Cyber harassment complaints — Section 23, Cybercrime Act 2016</p></div>
        <button className="export-button"><Download width={17} height={17} /> Export Report</button>
        <div className="date-tabs" role="group" aria-label="Date range">
          {ranges.map(r => <button key={r.id} className={range === r.id ? 'active' : ''} onClick={() => setRange(r.id)}>{r.label}</button>)}
        </div>
        <ShieldLock className="header-shield" width={31} height={31} />
      </header>

      <div className="metric-grid">
        <MetricCard label="New complaints" value={totals.new} color="#1276ed" icon={<Doc width={28} height={28} />} points={[5,5,2,4,1,6,3,5,7]} />
        <MetricCard label="Active investigations" value={totals.active} color="#8441d5" icon={<Search width={28} height={28} />} points={[6,6,4,2,5,1,3,7,5,7]} />
        <MetricCard label="Charges filed" value={totals.charged} color="#28b63d" icon={<Gavel width={28} height={28} />} points={[7,7,5,2,5,2,1,6,4,7,6,7]} />
        <MetricCard label="Resolved" value={totals.resolved} color="#f18a00" icon={<Check width={28} height={28} />} points={[3,4,5,2,4,2,2,5,8,7]} />
      </div>

      <div className="primary-grid">
        <section className="dashboard-panel trend-panel">
          <div className="panel-head"><div><h3>COMPLAINTS FILED</h3><p>{totals.new} complaints in range</p></div><button>Daily Trend <Calendar width={16} height={16} /></button></div>
          <TrendChart ratio={selected.ratio} />
        </section>
        <section className="dashboard-panel status-panel">
          <h3>COMPLAINTS BY STATUS</h3>
          <div className="status-content">
            <Donut colors={['#0966d9','#6b2dc5','#24a936','#f18400']} values={[52,23,19,6]} center="100" sub="Total" />
            <ul>{[['New','52% (52)','#0966d9'],['Active Investigation','23% (23)','#6b2dc5'],['Charges Filed','19% (19)','#24a936'],['Resolved','6% (6)','#f18400']].map(([label,value,color]) => <li key={label}><i style={{background:color}} /><span>{label}</span><b>{value}</b></li>)}</ul>
          </div>
          <Link to="/cases">View detailed breakdown →</Link>
        </section>
      </div>

      <div className="detail-grid">
        <MiniPanel title="COMPLAINTS BY CATEGORY"><ul className="bar-list">{categories.map(([label, value, color]) => <li key={label}><span className="list-icon" style={{color,background:`${color}26`}}><User width={13} height={13} /></span><em>{label}</em><i><b style={{width:`${value * 2}%`,background:color}} /></i><strong>{value} ({Math.round(value / 50 * 100)}%)</strong></li>)}</ul></MiniPanel>
        <MiniPanel title="RISK LEVEL DISTRIBUTION"><div className="risk-body"><Donut colors={risks.map(r=>r[2])} values={[16,36,32,16]} center="!" sub="" /><ul>{risks.map(([label,value,color]) => <li key={label}><i style={{background:color}} />{label}<strong>{value} ({value*2}%)</strong></li>)}</ul></div></MiniPanel>
        <MiniPanel title="TOP PROVINCES"><ul className="rank-list">{provinces.map(([label,value]) => <li key={label}><MapPin width={18} height={18} /><span>{label}</span><strong>{value}</strong></li>)}</ul></MiniPanel>
        <MiniPanel title="CASE AGEING"><ul className="rank-list age-list">{ages.map(([label,value]) => <li key={label}><Clock width={18} height={18} /><span>{label}</span><strong>{value}</strong></li>)}</ul></MiniPanel>
      </div>

      <div className="action-row">
        <div className="risk-alert"><Alert width={33} height={33} /><span><strong>HIGH RISK ALERTS</strong><small>8 complaints flagged as<br />High or Critical risk</small></span><button>View Alerts ›</button></div>
        <Link to="/cases" className="quick-action"><span><Plus width={28} height={28} /></span><div><strong>New Complaint</strong><small>Create a new report</small></div></Link>
        <Link to="/cases" className="quick-action"><span><Search width={27} height={27} /></span><div><strong>Search Cases</strong><small>Find and view case details</small></div></Link>
        <button className="quick-action"><span className="purple"><Doc width={25} height={25} /></span><div><strong>Generate Report</strong><small>Create analytical report</small></div></button>
        <button className="quick-action"><span className="orange"><Bell width={25} height={25} /></span><div><strong>System Alerts</strong><small>View recent alerts</small></div></button>
      </div>
      <span className="case-count-sr">{cases.length} demonstration cases loaded</span>
    </div>
  )
}
