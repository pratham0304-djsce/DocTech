import { useState } from 'react'
import { Pill, Clock, Calendar, Check, ChevronRight, RotateCcw } from 'lucide-react'

export default function MedicationCard({ med, onSelect }) {
  const [taken, setTaken] = useState(med.takenToday || false)

  const handleTaken = (e) => {
    e.stopPropagation()
    setTaken(t => !t)
  }

  return (
    <div
      onClick={() => onSelect(med)}
      className={`relative cursor-pointer rounded-2xl border transition-all duration-200 hover:shadow-md group overflow-hidden
        ${taken ? 'border-primary-200 bg-primary-50/60' : 'border-primary-100 bg-white hover:border-primary-300'}`}
    >
      {/* Taken ribbon */}
      {taken && (
        <div className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl">
          ✓ Taken
        </div>
      )}

      <div className="p-4">
        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${taken ? 'bg-primary-200' : 'bg-primary-100 group-hover:bg-primary-200'} transition-colors`}>
            <Pill className="w-5 h-5 text-primary-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{med.name}</p>
            <p className="text-xs text-primary-600 font-semibold mt-0.5">{med.dosage}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-primary-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-primary-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-primary-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500">Frequency</p>
            </div>
            <p className="text-xs font-bold text-gray-800">{med.frequency}</p>
          </div>
          <div className="bg-primary-50 rounded-xl px-3 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-primary-500" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-500">Duration</p>
            </div>
            <p className="text-xs font-bold text-gray-800">{med.duration}</p>
          </div>
        </div>

        {/* Mark as taken */}
        <button
          onClick={handleTaken}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all
            ${taken
              ? 'bg-white border border-primary-200 text-primary-600 hover:bg-primary-50'
              : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
            }`}
        >
          {taken ? (
            <><RotateCcw className="w-3.5 h-3.5" /> Mark as not taken</>
          ) : (
            <><Check className="w-3.5 h-3.5" /> Mark as taken</>
          )}
        </button>
      </div>
    </div>
  )
}
