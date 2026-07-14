import { NavLink, Outlet } from 'react-router-dom'
import { CURRENT_OFFICER, useCases } from '../lib/store'
import {
  Analytics, Bell, Folder, Grid, Reports, Refresh, Settings, ShieldLock, User, Users,
} from './icons'

const nav = [
  { to: '/', label: 'Overview', Icon: Grid, end: true },
  { to: '/cases', label: 'Cases', Icon: Folder, end: false },
  { to: '/reports', label: 'Reports', Icon: Reports, end: false },
  { to: '/analytics', label: 'Analytics', Icon: Analytics, end: false },
  { to: '/alerts', label: 'Alerts & Notifications', Icon: Bell, end: false },
  { to: '/users', label: 'Users & Roles', Icon: Users, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

export default function Layout() {
  const { resetData } = useCases()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img
            className="brand-crest"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/PNG_police_emblem.svg/250px-PNG_police_emblem.svg.png"
            alt="Royal Papua New Guinea Constabulary emblem"
          />
          <div className="brand-copy">
            <span className="brand-kicker">RPNGC · INTERNAL</span>
            <strong>CYBER UNIT</strong>
            <small>ROYAL PAPUA NEW GUINEA<br />CONSTABULARY</small>
          </div>
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            >
              <Icon width={22} height={22} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="officer-card">
            <span className="officer-avatar"><User width={23} height={23} /></span>
            <span>
              <strong>{CURRENT_OFFICER}</strong>
              <small>Duty Officer</small>
              <em><i />Online</em>
            </span>
          </div>
          <button className="reset-button" onClick={resetData} title="Regenerate the demonstration dataset">
            <Refresh width={17} height={17} /> Reset demo data
          </button>
          <p className="legal-note">Section 23 · Cybercrime Act 2016<br />Demonstration data only.</p>
          <div className="restricted">
            <ShieldLock width={20} height={20} />
            <span><strong>Restricted access</strong><small>For authorised personnel only.</small></span>
          </div>
        </div>
      </aside>

      <main className="main-stage">
        <Outlet />
      </main>
    </div>
  )
}
