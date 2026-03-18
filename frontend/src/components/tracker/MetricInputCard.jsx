import { Save, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const InputField = ({ label, value, onChange, placeholder, unit, type = 'number', optional = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">
      {label} {optional && <span className="text-[#238370]/50 font-normal">(optional)</span>}
    </label>
    <div className="relative flex items-center">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#238370]/20 bg-[#238370]/5 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#238370]/30 focus:border-[#238370]/40 transition-all placeholder:text-gray-300"
      />
      {unit && (
        <span className="absolute right-3 text-xs text-[#238370]/50 font-medium">{unit}</span>
      )}
    </div>
  </div>
)

export default function MetricInputCard({ metrics, setMetrics, onSave }) {
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
          <Save size={16} className="text-[#238370]" />
        </div>
        <h2 className="font-semibold text-gray-800">Log Metrics</h2>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Weight"
            value={metrics.weight}
            onChange={v => setMetrics(m => ({ ...m, weight: v }))}
            placeholder="70"
            unit="kg"
          />
          <InputField
            label="Height"
            value={metrics.height}
            onChange={v => setMetrics(m => ({ ...m, height: v }))}
            placeholder="170"
            unit="cm"
          />
        </div>

        <InputField
          label="Blood Pressure"
          value={metrics.bp}
          onChange={v => setMetrics(m => ({ ...m, bp: v }))}
          placeholder="120/80"
          unit="mmHg"
          type="text"
          optional
        />

        <InputField
          label="Blood Sugar"
          value={metrics.bloodSugar}
          onChange={v => setMetrics(m => ({ ...m, bloodSugar: v }))}
          placeholder="90"
          unit="mg/dL"
          optional
        />
      </div>

      <button
        onClick={handleSave}
        className={`mt-5 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
          saved
            ? 'bg-[#238370]/20 text-[#238370]'
            : 'bg-[#238370] text-white hover:bg-[#1a6457] active:scale-95'
        }`}
      >
        {saved ? '✓ Saved!' : 'Save Metrics'}
      </button>
    </div>
  )
}
