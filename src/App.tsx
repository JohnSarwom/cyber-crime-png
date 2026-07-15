import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import OverviewPage from './pages/OverviewPage'
import CasesPage from './pages/CasesPage'
import CaseDetailPage from './pages/CaseDetailPage'
import ReportsPage from './pages/ReportsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AlertsPage from './pages/AlertsPage'
import UsersPage from './pages/UsersPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything below requires an authenticated officer session */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<OverviewPage />} />
          <Route path="cases" element={<CasesPage />} />
          <Route path="cases/:id" element={<CaseDetailPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}
