import { FileText, Upload } from 'lucide-react'

export default function UploadReportButton({ onUpload }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Medical Context</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Attach a recent lab report or prescription to give the AI better context for analysis.
      </p>

      <button 
        onClick={onUpload}
        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-600 hover:text-primary-600 py-3 rounded-xl transition-all font-medium text-sm group"
      >
        <Upload className="h-4 w-4 group-hover:-translate-y-1 transition-transform" />
        Upload Report
      </button>
    </div>
  )
}
