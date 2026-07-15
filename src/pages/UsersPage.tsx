import { useMemo, useState, type FormEvent } from 'react'
import { Alert, Check, Clock, Plus, Search, Settings, ShieldLock, User, Users } from '../components/icons'
import { useCases } from '../lib/store'

type UserRole = 'Administrator' | 'Supervisor' | 'Investigator' | 'Analyst' | 'Read Only'
type UserStatus = 'online' | 'active' | 'away' | 'suspended'

interface SystemUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  unit: string
  lastActive: string
}

const ROLES: UserRole[] = ['Administrator', 'Supervisor', 'Investigator', 'Analyst', 'Read Only']
const PERMISSIONS: Record<UserRole, string[]> = {
  Administrator: ['Manage users and roles', 'View and edit all cases', 'Advance case stages', 'Export reports', 'Change system settings'],
  Supervisor: ['View and edit all cases', 'Assign officers', 'Advance case stages', 'Export reports', 'Review operational alerts'],
  Investigator: ['View assigned cases', 'Add evidence and notes', 'Advance assigned cases', 'Review alerts', 'Generate case reports'],
  Analyst: ['View anonymised case data', 'Use analytics and reports', 'Export aggregate reports', 'Review trends'],
  'Read Only': ['View permitted cases', 'View reports', 'View analytics'],
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'u1', name: 'Insp. L. Waiko', email: 'l.waiko@rpngc.gov.pg', role: 'Administrator', status: 'online', unit: 'Cyber Unit Command', lastActive: 'Online now' },
  { id: 'u2', name: 'Sgt. M. Kaupa', email: 'm.kaupa@rpngc.gov.pg', role: 'Supervisor', status: 'online', unit: 'Investigations', lastActive: 'Online now' },
  { id: 'u3', name: 'Const. J. Temu', email: 'j.temu@rpngc.gov.pg', role: 'Investigator', status: 'active', unit: 'Digital Evidence', lastActive: '12 minutes ago' },
  { id: 'u4', name: 'Sgt. R. Auali', email: 'r.auali@rpngc.gov.pg', role: 'Supervisor', status: 'away', unit: 'Case Assessment', lastActive: '1 hour ago' },
  { id: 'u5', name: 'Det. P. Kila', email: 'p.kila@rpngc.gov.pg', role: 'Investigator', status: 'active', unit: 'Investigations', lastActive: '34 minutes ago' },
  { id: 'u6', name: 'M. Natera', email: 'm.natera@nicta.gov.pg', role: 'Analyst', status: 'active', unit: 'NICTA Liaison', lastActive: 'Yesterday, 16:42' },
  { id: 'u7', name: 'E. Gima', email: 'e.gima@rpngc.gov.pg', role: 'Read Only', status: 'suspended', unit: 'Records Registry', lastActive: '9 Jul 2026' },
]

function initials(name: string) {
  return name.replace(/^(Insp\.|Sgt\.|Const\.|Det\.)\s*/, '').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export default function UsersPage() {
  const { cases } = useCases()
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all')
  const [selectedId, setSelectedId] = useState('u1')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('Investigator')
  const [actionMessage, setActionMessage] = useState('')

  const workload = useMemo(() => Object.fromEntries(users.map((user) => [user.name, cases.filter((item) => item.assignedTo === user.name && item.stage !== 'resolved').length])), [cases, users])
  const filtered = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false
    if (statusFilter !== 'all' && user.status !== statusFilter) return false
    const needle = query.trim().toLowerCase()
    return !needle || `${user.name} ${user.email} ${user.role} ${user.unit}`.toLowerCase().includes(needle)
  })
  const selected = users.find((user) => user.id === selectedId) ?? filtered[0] ?? users[0]
  const privileged = users.filter((user) => user.role === 'Administrator' || user.role === 'Supervisor').length
  const online = users.filter((user) => user.status === 'online').length
  const suspended = users.filter((user) => user.status === 'suspended').length

  function updateRole(id: string, role: UserRole) {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, role } : user))
  }

  function toggleSuspended(id: string) {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' } : user))
    setActionMessage('Account access status updated successfully.')
  }

  function addUser(event: FormEvent) {
    event.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return
    const next: SystemUser = { id: `u${Date.now()}`, name: newName.trim(), email: newEmail.trim(), role: newRole, status: 'active', unit: 'Cyber Unit', lastActive: 'Invitation pending' }
    setUsers((current) => [...current, next])
    setSelectedId(next.id)
    setNewName('')
    setNewEmail('')
    setNewRole('Investigator')
    setShowAddUser(false)
  }

  return (
    <div className="users-page">
      <header className="users-header">
        <div>
          <span className="users-eyebrow"><ShieldLock width={14} height={14} /> Access administration</span>
          <h1 className="display">Users & Roles</h1>
          <p>Manage Cyber Unit access, responsibilities and operational permissions.</p>
        </div>
        <button className="add-user-button" type="button" onClick={() => setShowAddUser(true)}><Plus width={17} height={17} /> Add user</button>
      </header>

      <section className="users-kpis" aria-label="User statistics">
        <article><span className="blue"><Users width={19} height={19} /></span><div><small>Total users</small><strong>{users.length}</strong><em>Across {new Set(users.map((user) => user.unit)).size} units</em></div></article>
        <article><span className="green"><User width={19} height={19} /></span><div><small>Online now</small><strong>{online}</strong><em>Available officers</em></div></article>
        <article><span className="violet"><ShieldLock width={19} height={19} /></span><div><small>Privileged access</small><strong>{privileged}</strong><em>Admin or supervisor</em></div></article>
        <article><span className="orange"><Alert width={19} height={19} /></span><div><small>Suspended</small><strong>{suspended}</strong><em>Access blocked</em></div></article>
      </section>

      <section className="users-toolbar" aria-label="User filters">
        <div className="users-search"><Search width={15} height={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, role or unit..." aria-label="Search users" /></div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | UserRole)} aria-label="Filter by role"><option value="all">All roles</option>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | UserStatus)} aria-label="Filter by status"><option value="all">All statuses</option><option value="online">Online</option><option value="active">Active</option><option value="away">Away</option><option value="suspended">Suspended</option></select>
        <span>{filtered.length} users shown</span>
      </section>

      <section className="users-workspace">
        <div className="users-directory">
          <div className="users-directory-head"><div><span>User directory</span><h2>Authorised personnel</h2></div><b>{users.length} accounts</b></div>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Active cases</th><th>Last active</th><th /></tr></thead>
              <tbody>{filtered.map((user) => <tr key={user.id} className={selected?.id === user.id ? 'selected' : ''}>
                <td><div className="user-identity"><span>{initials(user.name)}<i className={user.status} /></span><div><strong>{user.name}</strong><small>{user.email}</small></div></div></td>
                <td><select value={user.role} onChange={(event) => updateRole(user.id, event.target.value as UserRole)} aria-label={`Role for ${user.name}`}>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
                <td><span className={`user-status ${user.status}`}><i />{user.status}</span></td>
                <td><b className="user-workload">{workload[user.name] ?? 0}</b></td>
                <td><span className="user-last-active">{user.lastActive}</span></td>
                <td><button type="button" onClick={() => { setSelectedId(user.id); setActionMessage('') }}>Manage</button></td>
              </tr>)}</tbody>
            </table>
            {!filtered.length && <div className="users-empty"><Users width={24} height={24} /><strong>No users match these filters</strong></div>}
          </div>
        </div>

        {selected && <aside className="user-detail">
          <div className="user-detail-profile"><span>{initials(selected.name)}<i className={selected.status} /></span><div><small>Selected account</small><h2>{selected.name}</h2><p>{selected.email}</p></div></div>
          <div className="user-detail-facts"><div><Settings width={15} height={15} /><span>Role</span><strong>{selected.role}</strong></div><div><Users width={15} height={15} /><span>Unit</span><strong>{selected.unit}</strong></div><div><Clock width={15} height={15} /><span>Last active</span><strong>{selected.lastActive}</strong></div><div><User width={15} height={15} /><span>Active workload</span><strong>{workload[selected.name] ?? 0} cases</strong></div></div>
          <div className="permission-panel"><span>Effective permissions</span><ul>{PERMISSIONS[selected.role].map((permission) => <li key={permission}><Check width={13} height={13} />{permission}</li>)}</ul></div>
          <div className="user-detail-actions"><button type="button" className={selected.status === 'suspended' ? 'reactivate' : 'suspend'} onClick={() => toggleSuspended(selected.id)}>{selected.status === 'suspended' ? 'Reactivate account' : 'Suspend account'}</button><button type="button" className="reset-access" onClick={() => setActionMessage(`Password reset instructions queued for ${selected.email}.`)}>Send password reset</button></div>
          <p className="access-note"><ShieldLock width={13} height={13} /> {actionMessage || 'Role and status changes apply immediately to this local demonstration.'}</p>
        </aside>}
      </section>

      {showAddUser && <div className="user-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowAddUser(false)}>
        <form className="user-modal" onSubmit={addUser}>
          <div className="user-modal-head"><div><span>Account provisioning</span><h2>Add authorised user</h2></div><button type="button" onClick={() => setShowAddUser(false)} aria-label="Close add user dialog">×</button></div>
          <label>Full name<input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Officer or staff name" required /></label>
          <label>Official email<input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} placeholder="name@rpngc.gov.pg" required /></label>
          <label>Assigned role<select value={newRole} onChange={(event) => setNewRole(event.target.value as UserRole)}>{ROLES.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
          <div className="user-modal-actions"><button type="button" onClick={() => setShowAddUser(false)}>Cancel</button><button type="submit"><Plus width={15} height={15} /> Create user</button></div>
        </form>
      </div>}
    </div>
  )
}
