import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import ProfileHeader from '../components/profile/ProfileHeader'
import EHRSection from '../components/profile/EHRSection'
import MenstrualTracker from '../components/profile/MenstrualTracker'
import ReminderSection from '../components/profile/ReminderSection'
import request from '../utils/api'

// ─── Helpers ───────────────────────────────────────────
function buildPatientFromAPI(apiUser) {
  return {
    id: 'PT-' + (apiUser._id || '').slice(-8),
    name:            apiUser.name     || '',
    age:             apiUser.age      || null,
    gender:          apiUser.gender   || null,
    height:          apiUser.height   || null,
    weight:          apiUser.weight   || null,
    bloodGroup:      apiUser.bloodGroup || 'Unknown',
    allergies:       apiUser.allergies       || [],
    chronicDiseases: apiUser.chronicDiseases || [],
    familyHistory:   apiUser.familyHistory   || [],
    personalHistory: apiUser.personalHistory || '',
  }
}

const RECORDS = [
  { title: 'Upper Respiratory Tract Infection', date: '12 Mar 2026', type: 'diagnosis', doctor: 'Dr. Anita Rao' },
  { title: 'Iron & Vitamin D Panel', date: '05 Mar 2026', type: 'lab', doctor: 'City Diagnostics Lab' },
  { title: 'Ferrous Sulfate + Vitamin D3', date: '12 Mar 2026', type: 'prescription', doctor: 'Dr. Anita Rao' },
  { title: 'Chest X-Ray', date: '20 Feb 2026', type: 'imaging', doctor: 'Radiology Dept.' },
  { title: 'Wellness Telehealth Visit', date: '10 Feb 2026', type: 'consultation', doctor: 'Dr. Pooja Mehta' },
  { title: 'Pelvic Ultrasound Report', date: '15 Jan 2026', type: 'report', doctor: 'Dr. Sunita Jain' },
  { title: 'PCOS Diagnosis', date: '15 Jan 2026', type: 'diagnosis', doctor: 'Dr. Sunita Jain' },
  { title: 'Thyroid Function Test', date: '02 Jan 2026', type: 'lab', doctor: 'Pathcare Labs' },
  { title: 'MRI Brain — Headache Workup', date: '20 Dec 2025', type: 'imaging', doctor: 'Dr. Rakesh Nair' },
  { title: 'Annual Full-Body Checkup', date: '10 Dec 2025', type: 'consultation', doctor: 'DocTech Clinic' },
]

const REMINDERS = [
  { title: 'Follow-up with Dr. Anita Rao', date: '25 Mar 2026', time: '10:30 AM', type: 'followup' },
  { title: 'Iron Tablet — Evening Dose', date: '18 Mar 2026', time: '08:00 PM', type: 'medication' },
  { title: 'CBC & Iron Repeat Test', date: '10 Apr 2026', time: '09:00 AM', type: 'lab' },
  { title: 'Annual Physical Checkup', date: '01 Jun 2026', time: '11:00 AM', type: 'checkup' },
  { title: 'Vitamin D3 — Morning Dose', date: '17 Mar 2026', time: '08:00 AM', type: 'medication' },
  { title: 'PCOS Follow-up — Dr. Sunita Jain', date: '15 Jan 2026', time: '02:00 PM', type: 'followup' },
]

// ─── Page ───────────────────────────────────────────
export default function PatientProfilePage() {
  const [patient, setPatient] = useState({
    id: '', name: '', age: null, gender: null,
    height: null, weight: null, bloodGroup: 'Unknown',
    allergies: [], chronicDiseases: [], familyHistory: [], personalHistory: '',
  })

  // Fetch fresh user data from the DB on mount — no need to re-login
  useEffect(() => {
    request('/auth/me')
      .then(apiUser => {
        // Also refresh localStorage so other pages see up-to-date data
        const stored = JSON.parse(localStorage.getItem('doctech_user') || '{}')
        localStorage.setItem('doctech_user', JSON.stringify({
          ...stored,
          name:   apiUser.name,
          gender: apiUser.gender,
          age:    apiUser.age,
        }))
        setPatient(buildPatientFromAPI(apiUser))
      })
      .catch(() => {
        // Graceful fallback to localStorage if token expired / offline
        try {
          const stored = JSON.parse(localStorage.getItem('doctech_user') || '{}')
          setPatient(buildPatientFromAPI(stored))
        } catch {}
      })
  }, [])

  const isFemale = patient.gender?.toLowerCase() === 'female'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 rounded-xl">
          <ShieldCheck className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Health Profile</h1>
          <p className="text-xs text-gray-400">Electronic Health Record · Securely managed</p>
        </div>
      </div>

      {/* ── Basic Info ───────────────────────────── */}
      <div className="mb-6">
        <ProfileHeader patient={patient} onUpdate={setPatient} />
      </div>

      {/* ── EHR Section ──────────────────────────── */}
      <div className="mb-6">
        <EHRSection records={RECORDS} />
      </div>

      {/* ── Menstrual + Reminders side-by-side on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {isFemale && (
          <MenstrualTracker />
        )}
        <div className={isFemale ? '' : 'lg:col-span-2'}>
          <ReminderSection reminders={REMINDERS} />
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-400 mt-2">
        All health data is encrypted and stored securely. DocTech complies with HIPAA & DPDP Act.
      </p>
    </div>
  )
}
