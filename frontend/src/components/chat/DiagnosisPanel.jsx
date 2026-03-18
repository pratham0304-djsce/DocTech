import { Stethoscope, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DiagnosisPanel({ symptoms = [] }) {
  if (symptoms.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Analysis</h3>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          Describe your symptoms in the chat to receive an instant AI analysis and triage recommendation.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 rounded-lg relative">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Potential Triage</h3>
          <p className="text-xs text-gray-400">Based on your symptoms</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Noted Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((sym, i) => (
              <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 text-sm rounded-full border border-gray-100">
                {sym}
              </span>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm text-amber-800 font-medium mb-1">Recommendation</p>
          <p className="text-xs text-amber-700">
            Based on your description, a consultation with a General Physician is recommended within the next 48 hours.
          </p>
        </div>
      </div>

      <Link 
        to="/patient/doctor-finder"
        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm shadow-primary-200"
      >
        <Stethoscope className="h-4 w-4" />
        Find a Doctor
      </Link>
    </div>
  )
}
