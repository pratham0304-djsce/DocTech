import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale, HeartPulse, Weight, CalendarClock,
  Bot, ChevronRight, MapPin, Clock, User,
  TrendingUp, Activity, Pill, CalendarCheck,
  FileText, Loader2,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ReminderCard from '../components/ReminderCard'
import RecordCard from '../components/RecordCard'
import request from '../utils/api'

// ── Health tips (static) ───────────────────────────────────
const TIPS = [
  { icon: '💧', text: 'Drink at least 8 glasses of water daily to stay hydrated.' },
  { icon: '🛌', text: 'Maintain a consistent 7–8 hour sleep schedule every night.' },
  { icon: '🏃', text: '30 minutes of daily walking keeps your heart healthy.' },
  { icon: '🥦', text: 'Fill half your plate with fruits and vegetables.' },
  { icon: '🧘', text: 'Practice deep breathing or meditation to manage stress.' },
  { icon: '☀️',  text: 'Get 10–15 minutes of morning sunlight for Vitamin D.' },
]

// ── BMI helpers ────────────────────────────────────────────
const calcBMI = (h, w) => h && w ? (w / ((h / 100) ** 2)).toFixed(1) : null
const bmiLabel = (bmi) => {
  if (!bmi) return ''
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25)   return 'Normal'
  if (bmi < 30)   return 'Overweight'
  return 'Obese'
}

// ── Format datetime ────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
const fmtTime = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

// ── Health Tips Carousel ───────────────────────────────────
function HealthTipsCarousel() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TIPS.length), 4000)
    return () => clearInterval(t)
  }, [])
  const tip = TIPS[idx]
  return (
    <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 overflow-hidden flex flex-col justify-between min-h-[160px]">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
      <div className="relative z-10">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-widest mb-3">💡 AI Health Tip</p>
        <p className="text-white text-base font-medium leading-relaxed transition-all duration-500 min-h-[52px]">
          <span className="mr-2 text-xl">{tip.icon}</span>{tip.text}
        </p>
      </div>
      <div className="relative z-10 flex gap-1.5 mt-4">
        {TIPS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`} />
        ))}
      </div>
    </div>
  )
}

// ── Skeleton loader ────────────────────────────────────────
function Skeleton({ lines = 2, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

// ── Section heading ────────────────────────────────────────
function SectionHeader({ title, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-0.5 text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors">
          {linkLabel} <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────
function EmptyState({ icon: Icon, text }) {
  return (
    <div className="py-8 text-center">
      <Icon className="w-8 h-8 text-primary-200 mx-auto mb-2" />
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────
export default function PatientDashboard() {
  const [userData, setUserData]         = useState({})
  const [appointments, setAppointments] = useState([])
  const [records, setRecords]           = useState([])
  const [reminders, setReminders]       = useState([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [user, appts, recs, rems] = await Promise.allSettled([
          request('/auth/me'),
          request('/appointments?status=pending&status=confirmed'),
          request('/health-records'),
          request('/reminders'),
        ])

        if (user.status === 'fulfilled') {
          setUserData(user.value)
          // Refresh localStorage with latest user data
          const stored = JSON.parse(localStorage.getItem('doctech_user') || '{}')
          localStorage.setItem('doctech_user', JSON.stringify({
            ...stored, name: user.value.name, gender: user.value.gender, age: user.value.age,
          }))
        } else {
          // Fallback to localStorage
          try { setUserData(JSON.parse(localStorage.getItem('doctech_user') || '{}')) } catch {}
        }

        if (appts.status === 'fulfilled') setAppointments(appts.value.slice(0, 3))
        if (recs.status  === 'fulfilled') setRecords(recs.value.slice(0, 3))
        if (rems.status  === 'fulfilled') setReminders(rems.value.slice(0, 4))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const bmi = calcBMI(userData.height, userData.weight)
  const bmiStatus = bmiLabel(bmi)

  // Split reminders by type
  const medReminders     = reminders.filter(r => r.type === 'medication')
  const followupReminders = reminders.filter(r => r.type !== 'medication')

  return (
    <div className="space-y-6 pb-6">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl px-6 py-5 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-primary-200 text-xs font-medium mb-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold text-white">
              Welcome back, {userData.name || 'there'} 👋
            </h1>
            <p className="text-primary-100 text-sm mt-1">Here's your daily health overview. Stay consistent!</p>
          </div>

          {/* Quick vitals */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: 'Height', value: userData.height ? `${userData.height} cm` : '—' },
              { label: 'Weight', value: userData.weight ? `${userData.weight} kg` : '—' },
              { label: 'BMI',    value: bmi ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-center min-w-[64px]">
                <p className="text-xs text-primary-100 font-medium">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="BMI"            value={bmi ?? '—'}                       subtitle="Body Mass Index"     icon={Scale}        trend={bmiStatus || 'N/A'} />
        <StatCard title="Blood Pressure" value="118/76 mmHg"                      subtitle="Last checked today"  icon={HeartPulse}   trend="good" />
        <StatCard title="Weight"         value={userData.weight ? `${userData.weight} kg` : '—'} subtitle="From your profile"  icon={Weight}       trend="good" />
        <StatCard title="Last Login"     value="Today"                             subtitle={new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} icon={CalendarClock} />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT col (spans 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Upcoming Appointments" linkTo="/patient/appointments" linkLabel="View all" />
            {loading ? <Skeleton lines={2} /> : appointments.length === 0
              ? <EmptyState icon={CalendarCheck} text="No upcoming appointments" />
              : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <div key={apt._id} className="flex items-start gap-4 p-4 rounded-xl bg-primary-50/60 border border-primary-100 hover:bg-primary-50 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Dr. {apt.doctor?.name || 'Unknown'}</p>
                        <p className="text-xs text-primary-600 font-medium mb-1.5">{apt.doctor?.department || apt.reason || ''}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-400" /> {fmtDate(apt.datetime)}, {fmtTime(apt.datetime)}</span>
                          {apt.doctor?.hospital && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400" /> {apt.doctor.hospital}</span>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full capitalize">
                        {apt.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          {/* Recent Medical Records */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Recent Medical Records & Care" linkTo="/patient/records" linkLabel="View all" />
            {loading ? <Skeleton lines={3} /> : records.length === 0
              ? <EmptyState icon={FileText} text="No records uploaded yet" />
              : (
                <div className="space-y-2.5">
                  {records.map((r) => (
                    <RecordCard
                      key={r._id}
                      filename={r.title || r.filename || 'Untitled'}
                      date={r.date ? new Date(r.date).toLocaleDateString('en-IN') : ''}
                      type={r.type || r.recordType || 'Record'}
                    />
                  ))}
                </div>
              )
            }
          </div>

          {/* AI Chatbot CTA */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">AI Health Assistant</h3>
              <p className="text-xs text-gray-500 mt-0.5">Describe your symptoms and get instant AI-powered medical guidance.</p>
            </div>
            <Link to="/patient/ai-bot"
              className="shrink-0 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
              Start Chat →
            </Link>
          </div>
        </div>

        {/* RIGHT col */}
        <div className="space-y-6">

          {/* Medication Reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Medication Reminders" linkTo="/patient/profile" linkLabel="All" />
            {loading ? <Skeleton lines={2} /> : medReminders.length === 0
              ? <EmptyState icon={Pill} text="No medication reminders" />
              : (
                <div className="space-y-2.5">
                  {medReminders.map((m) => (
                    <ReminderCard key={m._id} title={m.title} subtitle={m.notes || ''} time={fmtTime(m.datetime)} type="medication" />
                  ))}
                </div>
              )
            }
          </div>

          {/* Follow-up Reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Follow-up Reminders" />
            {loading ? <Skeleton lines={2} /> : followupReminders.length === 0
              ? <EmptyState icon={CalendarClock} text="No follow-up reminders" />
              : (
                <div className="space-y-2.5">
                  {followupReminders.map((f) => (
                    <ReminderCard key={f._id} title={f.title} subtitle={f.notes || ''} time={fmtDate(f.datetime)} type={f.type || 'appointment'} />
                  ))}
                </div>
              )
            }
          </div>

          {/* Health Tips */}
          <HealthTipsCarousel />

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Activity,      label: 'Track Health', to: '/patient/tracker' },
                { icon: Pill,          label: 'Profile',      to: '/patient/profile' },
                { icon: CalendarCheck, label: 'Appointments', to: '/patient/appointments' },
                { icon: TrendingUp,    label: 'Records',      to: '/patient/records' },
              ].map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors group">
                  <Icon className="w-5 h-5 text-primary-600 group-hover:text-primary-700" />
                  <span className="text-xs font-semibold text-primary-700 text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
