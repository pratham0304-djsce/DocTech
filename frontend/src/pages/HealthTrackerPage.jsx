import { useState, useMemo } from 'react'
import HealthSummaryCard from '../components/tracker/HealthSummaryCard'
import MetricInputCard from '../components/tracker/MetricInputCard'
import SimpleTrendCard from '../components/tracker/SimpleTrendCard'
import AIInsightCard from '../components/tracker/AIInsightCard'
import ReminderCard from '../components/tracker/ReminderCard'
import MenstrualTrackerCard from '../components/tracker/MenstrualTrackerCard'
import { Activity } from 'lucide-react'

const calculateBMI = (weight, height) => {
  const w = parseFloat(weight)
  const h = parseFloat(height) / 100
  if (!w || !h || h <= 0) return null
  return (w / (h * h)).toFixed(1)
}

const SectionHeading = ({ title, desc }) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
  </div>
)

export default function HealthTrackerPage() {
  const [metrics, setMetrics] = useState({
    weight: '',
    height: '',
    bp: '',
    bloodSugar: '',
  })
  const [savedMetrics, setSavedMetrics] = useState(null)

  const bmi = useMemo(() => calculateBMI(metrics.weight, metrics.height), [metrics.weight, metrics.height])
  const hasBP = Boolean(savedMetrics?.bp)

  const handleSave = () => {
    setSavedMetrics({ ...metrics, bmi })
  }

  const displayMetrics = savedMetrics || metrics

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#238370] flex items-center justify-center shadow-sm">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Health Tracker</h1>
              <p className="text-xs text-gray-400">Track your metrics and stay on top of your health</p>
            </div>
          </div>
        </div>

        {/* ── Section 1: Basic Health Metrics ── */}
        <section className="mb-8">
          <SectionHeading
            title="Basic Health Metrics"
            desc="Log your daily health readings"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricInputCard
              metrics={metrics}
              setMetrics={setMetrics}
              onSave={handleSave}
            />
            <HealthSummaryCard
              weight={displayMetrics.weight}
              height={displayMetrics.height}
              bmi={bmi}
            />
          </div>
        </section>

        {/* ── Section 2: Simple Trends ── */}
        <section className="mb-8">
          <SectionHeading
            title="Simple Trends"
            desc="Your weekly and monthly health patterns"
          />
          <div className="grid grid-cols-1">
            <SimpleTrendCard hasBP={hasBP || Boolean(metrics.bp)} />
          </div>
        </section>

        {/* ── Section 3: AI Insights ── */}
        <section className="mb-8">
          <SectionHeading
            title="AI Insights"
            desc="Personalized observations based on your data"
          />
          <div className="grid grid-cols-1">
            <AIInsightCard metrics={{ bmi, bp: displayMetrics.bp }} />
          </div>
        </section>

        {/* ── Sections 4 & 5: Reminders + Menstrual ── */}
        <section className="mb-8">
          <SectionHeading
            title="Reminders & Cycle Tracker"
            desc="Stay consistent and track your menstrual health"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ReminderCard hasBP={hasBP || Boolean(metrics.bp)} />
            <MenstrualTrackerCard />
          </div>
        </section>

      </div>
    </div>
  )
}
