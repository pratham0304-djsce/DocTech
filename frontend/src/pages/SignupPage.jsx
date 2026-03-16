import { useState, useMemo } from 'react'
import { Eye, EyeOff, HeartPulse, CheckCircle2, Shield, Stethoscope } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'

// ── Departments list ──────────────────────────────────────
const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Orthopedics',
  'Neurology', 'Gynecology', 'Dermatology',
  'Pediatrics', 'Oncology', 'Psychiatry', 'ENT',
]

// ── Password strength ─────────────────────────────────────
function getStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score // 0-4
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLORS = [
  '',
  'bg-red-400',
  'bg-yellow-400',
  'bg-primary-300',
  'bg-primary-500',
]
const STRENGTH_TEXT = [
  '',
  'text-red-500',
  'text-yellow-600',
  'text-primary-500',
  'text-primary-600',
]

function PasswordStrengthBar({ password }) {
  const score = getStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? STRENGTH_COLORS[score] : 'bg-gray-100'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${STRENGTH_TEXT[score]}`}>
        {STRENGTH_LABELS[score]}
      </p>
    </div>
  )
}

// ── Left illustration ─────────────────────────────────────
function SignupIllustration() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center bg-gradient-to-br from-primary-500 to-primary-800 px-12 py-16 relative overflow-hidden min-h-full">
      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-400/20" />
      <div className="absolute bottom-0 -left-10 w-72 h-72 rounded-full bg-primary-900/30" />

      <div className="relative z-10 text-center mb-10">
        <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
          <HeartPulse className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
          Join Thousands of<br />Healthier Lives
        </h2>
        <p className="text-primary-100 text-sm leading-relaxed max-w-xs mx-auto">
          Create your account and access AI-powered healthcare, your personal health records, and verified doctors — all in one place.
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-3 w-full max-w-xs">
        {[
          { icon: Shield,       text: 'HIPAA-compliant & fully encrypted' },
          { icon: CheckCircle2, text: 'Free to join, no credit card needed' },
          { icon: Stethoscope,  text: '284+ verified specialist doctors' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <Icon className="w-4 h-4 text-white shrink-0" />
            <p className="text-white text-sm">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Google icon ───────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

// ── Shared input component ────────────────────────────────
function InputField({ label, id, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function SelectField({ label, id, children, error, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition bg-white ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function SignupPage() {
  const [role, setRole]               = useState('patient')
  const [showPassword, setShowPw]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [agreed, setAgreed]           = useState(false)
  const [errors, setErrors]           = useState({})
  const [apiError, setApiError]       = useState('')
  const [success, setSuccess]         = useState(false)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    // patient
    age: '', gender: '', height: '', weight: '',
    // doctor
    department: '', experience: '', hospital: '', location: '',
  })

  const strength = useMemo(() => getStrength(form.password), [form.password])

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.fullName.trim())                   e.fullName = 'Full name is required'
    if (!/\S+@\S+\.\S+/.test(form.email))        e.email    = 'Valid email is required'
    if (strength < 2)                             e.password = 'Password is too weak'
    if (form.password !== form.confirmPassword)   e.confirmPassword = 'Passwords do not match'
    if (!agreed)                                  e.agreed   = 'Please accept the terms'
    if (role === 'doctor') {
      if (!form.department) e.department = 'Please select a department'
      if (!form.hospital)   e.hospital   = 'Hospital / Clinic name is required'
    }
    if (role === 'patient') {
      if (!form.age || isNaN(form.age)) e.age = 'Please enter a valid age'
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    setApiError('')
    setLoading(true)
    try {
      const body = {
        name: form.fullName, email: form.email, password: form.password, role,
        ...(role === 'patient' && { age: form.age, gender: form.gender, height: form.height, weight: form.weight }),
        ...(role === 'doctor'  && { department: form.department, experience: form.experience, hospital: form.hospital, location: form.location }),
      }
      const data = await authAPI.register(body)
      localStorage.setItem('doctech_token', data.token)
      localStorage.setItem('doctech_user', JSON.stringify({ name: data.name, email: data.email, role: data.role }))
      setSuccess(true)
      setTimeout(() => navigate('/patient/dashboard'), 1200)
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left illustration — sticky so it stays visible while form scrolls */}
      <div className="lg:w-5/12 xl:w-1/2 lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-4rem)]">
        <SignupIllustration />
      </div>

      {/* Right form — scrollable */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary-700">
              Doc<span className="text-primary-500">Tech</span>
            </span>
          </div>

          {/* Card */}
          <div className="bg-white border border-primary-100 rounded-3xl shadow-lg px-8 py-8">
            {/* Header */}
            <div className="mb-5">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create Your Health Account</h1>
              <p className="text-sm text-gray-500">Join DocTech and take control of your health.</p>
            </div>

            {/* Success banner */}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-primary-50 border border-primary-200 text-sm text-primary-700 font-medium flex items-center gap-2">
                <span className="text-lg">🎉</span> Account created! Redirecting to your dashboard…
              </div>
            )}

            {/* Error banner */}
            {apiError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {apiError}
              </div>
            )}

            {/* Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors mb-5"
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or fill in your details</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Role selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">I am a</p>
                <div className="grid grid-cols-2 gap-3">
                  {['patient', 'doctor'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${
                        role === r
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                      }`}
                    >
                      {r === 'patient' ? '🧑 Patient' : '👨‍⚕️ Doctor'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common fields */}
              <InputField
                label="Full Name"
                id="fullName"
                type="text"
                placeholder="Priya Sharma"
                value={form.fullName}
                onChange={set('fullName')}
                error={errors.fullName}
              />
              <InputField
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
                error={errors.email}
              />

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={set('password')}
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrengthBar password={form.password} />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={form.confirmPassword}
                    onChange={set('confirmPassword')}
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                    aria-label={showConfirm ? 'Hide' : 'Show'}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* ── Patient fields ── */}
              {role === 'patient' && (
                <div className="space-y-4 pt-1 border-t border-primary-50">
                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide pt-1">Patient Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Age"
                      id="age"
                      type="number"
                      min="1" max="120"
                      placeholder="25"
                      value={form.age}
                      onChange={set('age')}
                      error={errors.age}
                    />
                    <SelectField
                      label="Gender"
                      id="gender"
                      value={form.gender}
                      onChange={set('gender')}
                    >
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </SelectField>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Height (cm)"
                      id="height"
                      type="number"
                      placeholder="170"
                      value={form.height}
                      onChange={set('height')}
                    />
                    <InputField
                      label="Weight (kg)"
                      id="weight"
                      type="number"
                      placeholder="65"
                      value={form.weight}
                      onChange={set('weight')}
                    />
                  </div>
                </div>
              )}

              {/* ── Doctor fields ── */}
              {role === 'doctor' && (
                <div className="space-y-4 pt-1 border-t border-primary-50">
                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide pt-1">Doctor Details</p>
                  <SelectField
                    label="Department / Specialization"
                    id="department"
                    value={form.department}
                    onChange={set('department')}
                    error={errors.department}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </SelectField>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Years of Experience"
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={form.experience}
                      onChange={set('experience')}
                    />
                    <InputField
                      label="Location"
                      id="location"
                      type="text"
                      placeholder="Mumbai, India"
                      value={form.location}
                      onChange={set('location')}
                    />
                  </div>
                  <InputField
                    label="Hospital / Clinic Name"
                    id="hospital"
                    type="text"
                    placeholder="City Care Hospital"
                    value={form.hospital}
                    onChange={set('hospital')}
                    error={errors.hospital}
                  />
                </div>
              )}

              {/* Terms */}
              <div>
                <div className="flex items-start gap-2.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-primary-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 font-semibold hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary-600 font-semibold hover:underline">Privacy Policy</a>
                  </label>
                </div>
                {errors.agreed && <p className="mt-1 text-xs text-red-500">{errors.agreed}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm text-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account…
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?{' '}
              <a href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
