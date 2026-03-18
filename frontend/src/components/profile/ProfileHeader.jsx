import { useState } from 'react'
import {
  User, Edit3, X, Save, Droplets, Ruler, Weight,
  AlertCircle, Activity, Heart, Users, BookOpen, Check
} from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

function InfoBadge({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-2 py-2">
      <div className="p-1.5 rounded-lg bg-primary-50 mt-0.5 shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary-600" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800 leading-tight mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

function TagList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-400 italic">{emptyText}</p>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100">
          {item}
        </span>
      ))}
    </div>
  )
}

export default function ProfileHeader({ patient, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ ...patient })

  const bmi = form.height && form.weight
    ? (form.weight / ((form.height / 100) ** 2)).toFixed(1)
    : null

  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
    : null

  const handleSave = () => {
    onUpdate?.(form)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setForm({ ...patient })
    setIsEditing(false)
  }

  const field = (key, label, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={form[key] ?? ''}
        onChange={e => setForm(prev => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-600" />

      <div className="p-6">
        {/* Top row: Avatar + Name + Edit btn */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-md shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-400">{patient.age} yrs · {patient.gender}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                  Patient ID: {patient.id}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 transition-colors shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Height', value: form.height ? `${form.height} cm` : '—', icon: Ruler },
            { label: 'Weight', value: form.weight ? `${form.weight} kg` : '—', icon: Weight },
            {
              label: 'BMI',
              value: bmi ? `${bmi} (${bmiCategory})` : '—',
              icon: Activity,
            },
            { label: 'Blood Group', value: form.bloodGroup || '—', icon: Droplets },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-primary-50 rounded-xl p-3 text-center border border-primary-100">
              <Icon className="w-4 h-4 text-primary-600 mx-auto mb-1" />
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Medical history grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-primary-400" /> Allergies
            </p>
            <TagList items={form.allergies} emptyText="No known allergies" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary-400" /> Chronic Diseases
            </p>
            <TagList items={form.chronicDiseases} emptyText="None" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-400" /> Family History
            </p>
            <TagList items={form.familyHistory} emptyText="None reported" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-primary-400" /> Personal History
            </p>
            <p className="text-sm text-gray-700">{form.personalHistory || 'No notes added.'}</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {field('name', 'Full Name')}
              {field('age', 'Age', 'number')}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gender</label>
                <select
                  value={form.gender ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Blood Group</label>
                <select
                  value={form.bloodGroup ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              {field('height', 'Height (cm)', 'number')}
              {field('weight', 'Weight (kg)', 'number')}
              <div className="sm:col-span-2">
                {field('personalHistory', 'Personal History')}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm">
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
