import { FileText, Eye } from 'lucide-react'

const TYPE_COLORS = {
  'Lab Report':   'bg-primary-50 text-primary-700',
  'X-Ray':        'bg-primary-100 text-primary-800',
  'MRI':          'bg-primary-200/60 text-primary-900',
  'Prescription': 'bg-primary-700/10 text-primary-800',
  'CT Scan':      'bg-primary-300/30 text-primary-800',
  'Ultrasound':   'bg-primary-50 text-primary-600',
}

export default function RecordCard({ filename, date, type, onView }) {
  const badge = TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'
  return (
    <div className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow">
      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{filename}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>{type}</span>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
      </div>
      <button
        onClick={onView}
        className="flex items-center gap-1 text-xs text-primary-600 font-medium hover:text-primary-800 transition-colors shrink-0"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>
    </div>
  )
}
