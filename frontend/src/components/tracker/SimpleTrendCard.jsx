import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import { useState } from 'react'

const MOCK_WEIGHT_WEEKLY = [
  { label: 'Mon', value: 72.5 },
  { label: 'Tue', value: 72.1 },
  { label: 'Wed', value: 72.8 },
  { label: 'Thu', value: 73.0 },
  { label: 'Fri', value: 72.6 },
  { label: 'Sat', value: 72.4 },
  { label: 'Sun', value: 72.9 },
]

const MOCK_WEIGHT_MONTHLY = [
  { label: 'W1', value: 71.0 },
  { label: 'W2', value: 71.8 },
  { label: 'W3', value: 72.3 },
  { label: 'W4', value: 72.9 },
]

const MOCK_BP_WEEKLY = [
  { label: 'Mon', sys: 122, dia: 80 },
  { label: 'Tue', sys: 118, dia: 78 },
  { label: 'Wed', sys: 130, dia: 84 },
  { label: 'Thu', sys: 125, dia: 82 },
  { label: 'Fri', sys: 120, dia: 79 },
  { label: 'Sat', sys: 128, dia: 83 },
  { label: 'Sun', sys: 124, dia: 81 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#238370]/20 shadow-lg rounded-xl px-3 py-2">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
            <span className="text-xs font-normal text-gray-400 ml-1">{p.unit}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function SimpleTrendCard({ hasBP = true }) {
  const [activeChart, setActiveChart] = useState('weight')
  const [period, setPeriod] = useState('weekly')

  const weightData = period === 'weekly' ? MOCK_WEIGHT_WEEKLY : MOCK_WEIGHT_MONTHLY

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
            <TrendingUp size={16} className="text-[#238370]" />
          </div>
          <h2 className="font-semibold text-gray-800">Trends</h2>
        </div>
        {activeChart === 'weight' && (
          <div className="flex gap-1 bg-[#238370]/5 rounded-lg p-0.5">
            {['weekly', 'monthly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  period === p ? 'bg-[#238370] text-white shadow-sm' : 'text-[#238370]/60 hover:text-[#238370]'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'weight', label: 'Weight' },
          ...(hasBP ? [{ key: 'bp', label: 'Blood Pressure' }] : []),
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveChart(key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              activeChart === key
                ? 'bg-[#238370] text-white border-[#238370]'
                : 'bg-white text-[#238370]/60 border-[#238370]/20 hover:border-[#238370]/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'weight' ? (
            <LineChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#238370" strokeOpacity={0.08} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                name="Weight"
                unit="kg"
                stroke="#238370"
                strokeWidth={2.5}
                dot={{ fill: '#238370', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#238370', stroke: 'white', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <LineChart data={MOCK_BP_WEEKLY} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#238370" strokeOpacity={0.08} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[60, 150]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="sys" name="Systolic" unit="mmHg" stroke="#238370" strokeWidth={2.5} dot={{ fill: '#238370', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#238370', stroke: 'white', strokeWidth: 2 }} />
              <Line type="monotone" dataKey="dia" name="Diastolic" unit="mmHg" stroke="#1a6457" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: '#1a6457', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#1a6457', stroke: 'white', strokeWidth: 2 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-400 text-center mt-2">
        Showing {period} data · Updated today
      </p>
    </div>
  )
}
