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

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: username !== null,
      username,
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
    [username],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
