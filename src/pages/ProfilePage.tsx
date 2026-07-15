import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Bell, Check, Clock, Folder, Settings, ShieldLock, User } from '../components/icons'
import { PriorityBadge, StageBadge } from '../components/badges'
import { fmtDate } from '../lib/format'
import { useCases } from '../lib/store'
import { officerInitials, useAuth } from '../lib/authStore'

interface OfficerProfile { email: string; phone: string; unit: string; dutyStation: string }

export default function ProfilePage() {
  const { allCases: cases } = useCases()
  const { activeOfficer } = useAuth()
  const profileKey = `rpngc-profile-${activeOfficer.id}`
  const defaults: OfficerProfile = { email: activeOfficer.email, phone: '+675 322 6100', unit: activeOfficer.unit, dutyStation: 'Police Headquarters, Konedobu' }
  const loadProfile = () => { try { return { ...defaults, ...JSON.parse(localStorage.getItem(profileKey) || '{}') } as OfficerProfile } catch { return defaults } }
  const [profile, setProfile] = useState<OfficerProfile>(loadProfile)
  const [message, setMessage] = useState('')
  const [preferences, setPreferences] = useState({ critical: true, assignments: true, digest: false, browser: true })
  useEffect(() => { setProfile(loadProfile()); setMessage('') }, [activeOfficer.id])
  const assigned = useMemo(() => cases.filter((item) => item.assignedTo === activeOfficer.name), [cases, activeOfficer.name])
  const active = assigned.filter((item) => item.stage !== 'resolved')
  const risk = active.filter((item) => item.priority === 'critical' || item.priority === 'high')
  const resolved = assigned.filter((item) => item.stage === 'resolved')
  const noteCount = cases.reduce((total, item) => total + item.notes.filter((note) => note.officer === activeOfficer.name).length, 0)

  function saveProfile(event: FormEvent) {
    event.preventDefault()
    localStorage.setItem(profileKey, JSON.stringify(profile))
    setMessage('Profile changes saved successfully.')
  }

  return <div className="profile-page">
    <header className="profile-page-header">
      <div><span className="profile-eyebrow"><User width={14} height={14} /> Officer account</span><h1 className="display">My Profile</h1><p>Manage your identity, workload and personal notification preferences.</p></div>
      <span className="profile-access"><ShieldLock width={16} height={16} /> Restricted account</span>
    </header>
    <section className="profile-hero">
      <div className="profile-avatar-large">{officerInitials(activeOfficer.name)}<i /></div>
      <div className="profile-identity"><span>{activeOfficer.status} · Active account</span><h2>{activeOfficer.name}</h2><p>{activeOfficer.role} · {profile.unit}</p><div><b>Badge ID</b> {activeOfficer.badge} <b>Role</b> {activeOfficer.role}</div></div>
      <div className="profile-security-summary"><ShieldLock width={22} height={22} /><div><strong>Account protected</strong><span>Multi-factor authentication enabled</span></div></div>
    </section>
    <section className="profile-kpis" aria-label="Officer workload">
      <article><span className="blue"><Folder width={19} height={19} /></span><div><small>Active cases</small><strong>{active.length}</strong><em>Currently assigned</em></div></article>
      <article><span className="red"><Alert width={19} height={19} /></span><div><small>High-risk matters</small><strong>{risk.length}</strong><em>High or critical</em></div></article>
      <article><span className="green"><Check width={19} height={19} /></span><div><small>Cases resolved</small><strong>{resolved.length}</strong><em>Total assigned outcomes</em></div></article>
      <article><span className="violet"><Settings width={19} height={19} /></span><div><small>Case notes</small><strong>{noteCount}</strong><em>Authored by you</em></div></article>
    </section>
    <div className="profile-grid">
      <section className="profile-card profile-details-card">
        <div className="profile-card-head"><div><span>Personal details</span><h2>Officer information</h2></div><User width={20} height={20} /></div>
        <form onSubmit={saveProfile}>
          <label><span>Full name</span><input value={activeOfficer.name} disabled /></label>
          <label><span>Official email</span><input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
          <label><span>Contact number</span><input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
          <label><span>Operational unit</span><input value={profile.unit} onChange={(e) => setProfile({ ...profile, unit: e.target.value })} /></label>
          <label className="wide"><span>Duty station</span><input value={profile.dutyStation} onChange={(e) => setProfile({ ...profile, dutyStation: e.target.value })} /></label>
          <div className="profile-form-actions"><span role="status">{message}</span><button type="submit">Save changes</button></div>
        </form>
      </section>
      <section className="profile-card profile-preferences">
        <div className="profile-card-head"><div><span>Communications</span><h2>Notification preferences</h2></div><Bell width={20} height={20} /></div>
        {([['critical', 'Critical case alerts', 'Immediate notification for critical-risk matters.'], ['assignments', 'Assignment updates', 'Notify me when a case is assigned or reassigned.'], ['digest', 'Daily operational digest', 'Receive one summary at the end of each duty day.'], ['browser', 'Browser notifications', 'Show alerts while this dashboard is open.']] as const).map(([key, title, copy]) => <label className="setting-toggle-row" key={key}><span><strong>{title}</strong><small>{copy}</small></span><input type="checkbox" checked={preferences[key]} onChange={() => setPreferences({ ...preferences, [key]: !preferences[key] })} /><i aria-hidden /></label>)}
      </section>
      <section className="profile-card assigned-cases-card">
        <div className="profile-card-head"><div><span>Current workload</span><h2>Assigned cases</h2></div><Link to="/cases">View all cases →</Link></div>
        <div className="profile-case-list">{active.slice(0, 5).map((item) => <Link to={`/cases/${item.id}`} key={item.id}><div><strong>{item.ref}</strong><span>{item.complainant.name} · {item.province}</span></div><div><PriorityBadge priority={item.priority} /><StageBadge stage={item.stage} /><time>{fmtDate(item.filedAt)}</time></div></Link>)}{!active.length && <p className="profile-empty">No active cases are currently assigned to you.</p>}</div>
      </section>
      <section className="profile-card profile-session-card">
        <div className="profile-card-head"><div><span>Account security</span><h2>Sign-in & session</h2></div><ShieldLock width={20} height={20} /></div>
        <dl><div><dt><Clock width={15} height={15} /> Last sign-in</dt><dd>Today, 08:14</dd></div><div><dt><ShieldLock width={15} height={15} /> MFA status</dt><dd className="good">Enabled</dd></div><div><dt><User width={15} height={15} /> Active session</dt><dd>Port Moresby · This device</dd></div></dl>
        <button type="button" onClick={() => setMessage('Password reset instructions sent to your official email.')}>Request password reset</button>
      </section>
    </div>
  </div>
}
