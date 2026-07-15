import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/authStore'
import { ShieldLock, Lock, User, Eye, EyeOff } from '../components/icons'

/** Input with a leading icon and optional trailing control; label kept for screen readers. */
function LoginField({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  autoComplete,
  inputMode,
  invalid,
  trailing,
}: {
  id: string
  label: string
  icon: ReactNode
  type?: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  inputMode?: 'text' | 'numeric'
  invalid?: boolean
  trailing?: ReactNode
}) {
  return (
    <div className="login-field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <span className="login-field-icon" aria-hidden="true">
        {icon}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? 'login-error' : undefined}
      />
      {trailing && <span className="login-field-trailing">{trailing}</span>}
    </div>
  )
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = login({ username, password, code, remember })
    if (ok) navigate('/', { replace: true })
    else setError('Invalid Officer ID, password, or verification code.')
  }

  return (
    <div className="login-screen">
      {/* Full-bleed brand artwork (crest, map + hooded-figure scene) */}
      <img className="login-backdrop" src="/login-backdrop.png" alt="" aria-hidden="true" />
      <div className="login-scrim" aria-hidden="true" />

      {/* Top-left wordmark */}
      <div className="login-wordmark">
        <img
          className="login-wordmark-crest"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/PNG_police_emblem.svg/250px-PNG_police_emblem.svg.png"
          alt="Royal Papua New Guinea Constabulary emblem"
        />
        <span>
          <small>ROYAL PAPUA NEW GUINEA</small>
          <strong>CONSTABULARY</strong>
          <em>CYBER UNIT</em>
        </span>
      </div>

      {/* Login card */}
      <div className="login-panel">
        <div className="login-card">
          <div className="login-card-head">
            <span className="login-shield" aria-hidden="true">
              <ShieldLock width={30} height={30} />
            </span>
            <h1 className="login-title">
              CYBER UNIT
              <span>DASHBOARD LOGIN</span>
            </h1>
            <p className="login-subtitle">
              Authorised officers sign in to access the internal cyber harassment case management
              dashboard.
            </p>
          </div>

          <form onSubmit={onSubmit} className="login-form" noValidate>
            <LoginField
              id="officer-id"
              label="Officer ID / Username"
              icon={<User width={18} height={18} />}
              value={username}
              onChange={setUsername}
              autoComplete="username"
              invalid={!!error}
            />

            <LoginField
              id="officer-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={<Lock width={18} height={18} />}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              invalid={!!error}
              trailing={
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff width={18} height={18} /> : <Eye width={18} height={18} />}
                </button>
              }
            />

            <LoginField
              id="officer-2fa"
              label="Verification Code (2FA)"
              icon={<ShieldLock width={18} height={18} />}
              value={code}
              onChange={setCode}
              autoComplete="one-time-code"
              inputMode="numeric"
              invalid={!!error}
              trailing={
                <span className="login-2fa-badge" aria-hidden="true">
                  123
                </span>
              }
            />

            {error && (
              <p id="login-error" role="alert" className="login-error">
                {error}
              </p>
            )}

            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember this device
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() =>
                  setError('Password resets are handled by your Cyber Unit administrator.')
                }
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-submit">
              <Lock width={18} height={18} />
              <span>SIGN IN TO DASHBOARD</span>
            </button>
          </form>

          <p className="login-footnote">
            Demonstration login. Access is restricted to authorised RPNGC Cyber Unit officers.
          </p>
        </div>
      </div>
    </div>
  )
}
