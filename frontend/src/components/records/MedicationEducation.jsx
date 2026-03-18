import { useState } from 'react'
import { Bot, Info, AlertTriangle, ShieldCheck, FlaskConical, X } from 'lucide-react'

// Static AI knowledge base for common medications
const MED_INFO = {
  paracetamol: {
    purpose: 'Relieves mild to moderate pain (headaches, toothache, backache) and reduces fever. Works by blocking pain signals in the brain.',
    dosage: 'Adults: 500–1000 mg every 4–6 hours. Maximum 4 g (4000 mg) per day. Never exceed the daily limit.',
    sideEffects: ['Rarely causes side effects at normal doses', 'High doses can cause liver damage', 'Nausea or stomach pain at high doses', 'Skin rash in rare cases'],
    precautions: ['Avoid alcohol while taking paracetamol', 'Check other medicines for paracetamol content to avoid double dosing', 'Consult doctor if you have liver or kidney disease', 'Safe during pregnancy at recommended doses'],
  },
  amoxicillin: {
    purpose: 'Antibiotic used to treat bacterial infections including throat, ear, chest, urinary tract, and skin infections.',
    dosage: 'Typically 250–500 mg every 8 hours or 500–875 mg every 12 hours. Complete the full course even if you feel better.',
    sideEffects: ['Diarrhoea (common)', 'Nausea and stomach upset', 'Skin rash', 'Yeast infection (thrush)', 'Allergic reaction in rare cases'],
    precautions: ['Tell your doctor if allergic to penicillin', 'Do not stop mid-course — antibiotic resistance risk', 'Use probiotics to protect gut health', 'May reduce effectiveness of oral contraceptives'],
  },
  'vitamin d3': {
    purpose: 'Helps the body absorb calcium and phosphorus. Supports bone health, immunity, muscle function, and mood regulation.',
    dosage: 'General supplement: 600–2000 IU/day for adults. Therapeutic doses (up to 4000 IU/day) should be taken only as prescribed.',
    sideEffects: ['Nausea or vomiting at high doses', 'Weakness or fatigue', 'Frequent urination', 'Kidney stones if severely deficient and rapidly corrected'],
    precautions: ['Do not exceed recommended doses without a blood test', 'Take with a fatty meal for best absorption', 'Caution if you have kidney disease or sarcoidosis', 'Check for Vitamin D toxicity if taking high doses long-term'],
  },
  'omega-3': {
    purpose: 'Supports heart health, reduces triglycerides, decreases inflammation, and supports brain and eye function.',
    dosage: 'General health: 250–500 mg EPA+DHA/day. For high triglycerides: up to 4 g/day under doctor supervision.',
    sideEffects: ['Fishy aftertaste or breath', 'Mild nausea or loose stools', 'Increased bleeding time at high doses'],
    precautions: ['Consult doctor if on blood-thinning medications (e.g. warfarin)', 'Take with food to reduce side effects', 'Choose high-quality, mercury-tested brands', 'May lower blood pressure — caution if on antihypertensives'],
  },
}

function getInfo(medName) {
  if (!medName) return null
  const key = medName.toLowerCase()
  return MED_INFO[key] || null
}

function InfoBlock({ icon: Icon, title, content, items }) {
  return (
    <div className="bg-primary-50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700">{title}</h4>
      </div>
      {content && <p className="text-sm text-gray-700 leading-relaxed">{content}</p>}
      {items && (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MedicationEducation({ selected, onClose }) {
  const [custom, setCustom] = useState('')
  const [queried, setQueried] = useState(null)

  const activeMed = queried || selected
  const info = getInfo(activeMed?.name || custom)

  return (
    <div className="bg-white rounded-2xl border border-primary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-primary-50">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-gray-900">Medication Education (AI)</h2>
          <p className="text-[11px] text-gray-400">Click any medication or search below</p>
        </div>
        {selected && onClose && (
          <button onClick={onClose} className="p-1 hover:bg-primary-50 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Search box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={e => { setCustom(e.target.value); setQueried(null) }}
            onKeyDown={e => e.key === 'Enter' && setQueried({ name: custom })}
            placeholder="Type medication name and press Enter…"
            className="flex-1 px-4 py-2.5 rounded-xl border border-primary-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={() => setQueried({ name: custom })}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Search
          </button>
        </div>

        {/* Selected med pill */}
        {activeMed && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl border border-primary-100">
            <FlaskConical className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">{activeMed.name}</span>
          </div>
        )}

        {/* Info blocks */}
        {info ? (
          <div className="space-y-3">
            <InfoBlock icon={Info}          title="Purpose & Use"       content={info.purpose} />
            <InfoBlock icon={FlaskConical}  title="Dosage Instructions" content={info.dosage} />
            <InfoBlock icon={AlertTriangle} title="Side Effects"        items={info.sideEffects} />
            <InfoBlock icon={ShieldCheck}   title="Precautions"         items={info.precautions} />
          </div>
        ) : activeMed ? (
          <div className="text-center py-8">
            <Bot className="w-8 h-8 text-primary-200 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No data found for "{activeMed.name}"</p>
            <p className="text-xs text-gray-400 mt-1">Try searching a common medication name</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <Bot className="w-10 h-10 text-primary-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">Click a medication card to learn about it</p>
            <p className="text-xs text-gray-400 mt-1">Or search any medicine above</p>
          </div>
        )}

        <p className="text-[11px] text-gray-300 text-center pt-2">
          ⚠️ For informational purposes only. Always follow your doctor's instructions.
        </p>
      </div>
    </div>
  )
}
