import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const getBMICategory = (bmi) => {
  if (!bmi) return null
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-teal-400', bg: 'bg-teal-50' }
  if (bmi < 25)   return { label: 'Normal', color: 'text-[#238370]', bg: 'bg-[#238370]/10' }
  if (bmi < 30)   return { label: 'Overweight', color: 'text-[#1a6457]', bg: 'bg-[#238370]/20' }
  return { label: 'Obese', color: 'text-[#124038]', bg: 'bg-[#238370]/30' }
}

const BMIGauge = ({ bmi }) => {
  const pct = bmi ? Math.min(Math.max(((bmi - 10) / 30) * 100, 0), 100) : 0
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-[#238370]/60 mb-1">
        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-[#238370]/10 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="h-full bg-teal-300/60 rounded-l-full" style={{ width: '28%' }} />
          <div className="h-full bg-[#238370]/50" style={{ width: '24%' }} />
          <div className="h-full bg-[#1a6457]/60" style={{ width: '19%' }} />
          <div className="h-full bg-[#124038]/50 rounded-r-full" style={{ width: '29%' }} />
        </div>
        {bmi && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-[#238370] shadow-md transition-all duration-500"
            style={{ left: `calc(${pct}% - 8px)` }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-[#238370]/50 mt-1">
        <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
      </div>
    </div>
  )
}

export default function HealthSummaryCard({ weight, height, bmi }) {
  const cat = getBMICategory(bmi)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
          <Activity size={16} className="text-[#238370]" />
        </div>
        <h2 className="font-semibold text-gray-800">Health Summary</h2>
      </div>

      {bmi ? (
        <>
          <div className="flex items-end gap-4 mb-1">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">BMI</p>
              <p className="text-4xl font-bold text-[#238370]">{bmi}</p>
            </div>
            {cat && (
              <span className={`mb-1.5 px-3 py-1 rounded-full text-xs font-medium ${cat.bg} ${cat.color}`}>
                {cat.label}
              </span>
            )}
          </div>
          <BMIGauge bmi={parseFloat(bmi)} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {weight && (
              <div className="rounded-xl bg-[#238370]/5 p-3">
                <p className="text-xs text-gray-400 mb-0.5">Weight</p>
                <p className="text-lg font-semibold text-gray-700">{weight} <span className="text-sm font-normal text-gray-400">kg</span></p>
              </div>
            )}
            {height && (
              <div className="rounded-xl bg-[#238370]/5 p-3">
                <p className="text-xs text-gray-400 mb-0.5">Height</p>
                <p className="text-lg font-semibold text-gray-700">{height} <span className="text-sm font-normal text-gray-400">cm</span></p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#238370]/10 flex items-center justify-center mb-3">
            <Activity size={22} className="text-[#238370]/50" />
          </div>
          <p className="text-gray-400 text-sm">Enter weight and height to see your BMI</p>
        </div>
      )}
    </div>
  )
}
