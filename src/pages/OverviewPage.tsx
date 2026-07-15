import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useCases } from '../lib/store'
import { useAuth } from '../lib/authStore'
import {
  Alert, Bell, Calendar, Check, Chevron, Clock, Doc, Gavel, MapPin, Plus, Search,
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

export default function OverviewPage() {
  const { cases } = useCases()
  const { activeOfficer } = useAuth()
  const [range, setRange] = useState<(typeof ranges)[number]['id']>('90')
  const selected = ranges.find(r => r.id === range)!
  const activeCaseCount = useMemo(() => cases.filter(caseRecord => caseRecord.stage !== 'resolved').length, [cases])
  const priorityCaseCount = useMemo(() => cases.filter(caseRecord => caseRecord.stage !== 'resolved' && (caseRecord.priority === 'critical' || caseRecord.priority === 'high')).length, [cases])
  const welcomeName = activeOfficer.name.replace('Insp.', 'Inspector')
  const totals = useMemo(() => {
    const cutoff = Date.now() - Number(selected.id) * 86_400_000
    const inRange = cases.filter((item) => new Date(item.filedAt).getTime() >= cutoff)
    return {
      new: inRange.length,
      active: inRange.filter((item) => item.stage === 'evidence_review' || item.stage === 'investigation').length,
      charged: inRange.filter((item) => item.stage === 'charges_filed' || item.stage === 'in_court').length,
      resolved: inRange.filter((item) => item.stage === 'resolved').length,
    }
  }, [cases, selected.id])

  const categories = [
    ['Online Harassment', 32, '#1477ef'], ['Threats & Intimidation', 12, '#793bd0'], ['Identity Misuse', 6, '#23a943'], ['Other', 2, '#ed7905'],
  ] as const
  const risks = [['Critical', 8, '#ff3137'], ['High', 18, '#e66f00'], ['Medium', 16, '#f3af00'], ['Low', 8, '#249d3c']] as const
  const provinces = [['NCD', '24 (48%)'], ['Central', '10 (20%)'], ['Morobe', '8 (16%)'], ['Lae', '6 (12%)'], ['Other Provinces', '2 (4%)']]
  const ages = [['0 – 7 days', '14 (28%)'], ['8 – 30 days', '20 (40%)'], ['31 – 60 days', '12 (24%)'], ['61 – 90 days', '4 (8%)'], ['Over 90 days', '2 (4%)']]

  return (
    <div className="overview-page">
      <header className="overview-header">
        <div className="overview-hero-copy">
          <span className="overview-hero-eyebrow"><ShieldLock width={16} height={16} aria-hidden="true" /> RPNGC Cyber Operations Command</span>
          <h1>Welcome back, <span>{welcomeName}</span></h1>
          <p>Your command overview for cyber harassment complaints under Section 23 of the Cybercrime Act 2016.</p>
          <div className="overview-hero-status" aria-label="Current operational status">
            <span className="is-online"><i aria-hidden="true" /> Command centre online</span>
            <span><Clock width={15} height={15} aria-hidden="true" /><strong>{activeCaseCount}</strong> active cases</span>
            <span className="is-priority"><Alert width={15} height={15} aria-hidden="true" /><strong>{priorityCaseCount}</strong> priority matters</span>
          </div>
          <div className="overview-hero-actions">
            <Link to="/cases" className="overview-hero-primary">Open case workspace <Chevron width={17} height={17} aria-hidden="true" /></Link>
            <Link to="/alerts" className="overview-hero-secondary">Review priority alerts</Link>
          </div>
        </div>
        <div className="overview-hero-visual" aria-hidden="true">
          <i className="overview-hero-orbit orbit-one" /><i className="overview-hero-orbit orbit-two" />
          <span className="overview-hero-shield"><ShieldLock width={78} height={78} /></span>
          <div><small>Royal Papua New Guinea Constabulary</small><strong>CYBER UNIT</strong><em>Secure · Monitor · Respond</em></div>
        </div>
        <div className="date-tabs" role="group" aria-label="Date range">
          {ranges.map(r => <button key={r.id} className={range === r.id ? 'active' : ''} onClick={() => setRange(r.id)}>{r.label}</button>)}
        </div>
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
        <section className="dashboard-panel overview-actions-panel">
          <div className="overview-actions-head"><div><span>Workspace shortcuts</span><h3>QUICK ACTIONS</h3></div><small>Operational tools</small></div>
          <Link to="/alerts" className="overview-risk-action"><Alert width={23} height={23} /><span><strong>High risk alerts</strong><small>{risks[0][1] + risks[1][1]} matters require priority review</small></span><b>Review →</b></Link>
          <div className="overview-action-grid">
            <Link to="/cases" className="overview-action"><span><Plus width={22} height={22} /></span><div><strong>New complaint</strong><small>Create a report</small></div></Link>
            <Link to="/cases" className="overview-action"><span><Search width={21} height={21} /></span><div><strong>Search cases</strong><small>Find case details</small></div></Link>
            <Link to="/reports" className="overview-action"><span className="purple"><Doc width={20} height={20} /></span><div><strong>Generate report</strong><small>Open reporting</small></div></Link>
            <Link to="/alerts" className="overview-action"><span className="orange"><Bell width={20} height={20} /></span><div><strong>System alerts</strong><small>View notifications</small></div></Link>
          </div>
        </section>
      </div>

      <div className="overview-table-grid">
        <section className="dashboard-panel overview-summary-table">
          <div className="overview-table-head"><div><span>Complaint profile</span><h3>CATEGORY &amp; RISK</h3></div><Link to="/analytics">Full analytics →</Link></div>
          <div className="overview-table-wrap"><table><thead><tr><th>Category</th><th>Cases</th><th>Share</th><th>Risk level</th><th>Cases</th><th>Share</th></tr></thead><tbody>{categories.map(([category, count, categoryColor], index) => { const [risk, riskCount, riskColor] = risks[index]; return <tr key={category}><td><span className="table-label-icon" style={{ color: categoryColor, background: `${categoryColor}24` }}><User width={13} height={13} /></span><b>{category}</b></td><td>{count}</td><td><span className="table-progress"><i style={{ width: `${count / 32 * 100}%`, background: categoryColor }} /></span><strong>{Math.round(count / 50 * 100)}%</strong></td><td><i className="risk-dot" style={{ background: riskColor }} /><b>{risk}</b></td><td>{riskCount}</td><td><span className="table-progress"><i style={{ width: `${riskCount / 18 * 100}%`, background: riskColor }} /></span><strong>{riskCount * 2}%</strong></td></tr> })}</tbody></table></div>
        </section>
        <section className="dashboard-panel overview-summary-table">
          <div className="overview-table-head"><div><span>Operational distribution</span><h3>PROVINCE &amp; CASE AGEING</h3></div><Link to="/cases">View cases →</Link></div>
          <div className="overview-table-wrap"><table><thead><tr><th>Province</th><th>Cases</th><th>Share</th><th>Age bracket</th><th>Cases</th><th>Share</th></tr></thead><tbody>{provinces.map(([province, provinceValue], index) => { const [age, ageValue] = ages[index]; const [provinceCount, provinceShare] = provinceValue.split(' '); const [ageCount, ageShare] = ageValue.split(' '); return <tr key={province}><td><MapPin width={16} height={16} /><b>{province}</b></td><td>{provinceCount}</td><td><strong>{provinceShare}</strong></td><td><Clock width={16} height={16} /><b>{age}</b></td><td>{ageCount}</td><td><strong>{ageShare}</strong></td></tr> })}</tbody></table></div>
        </section>
      </div>
      <span className="case-count-sr">{cases.length} demonstration cases loaded</span>
    </div>
  )
}
