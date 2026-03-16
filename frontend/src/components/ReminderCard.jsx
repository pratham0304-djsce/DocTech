import { useState } from 'react'
import { Check, Clock } from 'lucide-react'

export default function ReminderCard({ title, subtitle, time, type = 'medication', onDone }) {
  const [done, setDone] = useState(false)

  const handle = () => {
    setDone(true)
    onDone && onDone()
  }

  const typeColor = type === 'medication'
    ? 'bg-primary-50 border-primary-100 text-primary-700'
    : 'bg-primary-800/10 border-primary-200 text-primary-800'

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${typeColor} transition-opacity ${done ? 'opacity-50' : ''}`}>
      <button
        onClick={handle}
        disabled={done}
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
          ${done ? 'bg-primary-500 border-primary-500' : 'border-primary-300 hover:border-primary-500'}`}
      >
        {done && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{title}</p>
        {subtitle && <p className="text-xs text-gray-500 truncate">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
        <Clock className="w-3 h-3" />
        <span>{time}</span>
      </div>
    </div>
  )
}
