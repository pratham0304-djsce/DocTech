import { useNavigate } from 'react-router-dom'
import { Stethoscope, AlertTriangle, Building2, ArrowRight, ShieldCheck } from 'lucide-react'

const SEVERITY_META = {
  Low:      { color: 'text-[#238370]',   bg: 'bg-[#238370]/10',  icon: '🟢' },
  Moderate: { color: 'text-[#1a6457]',   bg: 'bg-[#238370]/15',  icon: '🟡' },
  High:     { color: 'text-[#1a5245]',   bg: 'bg-[#238370]/20',  icon: '🔴' },
  Critical: { color: 'text-[#1a5245]',   bg: 'bg-[#238370]/25',  icon: '🔴' },
}

const CONFIDENCE_BADGE = {
  high:     { label: 'High Confidence',     class: 'bg-[#238370]/15 text-[#238370]' },
  moderate: { label: 'Moderate Confidence',  class: 'bg-[#238370]/10 text-[#1a6457]' },
  low:      { label: 'Low Confidence',       class: 'bg-gray-100 text-gray-500' },
}

/**
 * Accepts either:
 *   1. orchestratorResult (from the real backend pipeline)
 *   2. patientData (fallback for static rule-based rendering)
 */
export default function DiagnosisCard({ patientData, orchestratorResult }) {
  const navigate = useNavigate()

  // If orchestrator returned structured data, use it directly
  const hasResult = orchestratorResult && (orchestratorResult.conditions?.length > 0 || orchestratorResult.department?.length > 0)

  const conditions  = hasResult ? orchestratorResult.conditions  : _fallbackConditions(patientData)
  const departments = hasResult ? orchestratorResult.department  : _fallbackDepartments(patientData)
  const severityLvl = hasResult ? (orchestratorResult.severity || 'Moderate') : _fallbackSeverity(patientData)
  const urgency     = hasResult ? (orchestratorResult.urgency || severityLvl) : severityLvl
  const followUp    = hasResult ? (orchestratorResult.follow_up || []) : []
  const confidence  = hasResult ? (orchestratorResult.confidence || 'moderate') : 'moderate'
  const disclaimer  = orchestratorResult?.disclaimer || '⚕️ This is not a medical diagnosis. Please consult a licensed healthcare professional.'

  const meta = SEVERITY_META[severityLvl] || SEVERITY_META[urgency] || SEVERITY_META.Moderate
  const confBadge = CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE.moderate

  return (
    <div className="rounded-2xl border border-[#238370]/15 overflow-hidden shadow-sm bg-white mt-2">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#238370]/10 flex items-center gap-2"
        style={{ backgroundColor: 'rgba(35,131,112,0.06)' }}>
        <Stethoscope size={18} className="text-[#238370]" />
        <h3 className="font-semibold text-gray-800 text-sm">AI Triage Result</h3>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
          {meta.icon} {urgency} Risk
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Confidence Badge */}
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-[#238370]/50" />
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${confBadge.class}`}>
            {confBadge.label}
          </span>
        </div>

        {/* Conditions */}
        {conditions.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Probable Conditions</p>
            <div className="space-y-2">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#238370]/5 border border-[#238370]/10">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#238370]/20 flex items-center justify-center text-[10px] font-bold text-[#238370]">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-block text-[10px] font-medium text-[#238370] bg-[#238370]/10 px-2 py-0.5 rounded-full">
                        {c.probability} probability
                      </span>
                      {c.confidence && (
                        <span className="inline-block text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {c.confidence} confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Departments */}
        {departments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Building2 size={12} /> Recommended Departments
            </p>
            <div className="flex flex-wrap gap-2">
              {departments.map(d => (
                <span key={d} className="px-3 py-1 text-xs font-medium text-[#238370] bg-[#238370]/10 rounded-full border border-[#238370]/20">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Follow-Up Suggestions */}
        {followUp.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Follow-Up Guidance</p>
            <ul className="space-y-1.5">
              {followUp.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#238370] mt-0.5 flex-shrink-0">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex gap-2 text-xs text-gray-400 leading-relaxed bg-gray-50 rounded-xl p-3">
          <AlertTriangle size={13} className="text-gray-300 flex-shrink-0 mt-0.5" />
          <p>{disclaimer}</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/patient/doctor-finder')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#238370] text-white text-sm font-semibold hover:bg-[#1a6457] active:scale-[0.98] transition-all"
        >
          Find Doctors
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Static Fallbacks (when orchestrator is unreachable) ─────────────────────
function _fallbackConditions(pd) {
  const s = (pd?.symptom || '').toLowerCase()
  if (s.includes('chest') || s.includes('heart'))
    return [{ name: 'Possible Cardiac Event', probability: 'High', description: 'Chest pain requires urgent cardiac evaluation.', confidence: 'high' }]
  if (s.includes('headache') || s.includes('migraine'))
    return [{ name: 'Tension Headache', probability: 'High', description: 'Most common type — often stress or posture related.', confidence: 'moderate' }]
  if (s.includes('fever'))
    return [{ name: 'Viral Infection', probability: 'High', description: 'Most fevers are caused by viral infections.', confidence: 'moderate' }]
  return [{ name: 'General Acute Condition', probability: 'Medium', description: 'Based on your symptoms, a general evaluation is advised.', confidence: 'low' }]
}

function _fallbackDepartments(pd) {
  const s = (pd?.symptom || '').toLowerCase()
  if (s.includes('chest')) return ['Cardiology', 'Emergency Medicine']
  if (s.includes('headache')) return ['Neurology', 'General Medicine']
  if (s.includes('fever')) return ['General Medicine']
  return ['General Medicine']
}

function _fallbackSeverity(pd) {
  const sev = pd?.severity || 5
  return sev >= 7 ? 'High' : sev >= 4 ? 'Moderate' : 'Low'
}
