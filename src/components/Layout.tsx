import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CURRENT_OFFICER, useCases } from '../lib/store'
import { useAuth } from '../lib/authStore'
import {
  Analytics, Bell, Folder, Grid, Logout, Reports, Search, Settings, User, Users,
} from './icons'

const nav = [
  { to: '/', label: 'Overview', Icon: Grid, end: true },
  { to: '/cases', label: 'Cases', Icon: Folder, end: false },
  { to: '/reports', label: 'Reports', Icon: Reports, end: false },
  { to: '/analytics', label: 'Analytics', Icon: Analytics, end: false },
  { to: '/alerts', label: 'Alerts', Icon: Bell, end: false },
  { to: '/users', label: 'Users', Icon: Users, end: false },
  { to: '/settings', label: 'Settings', Icon: Settings, end: false },
]

export default function Layout() {
  const { cases } = useCases()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }
  const isCaseFocus = /^\/cases\/[^/]+$/.test(location.pathname)
  const [searchQuery, setSearchQuery] = useState('')
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    return cases.filter((item) => `${item.ref} ${item.complainant.name} ${item.platform} ${item.province} ${item.assignedTo ?? ''}`.toLowerCase().includes(query)).slice(0, 6)
  }, [cases, searchQuery])
  const priorityCases = useMemo(() => cases.filter((item) => (item.priority === 'critical' || item.priority === 'high') && item.stage !== 'resolved').slice(0, 4), [cases])

  function openFirstResult() {
    if (!searchResults[0]) return
    navigate(`/cases/${searchResults[0].id}`)
    setSearchQuery('')
  }

  return (
    <div className={`app-shell${isCaseFocus ? ' case-focus-shell' : ''}`}>
      <aside className="sidebar" title="RPNGC Cyber Unit — restricted internal access">
        <div className="brand">
          <img
            className="brand-crest"
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/PNG_police_emblem.svg/250px-PNG_police_emblem.svg.png"
            alt="Royal Papua New Guinea Constabulary emblem"
          />
        </div>

        <nav className="side-nav" aria-label="Primary navigation">
          {nav.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
              title={label}
            >
              <span className="nav-icon"><Icon width={20} height={20} /></span>
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) => `side-link sidebar-profile-nav ${isActive ? 'active' : ''}`}
            title={`${CURRENT_OFFICER} · Duty Officer · Online`}
          >
            <span className="officer-avatar"><User width={20} height={20} /><i /></span>
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" type="button" onClick={handleLogout} title="Log out">
            <span className="nav-icon"><Logout width={20} height={20} /></span>
            <small>Logout</small>
          </button>
        </div>
      </aside>

      <main className="main-stage">
        {!isCaseFocus && <header className="utility-bar">
          <div className="global-search">
            <Search width={19} height={19} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && openFirstResult()}
              placeholder="Search cases, complainants, platforms or officers..."
              aria-label="Search dashboard cases"
            />
            {searchQuery && <div className="global-search-results">
              <div className="global-search-results-head"><span>Case results</span><b>{searchResults.length}</b></div>
              {searchResults.map((item) => <Link to={`/cases/${item.id}`} key={item.id} onClick={() => setSearchQuery('')}>
                <span><strong>{item.ref}</strong><small>{item.complainant.name} · {item.platform}</small></span>
                <em>{item.province}</em>
              </Link>)}
              {!searchResults.length && <p>No matching cases found.</p>}
              <Link className="global-search-all" to="/cases" onClick={() => setSearchQuery('')}>Open full case search →</Link>
            </div>}
          </div>

          <div className="utility-actions">
            <details className="utility-menu notification-menu">
              <summary aria-label={`${priorityCases.length} priority notifications`}><Bell width={20} height={20} /><i>{priorityCases.length}</i></summary>
              <div className="utility-popover notification-popover">
                <div className="utility-popover-head"><span><b>Notifications</b><small>Priority case activity</small></span><Link to="/alerts">View all</Link></div>
                <div className="notification-list">{priorityCases.map((item) => <Link to={`/cases/${item.id}`} key={item.id}><i className={item.priority} /><span><strong>{item.priority === 'critical' ? 'Critical' : 'High-risk'} case requires review</strong><small>{item.ref} · {item.province}</small></span><em>Now</em></Link>)}</div>
                {!priorityCases.length && <p className="utility-empty">No priority notifications.</p>}
              </div>
            </details>

            <details className="utility-menu profile-utility-menu">
              <summary><span className="utility-avatar">LW<i /></span><span className="utility-officer"><strong>{CURRENT_OFFICER}</strong><small>Duty Officer</small></span></summary>
              <div className="utility-popover profile-popover">
                <div className="profile-popover-identity"><span className="utility-avatar large">LW<i /></span><div><strong>{CURRENT_OFFICER}</strong><small>l.waiko@rpngc.gov.pg</small><em>Administrator · Cyber Unit</em></div></div>
                <nav><Link to="/profile"><User width={16} height={16} /><span>My profile</span></Link><Link to="/settings"><Settings width={16} height={16} /><span>Settings</span></Link><button type="button" onClick={handleLogout}><Logout width={16} height={16} /><span>Log out</span></button></nav>
              </div>
            </details>
          </div>
        </header>}
        <div className="main-content"><Outlet /></div>
      </main>
    </div>
  )
}
