import { useState } from 'react'
import { Calendar, ChevronRight, Activity, RefreshCw } from 'lucide-react'

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function fmt(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysFrom(dateStr) {
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? 'text-primary-600' : 'text-gray-800'}`}>{value}</p>
    </div>
  )
}

export default function MenstrualTracker() {
  const [startDate, setStartDate] = useState('2026-03-01')
  const [cycleLength, setCycleLength] = useState(28)

  const nextPeriod = addDays(startDate, cycleLength)
  const ovulation = addDays(startDate, cycleLength - 14)
  const pmsStart = addDays(startDate, cycleLength - 5)
  const daysToNext = daysFrom(nextPeriod.toISOString().split('T')[0])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary-50 rounded-xl">
          <Activity className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Menstrual Cycle Tracker</h3>
          <p className="text-xs text-gray-400">Predictions based on your cycle data</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Last Period Start
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-9"
            />
            <Calendar className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Cycle Length (days)
          </label>
          <input
            type="number"
            min={20}
            max={40}
            value={cycleLength}
            onChange={e => setCycleLength(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Countdown pill */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-4 text-center mb-5 shadow-sm">
        <p className="text-white/80 text-xs font-medium mb-1">Next Period In</p>
        <p className="text-3xl font-extrabold text-white">
          {daysToNext > 0 ? daysToNext : 0}
          <span className="text-base font-semibold ml-1">days</span>
        </p>
        <p className="text-white/70 text-xs mt-1">{fmt(nextPeriod)}</p>
      </div>

      {/* Prediction rows */}
      <div className="bg-primary-50/50 rounded-xl px-4 py-1">
        <InfoRow label="🩸 Next Period" value={fmt(nextPeriod)} highlight />
        <InfoRow label="🥚 Ovulation Day" value={fmt(ovulation)} highlight />
        <InfoRow label="⚡ PMS Starts" value={fmt(pmsStart)} />
        <InfoRow label="📅 Cycle Length" value={`${cycleLength} days`} />
      </div>

      {/* Reset */}
      <button
        onClick={() => { setStartDate(new Date().toISOString().split('T')[0]); setCycleLength(28) }}
        className="flex items-center gap-1.5 mt-4 text-xs text-gray-400 hover:text-primary-600 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset to defaults
      </button>
    </div>
  )
}
