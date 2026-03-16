import { useState } from 'react'
import { Eye, EyeOff, HeartPulse, Shield, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'

// ── Left-panel illustration ───────────────────────────────
function HealthIllustration() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary-600 to-primary-800 px-12 py-16 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary-500/30" />
      <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-primary-900/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary-700/20" />

      {/* Central icon card */}
      <div className="relative z-10 text-center mb-10">
        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <HeartPulse className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
          Your Health,<br />Our Priority
        </h2>
        <p className="text-primary-100 text-sm leading-relaxed max-w-xs mx-auto">
          Access AI-powered diagnostics, your medical records, and trusted doctors — all in one secure place.
        </p>
      </div>

      {/* Stat cards */}
      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        {[
          { icon: Shield, label: 'HIPAA Compliant', sub: 'Bank-grade encryption' },
          { icon: Users,  label: '10,000+ Patients', sub: 'Trusted nationwide' },
          { icon: Clock,  label: '24/7 AI Support', sub: 'Always available' },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm"
          >
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{label}</p>
              <p className="text-primary-200 text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Google icon SVG ───────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.login({ email: form.email, password: form.password })
      // Save token and user info
      localStorage.setItem('doctech_token', data.token)
      localStorage.setItem('doctech_user', JSON.stringify({ name: data.name, email: data.email, role: data.role }))
      // Redirect based on role
      navigate(data.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-stretch bg-white">
      {/*  Left — illustration (desktop only) */}
      <div className="lg:w-5/12 xl:w-1/2">
        <HealthIllustration />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-700">
              Doc<span className="text-primary-500">Tech</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white border border-primary-100 rounded-3xl shadow-lg px-8 py-10">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-sm text-gray-500">Sign in to your DocTech account</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Google button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors mb-6"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-400 cursor-pointer accent-primary-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <a href="/signup" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
