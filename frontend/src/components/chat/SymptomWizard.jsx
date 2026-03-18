import { useState } from 'react'
import {
  Activity, Clock, MapPin, Thermometer, AlertCircle,
  Heart, Pill, Leaf, ChevronRight, ChevronLeft, Send
} from 'lucide-react'

// ── Step configuration ─────────────────────────────────────
const STEPS = [
  { id: 1, title: 'Primary Symptoms',   icon: Activity,     color: 'from-primary-500 to-primary-600' },
  { id: 2, title: 'Pain Details',        icon: Thermometer,  color: 'from-orange-400 to-orange-500' },
  { id: 3, title: 'Associated Symptoms', icon: AlertCircle,  color: 'from-amber-400 to-amber-500' },
  { id: 4, title: 'Medical History',     icon: Heart,        color: 'from-rose-400 to-rose-500' },
]

const PAIN_TYPES = ['Sharp', 'Dull/Aching', 'Burning', 'Throbbing', 'Cramping', 'Stabbing', 'Pressure', 'Tingling']
const BODY_LOCATIONS = ['Head', 'Neck', 'Chest', 'Abdomen', 'Back', 'Arms', 'Legs', 'Joints', 'Whole body', 'Other']
const COMMON_SYMPTOMS = ['Fever', 'Nausea', 'Vomiting', 'Fatigue', 'Dizziness', 'Chills', 'Loss of appetite', 'Sweating']
const DURATION_OPTIONS = ['< 1 hour', '1–6 hours', '1 day', '2–3 days', 'About a week', '1–4 weeks', '> 1 month']

// ── Small reusable badge-toggle button ──────────────────────
const ToggleBadge = ({ label, selected, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
      selected
        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-400 hover:text-primary-600'
    }`}
  >
    {label}
  </button>
)

// ── Main Wizard ─────────────────────────────────────────────
const EMPTY_STATE = {
  symptoms: [],
  duration: '',
  painType: '',
  severity: 5,
  location: [],
  associatedSymptoms: [],
  chronicDiseases: '',
  familyHistory: '',
  medications: '',
  allergies: '',
}

export default function SymptomWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState(EMPTY_STATE)
  const [symptomInput, setSymptomInput] = useState('')

  // Generic setter helpers
  const set = (field, value) => setData(prev => ({ ...prev, [field]: value }))
  const toggleArray = (field, item) =>
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(x => x !== item)
        : [...prev[field], item],
    }))

  const addCustomSymptom = (e) => {
    e.preventDefault()
    if (symptomInput.trim() && !data.symptoms.includes(symptomInput.trim())) {
      setData(prev => ({ ...prev, symptoms: [...prev.symptoms, symptomInput.trim()] }))
      setSymptomInput('')
    }
  }

  const canProceed = () => {
    if (step === 1) return data.symptoms.length > 0
    if (step === 2) return data.duration !== ''
    return true
  }

  const handleSubmit = () => {
    onComplete({
      ...data,
      chronicDiseases: data.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      medications:     data.medications.split(',').map(s => s.trim()).filter(Boolean),
      allergies:       data.allergies.split(',').map(s => s.trim()).filter(Boolean),
    })
  }

  // ── Step content renders ──────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <p className="text-gray-500 text-sm">Type a symptom and press Enter, or add common ones below.</p>

            <form onSubmit={addCustomSymptom} className="flex gap-2">
              <input
                type="text"
                value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
                placeholder="e.g. Headache, Fever..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
              />
              <button type="submit" className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
                Add
              </button>
            </form>

            {data.symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.symptoms.map(s => (
                  <span key={s} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 rounded-full text-sm font-medium">
                    {s}
                    <button onClick={() => toggleArray('symptoms', s)} className="text-primary-400 hover:text-primary-700 transition-colors">✕</button>
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Common Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {['Fever', 'Headache', 'Cough', 'Sore throat', 'Chest pain', 'Fatigue', 'Shortness of breath', 'Body ache'].map(s => (
                  <ToggleBadge key={s} label={s} selected={data.symptoms.includes(s)} onToggle={() => toggleArray('symptoms', s)} />
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Clock className="h-4 w-4 text-primary-500" /> How long have you had these symptoms?
              </label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map(d => (
                  <ToggleBadge key={d} label={d} selected={data.duration === d} onToggle={() => set('duration', d)} />
                ))}
              </div>
            </div>

            {/* Pain Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <Thermometer className="h-4 w-4 text-orange-500" /> What kind of pain/discomfort?
              </label>
              <div className="flex flex-wrap gap-2">
                {PAIN_TYPES.map(pt => (
                  <ToggleBadge key={pt} label={pt} selected={data.painType === pt} onToggle={() => set('painType', pt)} />
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
                <span><Activity className="h-4 w-4 text-red-400 inline mr-1" />Pain Severity</span>
                <span className={`font-bold text-lg ${data.severity >= 8 ? 'text-red-500' : data.severity >= 5 ? 'text-amber-500' : 'text-primary-600'}`}>
                  {data.severity} / 10
                </span>
              </label>
              <input
                type="range" min="1" max="10" value={data.severity}
                onChange={e => set('severity', Number(e.target.value))}
                className="w-full h-2 rounded-full cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Mild</span><span>Moderate</span><span>Severe</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <MapPin className="h-4 w-4 text-primary-500" /> Where do you feel it? (select all)
              </label>
              <div className="flex flex-wrap gap-2">
                {BODY_LOCATIONS.map(loc => (
                  <ToggleBadge key={loc} label={loc} selected={data.location.includes(loc)} onToggle={() => toggleArray('location', loc)} />
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-5">
            <p className="text-gray-500 text-sm">Select any additional symptoms you are experiencing alongside the main ones.</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(s => (
                <ToggleBadge key={s} label={s} selected={data.associatedSymptoms.includes(s)} onToggle={() => toggleArray('associatedSymptoms', s)} />
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm">This helps the AI personalise its advice. Separate multiple values with commas.</p>
            {[
              { field: 'chronicDiseases', label: 'Chronic Diseases',   icon: Heart,  placeholder: 'e.g. Diabetes, Hypertension' },
              { field: 'familyHistory',   label: 'Family History',      icon: Leaf,   placeholder: 'e.g. Heart disease, Cancer' },
              { field: 'medications',     label: 'Current Medications', icon: Pill,   placeholder: 'e.g. Metformin 500mg, Atorvastatin' },
              { field: 'allergies',       label: 'Allergies',           icon: AlertCircle, placeholder: 'e.g. Penicillin, Shellfish' },
            ].map(({ field, label, icon: Icon, placeholder }) => (
              <div key={field}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Icon className="h-4 w-4 text-primary-500" /> {label}
                </label>
                <input
                  type="text"
                  value={data[field]}
                  onChange={e => set(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                />
              </div>
            ))}
          </div>
        )

      default: return null
    }
  }

  const currentStep = STEPS[step - 1]
  const StepIcon = currentStep.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${currentStep.color} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <StepIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Step {step} of {STEPS.length}</p>
            <h2 className="text-white text-lg font-semibold">{currentStep.title}</h2>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-white/20 rounded-full">
          <div
            className="h-1.5 bg-white rounded-full transition-all duration-500"
            style={{ width: `${(step / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 py-3 bg-gray-50 border-b border-gray-100">
        {STEPS.map(s => (
          <div key={s.id} className={`rounded-full transition-all ${s.id === step ? 'w-6 h-2 bg-primary-600' : s.id < step ? 'w-2 h-2 bg-primary-300' : 'w-2 h-2 bg-gray-200'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="p-6 min-h-[280px]">
        {renderStep()}
      </div>

      {/* Footer Navigation */}
      <div className="px-6 pb-6 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        ) : <div />}

        {step < STEPS.length ? (
          <button
            onClick={() => setStep(prev => prev + 1)}
            disabled={!canProceed()}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm shadow-primary-200"
          >
            <Send className="h-4 w-4" /> Analyse Symptoms
          </button>
        )}
      </div>
    </div>
  )
}
