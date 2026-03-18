import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import MedicalRecordsSection from '../components/records/MedicalRecordsSection'
import MedicationList from '../components/records/MedicationList'
import MedicationEducation from '../components/records/MedicationEducation'
import LifestyleRecommendations from '../components/records/LifestyleRecommendations'
import request from '../utils/api'

export default function MedicalRecordsPage() {
  const [records, setRecords]         = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [selectedMed, setSelectedMed] = useState(null)

  useEffect(() => {
    setLoadingRecords(true)
    request('/health-records')
      .then(data => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setRecords([]))
      .finally(() => setLoadingRecords(false))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 pb-10">
      {/* ── Page Title ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Medical Records & Care</h1>
          <p className="text-xs text-gray-400">Your health records, medications, and personalised care guidance</p>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT column — Records + Medications */}
        <div className="space-y-6">
          <MedicalRecordsSection records={records} loading={loadingRecords} />
          <MedicationList onSelect={setSelectedMed} />
        </div>

        {/* RIGHT column — Education */}
        <div className="space-y-6">
          <MedicationEducation
            selected={selectedMed}
            onClose={() => setSelectedMed(null)}
          />
        </div>
      </div>

      {/* ── Full-width Lifestyle Recommendations ── */}
      <div className="mt-6">
        <LifestyleRecommendations />
      </div>
    </div>
  )
}
