import { useState } from 'react'
import {
  FileText, FlaskConical, ScanLine, Stethoscope, ClipboardList,
  Eye, Download, Share2, ChevronDown, ChevronUp, Loader2, Upload,
} from 'lucide-react'

const TYPE_META = {
  lab:          { label: 'Lab Report',     icon: FlaskConical,   color: 'bg-primary-50 text-primary-700' },
  imaging:      { label: 'Imaging',        icon: ScanLine,       color: 'bg-primary-50 text-primary-700' },
  consultation: { label: 'Consultation',   icon: Stethoscope,    color: 'bg-primary-50 text-primary-700' },
  diagnosis:    { label: 'Diagnosis',      icon: ClipboardList,  color: 'bg-primary-50 text-primary-700' },
  prescription: { label: 'Prescription',   icon: FileText,       color: 'bg-primary-50 text-primary-700' },
  report:       { label: 'Report',         icon: FileText,       color: 'bg-primary-50 text-primary-700' },
}

const FILTERS = ['All', 'Lab', 'Imaging', 'Consultation', 'Diagnosis', 'Prescription']

function RecordRow({ record }) {
  const meta = TYPE_META[record.type] || TYPE_META.report
  const Icon = meta.icon
  const dateStr = record.date
    ? new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-primary-100 bg-white hover:shadow-md transition-shadow group">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-700" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{record.title || 'Untitled Record'}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span>
          {record.doctor && <span className="text-xs text-gray-400">· {record.doctor}</span>}
          <span className="text-xs text-gray-400">· {dateStr}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {record.fileUrl && (
          <>
            <a href={record.fileUrl} target="_blank" rel="noreferrer"
              className="p-2 rounded-xl hover:bg-primary-50 text-primary-600 transition-colors" title="View">
              <Eye className="w-4 h-4" />
            </a>
            <a href={record.fileUrl} download
              className="p-2 rounded-xl hover:bg-primary-50 text-primary-600 transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </a>
          </>
        )}
        <button
          onClick={() => navigator.share?.({ title: record.title, url: record.fileUrl || window.location.href })}
          className="p-2 rounded-xl hover:bg-primary-50 text-primary-600 transition-colors" title="Share">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function MedicalRecordsSection({ records = [], loading = false }) {
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(true)

  const filtered = filter === 'All'
    ? records
    : records.filter(r => r.type?.toLowerCase() === filter.toLowerCase())

  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Medical Records</h2>
            <p className="text-[11px] text-gray-400">{records.length} records on file</p>
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)} className="p-1 hover:bg-primary-50 rounded-lg transition-colors">
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {expanded && (
        <>
          {/* Filter tabs */}
          <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none border-b border-primary-50">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="p-5 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-8 h-8 text-primary-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No {filter !== 'All' ? filter.toLowerCase() : ''} records found</p>
                <p className="text-xs text-gray-300 mt-1">Records uploaded via your Profile page appear here</p>
              </div>
            ) : (
              filtered.map((r, i) => <RecordRow key={r._id || i} record={r} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}
