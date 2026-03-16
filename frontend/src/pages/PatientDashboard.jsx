import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale, HeartPulse, Weight, CalendarClock,
  Bot, ChevronRight, MapPin, Clock, User,
  TrendingUp, Activity, Pill, CalendarCheck,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import ReminderCard from '../components/ReminderCard'
import RecordCard from '../components/RecordCard'

// ── Mock data ──────────────────────────────────────────────
const PATIENT = { name: 'John', height: 175, weight: 72 }
const calcBMI  = (h, w) => (w / ((h / 100) ** 2)).toFixed(1)
const bmi      = calcBMI(PATIENT.height, PATIENT.weight)

const APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Priya Sharma', dept: 'Cardiology',  date: 'Mon, 17 Mar', time: '10:30 AM', location: 'City Care Hospital' },
  { id: 2, doctor: 'Dr. Arjun Mehta',  dept: 'Neurology',   date: 'Wed, 19 Mar', time: '02:00 PM', location: 'MedLife Clinic' },
]

const RECORDS = [
  { id: 1, filename: 'Blood_Report_Mar2026.pdf', date: '14 Mar 2026', type: 'Lab Report' },
  { id: 2, filename: 'Chest_XRay_Jan2026.jpg',  date: '10 Jan 2026', type: 'X-Ray' },
  { id: 3, filename: 'Brain_MRI_Dec2025.dcm',   date: '02 Dec 2025', type: 'MRI' },
]

const MEDICATIONS = [
  { id: 1, title: 'Metformin 500mg',  subtitle: '1 tablet after meal', time: '08:00 AM' },
  { id: 2, title: 'Omega-3 capsule',  subtitle: '2 capsules daily',    time: '01:00 PM' },
]

const FOLLOWUPS = [
  { id: 1, title: 'Cardiology follow-up', subtitle: 'Dr. Priya Sharma', time: '17 Mar', type: 'appointment' },
  { id: 2, title: 'Annual blood check',   subtitle: 'Recommended by GP', time: '31 Mar', type: 'appointment' },
]

const TIPS = [
  { icon: '💧', text: 'Drink at least 8 glasses of water daily to stay hydrated.' },
  { icon: '🛌', text: 'Maintain a consistent 7–8 hour sleep schedule every night.' },
  { icon: '🏃', text: '30 minutes of daily walking keeps your heart healthy.' },
  { icon: '🥦', text: 'Fill half your plate with fruits and vegetables.' },
  { icon: '🧘', text: 'Practice deep breathing or meditation to manage stress.' },
  { icon: '☀️',  text: 'Get 10–15 minutes of morning sunlight for Vitamin D.' },
]

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
      {/* Decorative blobs */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative z-10">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-widest mb-3">💡 AI Health Tip</p>
        <p className="text-white text-base font-medium leading-relaxed transition-all duration-500 min-h-[52px]">
          <span className="mr-2 text-xl">{tip.icon}</span>{tip.text}
        </p>
      </div>

      {/* Dot indicators */}
      <div className="relative z-10 flex gap-1.5 mt-4">
        {TIPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-5 bg-white' : 'w-1.5 bg-white/30'}`}
          />
        ))}
      </div>
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

// ── Main Dashboard ─────────────────────────────────────────
export default function PatientDashboard() {
  const bmiStatus = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'good' : bmi < 30 ? 'Overweight' : 'Obese'

  return (
    <div className="space-y-6 pb-6">

      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl px-6 py-5 overflow-hidden">
        {/* background decoration */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-24 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-primary-200 text-xs font-medium mb-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <h1 className="text-2xl font-extrabold text-white">Welcome back, {PATIENT.name} 👋</h1>
            <p className="text-primary-100 text-sm mt-1">Here's your daily health overview. Stay consistent!</p>
          </div>

          {/* Quick vitals */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: 'Height', value: `${PATIENT.height} cm` },
              { label: 'Weight', value: `${PATIENT.weight} kg` },
              { label: 'BMI',    value: bmi },
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
        <StatCard title="BMI"            value={bmi}                 subtitle="Body Mass Index"  icon={Scale}       trend={bmiStatus} />
        <StatCard title="Blood Pressure" value="118/76 mmHg"         subtitle="Last checked today" icon={HeartPulse}  trend="good" />
        <StatCard title="Weight"         value={`${PATIENT.weight} kg`} subtitle="−0.5 kg this week" icon={Weight}    trend="good" />
        <StatCard title="Last Update"    value="Today"               subtitle="Mar 16, 2026"    icon={CalendarClock} />
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT col (spans 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Upcoming Appointments" linkTo="/patient/appointments" linkLabel="View all" />
            <div className="space-y-3">
              {APPOINTMENTS.map((apt) => (
                <div key={apt.id} className="flex items-start gap-4 p-4 rounded-xl bg-primary-50/60 border border-primary-100 hover:bg-primary-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{apt.doctor}</p>
                    <p className="text-xs text-primary-600 font-medium mb-1.5">{apt.dept}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary-400" /> {apt.date}, {apt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400" /> {apt.location}</span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-primary-600 bg-primary-100 px-2.5 py-1 rounded-full">Upcoming</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Medical Records */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Recent Medical Records" linkTo="/patient/records" linkLabel="View all" />
            <div className="space-y-2.5">
              {RECORDS.map((r) => (
                <RecordCard key={r.id} filename={r.filename} date={r.date} type={r.type} />
              ))}
            </div>
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
            <Link
              to="/patient/ai-bot"
              className="shrink-0 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap"
            >
              Start Chat →
            </Link>
          </div>
        </div>

        {/* RIGHT col */}
        <div className="space-y-6">

          {/* Medication Reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Medication Reminders" linkTo="/patient/reminders" linkLabel="All" />
            <div className="space-y-2.5">
              {MEDICATIONS.map((m) => (
                <ReminderCard key={m.id} title={m.title} subtitle={m.subtitle} time={m.time} type="medication" />
              ))}
            </div>
          </div>

          {/* Follow-up Reminders */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Follow-up Reminders" />
            <div className="space-y-2.5">
              {FOLLOWUPS.map((f) => (
                <ReminderCard key={f.id} title={f.title} subtitle={f.subtitle} time={f.time} type={f.type} />
              ))}
            </div>
          </div>

          {/* Health Tips */}
          <HealthTipsCarousel />

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Activity,      label: 'Track Health', to: '/patient/tracker' },
                { icon: Pill,          label: 'Reminders',    to: '/patient/reminders' },
                { icon: CalendarCheck, label: 'Appointments', to: '/patient/appointments' },
                { icon: TrendingUp,    label: 'Records',      to: '/patient/records' },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors group"
                >
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
