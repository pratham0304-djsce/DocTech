import { Heart, Calendar, Info } from 'lucide-react'
import { useState, useMemo } from 'react'

const predictNextPeriod = (lastDate, cycleLength) => {
  if (!lastDate) return null
  const last = new Date(lastDate)
  const cycle = parseInt(cycleLength) || 28
  const next = new Date(last)
  next.setDate(next.getDate() + cycle)
  return next
}

const formatDate = (date) => {
  if (!date) return '—'
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getDaysUntil = (date) => {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
  return diff
}

export default function MenstrualTrackerCard() {
  const [lastPeriod, setLastPeriod] = useState('')
  const [cycleLength, setCycleLength] = useState('')

  const nextPeriod = useMemo(() => predictNextPeriod(lastPeriod, cycleLength), [lastPeriod, cycleLength])
  const daysUntil = getDaysUntil(nextPeriod)

  const phaseInfo = useMemo(() => {
    if (!lastPeriod) return null
    const daysSince = getDaysUntil(new Date(lastPeriod)) * -1
    const len = parseInt(cycleLength) || 28
    if (daysSince <= 5) return { phase: 'Menstrual', color: 'text-[#238370]' }
    if (daysSince <= 13) return { phase: 'Follicular', color: 'text-[#1a6457]' }
    if (daysSince <= 16) return { phase: 'Ovulation', color: 'text-[#238370]' }
    if (daysSince <= len) return { phase: 'Luteal', color: 'text-[#124038]' }
    return null
  }, [lastPeriod, cycleLength])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
          <Heart size={16} className="text-[#238370]" />
        </div>
        <h2 className="font-semibold text-gray-800">Menstrual Tracker</h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Last Period Date</label>
          <input
            type="date"
            value={lastPeriod}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setLastPeriod(e.target.value)}
            className="w-full rounded-xl border border-[#238370]/20 bg-[#238370]/5 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#238370]/30 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Cycle Length <span className="text-[#238370]/50 font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={cycleLength}
              onChange={e => setCycleLength(e.target.value)}
              placeholder="28"
              min="21"
              max="45"
              className="w-full rounded-xl border border-[#238370]/20 bg-[#238370]/5 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#238370]/30 transition-all placeholder:text-gray-300"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#238370]/50 font-medium">days</span>
          </div>
        </div>
      </div>

      {nextPeriod ? (
        <div className="mt-4 space-y-2">
          <div className="p-4 rounded-xl bg-[#238370]/5 border border-[#238370]/10">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-[#238370] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Next Period Predicted</p>
                <p className="text-sm font-semibold text-gray-700">{formatDate(nextPeriod)}</p>
                {daysUntil !== null && (
                  <p className="text-xs text-[#238370] font-medium mt-0.5">
                    {daysUntil > 0
                      ? `In ${daysUntil} days`
                      : daysUntil === 0
                        ? 'Expected today'
                        : `${Math.abs(daysUntil)} days late`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>

          {phaseInfo && (
            <div className="p-3 rounded-xl bg-[#238370]/5 flex items-center gap-2">
              <span className="text-sm">🌸</span>
              <div>
                <p className="text-xs text-gray-400">Current Phase</p>
                <p className={`text-sm font-medium ${phaseInfo.color}`}>{phaseInfo.phase} Phase</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
          <Heart size={28} className="text-[#238370]/30 mb-2" />
          <p className="text-sm text-gray-400">Enter your last period date to see predictions</p>
        </div>
      )}

      <div className="flex items-start gap-2 mt-3">
        <Info size={12} className="text-[#238370]/40 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-[#238370]/40">Predictions are estimates based on a regular cycle.</p>
      </div>
    </div>
  )
}
