import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

/**
 * ⚠️ DEMONSTRATION-ONLY authentication.
 *
 * This is a CLIENT-SIDE mock. The credentials below ship in the browser bundle
 * and the check runs entirely in the browser, so this provides NO real security —
 * anyone can read the values in the JS or bypass the gate in devtools. It exists
 * so the dashboard can be demoed behind a login screen with a working logout.
 *
 * Before real officer/case data lives behind this, replace it with a server-side
 * auth provider (session cookies / OAuth / Supabase Auth) that validates
 * credentials and enforces authorisation on the server.
 */
const DEMO_CREDENTIALS = {
  username: 'user1',
  password: '123',
  code: '321',
} as const

const AUTH_KEY = 'rpngc-cyberunit-auth'
const ACTIVE_OFFICER_KEY = 'rpngc-active-officer'

export type OfficerRole = 'Administrator' | 'Supervisor' | 'Investigator' | 'Analyst' | 'Read Only'
export type OfficerStatus = 'online' | 'active' | 'away' | 'suspended'

export interface OfficerAccount {
  id: string
  name: string
  email: string
  role: OfficerRole
  status: OfficerStatus
  unit: string
  lastActive: string
  badge: string
}

export const OFFICER_ACCOUNTS: OfficerAccount[] = [
  { id: 'u1', name: 'Insp. L. Waiko', email: 'l.waiko@rpngc.gov.pg', role: 'Administrator', status: 'online', unit: 'Cyber Unit Command', lastActive: 'Online now', badge: 'RPNGC-CU-014' },
  { id: 'u2', name: 'Sgt. M. Kaupa', email: 'm.kaupa@rpngc.gov.pg', role: 'Supervisor', status: 'online', unit: 'Investigations', lastActive: 'Online now', badge: 'RPNGC-CU-021' },
  { id: 'u3', name: 'Const. J. Temu', email: 'j.temu@rpngc.gov.pg', role: 'Investigator', status: 'active', unit: 'Digital Evidence', lastActive: '12 minutes ago', badge: 'RPNGC-CU-032' },
  { id: 'u4', name: 'Sgt. R. Auali', email: 'r.auali@rpngc.gov.pg', role: 'Supervisor', status: 'away', unit: 'Case Assessment', lastActive: '1 hour ago', badge: 'RPNGC-CU-018' },
  { id: 'u5', name: 'Det. P. Kila', email: 'p.kila@rpngc.gov.pg', role: 'Investigator', status: 'active', unit: 'Investigations', lastActive: '34 minutes ago', badge: 'RPNGC-CU-027' },
  { id: 'u6', name: 'M. Natera', email: 'm.natera@nicta.gov.pg', role: 'Analyst', status: 'active', unit: 'NICTA Liaison', lastActive: 'Yesterday, 16:42', badge: 'NICTA-LN-006' },
  { id: 'u7', name: 'E. Gima', email: 'e.gima@rpngc.gov.pg', role: 'Read Only', status: 'suspended', unit: 'Records Registry', lastActive: '9 Jul 2026', badge: 'RPNGC-RR-041' },
]

export function officerInitials(name: string) {
  return name.replace(/^(Insp\.|Sgt\.|Const\.|Det\.)\s*/, '').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

export interface LoginInput {
  username: string
  password: string
  code: string
  /** When true, keep the session after the tab closes (localStorage). */
  remember: boolean
}

interface AuthContextValue {
  isAuthenticated: boolean
  username: string | null
  activeOfficer: OfficerAccount
  switchOfficer: (officerId: string) => void
  /** Returns true on success, false on invalid credentials. */
  login: (input: LoginInput) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStored(): string | null {
  return localStorage.getItem(AUTH_KEY) ?? sessionStorage.getItem(AUTH_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(() => readStored())
  const [activeOfficerId, setActiveOfficerId] = useState(() => localStorage.getItem(ACTIVE_OFFICER_KEY) ?? OFFICER_ACCOUNTS[0].id)
  const activeOfficer = OFFICER_ACCOUNTS.find((officer) => officer.id === activeOfficerId) ?? OFFICER_ACCOUNTS[0]

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: username !== null,
      username,
      activeOfficer,
      switchOfficer: (officerId) => {
        if (!OFFICER_ACCOUNTS.some((officer) => officer.id === officerId && officer.status !== 'suspended')) return
        localStorage.setItem(ACTIVE_OFFICER_KEY, officerId)
        setActiveOfficerId(officerId)
      },
      login: ({ username: u, password, code, remember }) => {
        const id = u.trim()
        const valid =
          id === DEMO_CREDENTIALS.username &&
          password === DEMO_CREDENTIALS.password &&
          code.trim() === DEMO_CREDENTIALS.code
        if (!valid) return false

        const store = remember ? localStorage : sessionStorage
        store.setItem(AUTH_KEY, id)
        setUsername(id)
        return true
      },
      logout: () => {
        localStorage.removeItem(AUTH_KEY)
        sessionStorage.removeItem(AUTH_KEY)
        setUsername(null)
      },
    }),
    [username, activeOfficer],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
