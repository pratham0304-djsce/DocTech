import {
  FileText, FlaskConical, Image, Pill, Stethoscope, ClipboardList,
  Eye, Download, Share2, Calendar, User
} from 'lucide-react'

const TYPE_CONFIG = {
  diagnosis:     { label: 'Diagnosis',      icon: Stethoscope,   color: 'text-primary-600', bg: 'bg-primary-50' },
  report:        { label: 'Medical Report', icon: FileText,       color: 'text-primary-600', bg: 'bg-primary-50' },
  prescription:  { label: 'Prescription',   icon: Pill,           color: 'text-primary-600', bg: 'bg-primary-50' },
  consultation:  { label: 'Consultation',   icon: ClipboardList,  color: 'text-primary-600', bg: 'bg-primary-50' },
  lab:           { label: 'Lab Result',     icon: FlaskConical,   color: 'text-primary-600', bg: 'bg-primary-50' },
  imaging:       { label: 'Imaging',        icon: Image,          color: 'text-primary-600', bg: 'bg-primary-50' },
}

export default function RecordCard({ title, date, type = 'report', doctor, onView, onDownload, onShare }) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.report
  const Icon = config.icon

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-4 flex flex-col gap-3">
      {/* Top: icon + title + type badge */}
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${config.bg} shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
          <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-[11px] font-semibold rounded-full">
            {config.label}
          </span>
        </div>
      </div>

      {/* Meta: date + doctor */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-primary-400" />
          {date}
        </div>
        {doctor && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5 text-primary-400" />
            {doctor}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
        <button
          onClick={onView}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>
    </div>
  )
}
