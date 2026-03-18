import { Bell, CheckCircle, Circle, Clock } from 'lucide-react'
import { useState } from 'react'

const DEFAULT_REMINDERS = [
  { id: 1, text: 'Log your weight', frequency: 'Weekly', done: false, icon: '⚖️' },
  { id: 2, text: 'Check blood pressure', frequency: 'Weekly', done: false, icon: '🩺', conditional: true },
  { id: 3, text: 'Log blood sugar levels', frequency: 'Daily', done: false, icon: '🩸' },
  { id: 4, text: 'Stay hydrated — drink 8 glasses of water', frequency: 'Daily', done: false, icon: '💧' },
]

export default function ReminderCard({ hasBP = true }) {
  const [reminders, setReminders] = useState(
    DEFAULT_REMINDERS.filter(r => !r.conditional || hasBP)
  )

  const toggle = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r))
  }

  const pending = reminders.filter(r => !r.done)
  const done = reminders.filter(r => r.done)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#238370]/10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#238370]/10 flex items-center justify-center">
            <Bell size={16} className="text-[#238370]" />
          </div>
          <h2 className="font-semibold text-gray-800">Reminders</h2>
        </div>
        {pending.length > 0 && (
          <span className="text-xs text-white bg-[#238370] px-2 py-0.5 rounded-full font-medium">
            {pending.length} pending
          </span>
        )}
      </div>

      <div className="space-y-2">
        {pending.map(r => (
          <button
            key={r.id}
            onClick={() => toggle(r.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#238370]/15 bg-[#238370]/5 hover:bg-[#238370]/10 transition-all group text-left"
          >
            <Circle size={18} className="text-[#238370]/40 flex-shrink-0 group-hover:text-[#238370] transition-colors" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{r.icon} {r.text}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock size={10} className="text-gray-400" />
                <p className="text-xs text-gray-400">{r.frequency}</p>
              </div>
            </div>
          </button>
        ))}

        {done.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#238370]/10 space-y-2">
            <p className="text-xs text-gray-400 font-medium px-1">Completed</p>
            {done.map(r => (
              <button
                key={r.id}
                onClick={() => toggle(r.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 text-left opacity-60 hover:opacity-80 transition-opacity"
              >
                <CheckCircle size={18} className="text-[#238370] flex-shrink-0" />
                <p className="text-sm text-gray-400 line-through">{r.icon} {r.text}</p>
              </button>
            ))}
          </div>
        )}

        {pending.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CheckCircle size={28} className="text-[#238370] mb-2 opacity-60" />
            <p className="text-sm text-gray-500 font-medium">All done for today!</p>
            <p className="text-xs text-gray-400 mt-0.5">Great job keeping up with your health</p>
          </div>
        )}
      </div>
    </div>
  )
}
