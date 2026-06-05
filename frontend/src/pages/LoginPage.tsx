import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap, Mail, Lock, User } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { authApi } from '../lib/api'

interface LoginPageProps {
  isRegister?: boolean
}

export default function LoginPage({ isRegister = false }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>(isRegister ? 'register' : 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'login'
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register({ email: form.email, password: form.password, full_name: form.full_name })

      const { access_token, refresh_token, user } = res.data
      setAuth(user, access_token, refresh_token)
      navigate(user.onboarding_completed ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--purple)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--indigo)' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-purple)' }}
              >
                <Zap size={22} className="text-white" />
              </div>
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'Space Grotesk', letterSpacing: '-0.02em' }}
              >
                PesaPilot AI
              </span>
            </Link>
            <h2 className="text-xl font-semibold">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {mode === 'login'
                ? 'Sign in to your financial command center'
                : 'Start your journey to financial freedom'}
            </p>
          </div>

          {/* Toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
          >
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  mode === m
                    ? { background: 'var(--gradient-brand)', color: 'white' }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  id="full-name-input"
                  type="text"
                  placeholder="Full name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="email-input"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 8 characters)"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pl-10 pr-10"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm px-4 py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
              >
                {error}
              </motion.div>
            )}

            <button
              id="submit-auth-btn"
              type="submit"
              disabled={loading}
              className="btn-brand w-full justify-center"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo note */}
          <div
            className="mt-4 text-xs text-center px-4 py-3 rounded-xl"
            style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)', color: 'var(--text-muted)' }}
          >
            💡 <strong style={{ color: 'var(--purple-light)' }}>Demo:</strong> Use any email & password to explore all features
          </div>
        </div>

        {/* Back to landing */}
        <p className="text-center mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Link to="/" className="hover:underline" style={{ color: 'var(--purple-light)' }}>
            ← Back to home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
