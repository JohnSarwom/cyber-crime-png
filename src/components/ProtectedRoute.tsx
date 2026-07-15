import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/authStore'

/**
 * Gate for the internal dashboard. Unauthenticated visitors are redirected to
 * the login screen. (Demo-only gate — see authStore.tsx.)
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
