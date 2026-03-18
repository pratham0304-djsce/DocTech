import { useState } from 'react'
import { ListFilter, ChevronDown } from 'lucide-react'
import RecordCard from './RecordCard'

const ALL_TYPES = ['all', 'diagnosis', 'report', 'prescription', 'consultation', 'lab', 'imaging']

const TYPE_LABELS = {
  all: 'All Records',
  diagnosis: 'Diagnoses',
  report: 'Medical Reports',
  prescription: 'Prescriptions',
  consultation: 'Consultations',
  lab: 'Lab Results',
  imaging: 'Imaging',
}

export default function EHRSection({ records = [] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? records
    : records.filter(r => r.type === activeFilter)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-primary-50 rounded-xl">
          <ListFilter className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base">Electronic Health Records</h3>
          <p className="text-xs text-gray-400">{records.length} total records</p>
        </div>
      </div>

      {/* Filter tabs — horizontal scroll on mobile */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {ALL_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeFilter === type
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Records grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((record, i) => (
            <RecordCard
              key={i}
              {...record}
              onView={() => alert(`Viewing: ${record.title}`)}
              onDownload={() => alert(`Downloading: ${record.title}`)}
              onShare={() => alert(`Sharing: ${record.title}`)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ListFilter className="w-6 h-6 text-primary-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No records found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different filter category</p>
        </div>
      )}
    </div>
  )
}
