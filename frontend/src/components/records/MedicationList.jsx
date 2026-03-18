import MedicationCard from './MedicationCard'
import { Pill, Loader2 } from 'lucide-react'

// Default placeholder medications shown when no real data yet
const MOCK_MEDS = [
  { id: 1, name: 'Paracetamol',   dosage: '500 mg', frequency: 'Twice daily',  duration: '5 days',  prescribed: 'Dr. Anita Rao' },
  { id: 2, name: 'Amoxicillin',   dosage: '250 mg', frequency: 'Thrice daily', duration: '7 days',  prescribed: 'Dr. Raj Kapoor' },
  { id: 3, name: 'Vitamin D3',    dosage: '1000 IU', frequency: 'Once daily',  duration: '30 days', prescribed: 'Dr. Priya Singh' },
  { id: 4, name: 'Omega-3',       dosage: '1 g',    frequency: 'Twice daily',  duration: 'Ongoing', prescribed: 'Dr. Meena Patel' },
]

export default function MedicationList({ medications, loading = false, onSelect }) {
  const meds = medications?.length ? medications : MOCK_MEDS

  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-primary-50">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
          <Pill className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">Prescriptions & Medications</h2>
          <p className="text-[11px] text-gray-400">{meds.length} active medications</p>
        </div>
      </div>

      {/* Grid */}
      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meds.map((med, i) => (
              <MedicationCard key={med._id || med.id || i} med={med} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
