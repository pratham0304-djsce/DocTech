import { useState, useEffect, useRef } from 'react'
import { Bot, RotateCcw, Loader2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import OptionButtons from './OptionButtons'
import ProgressIndicator from './ProgressIndicator'
import DiagnosisCard from './DiagnosisCard'
import request from '../../utils/api'

// ─── Conversation Flow Definition ─────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    question: "Hello! I'm your AI Health Assistant. 👋\n\nLet's start with the basics — **what symptoms are you experiencing?**\n\nDescribe your main complaint.",
    field: 'symptom',
    inputType: 'text',
    placeholder: 'e.g. chest pain, headache, fever…',
  },
  {
    id: 2,
    question: '**How long have you had this symptom?**',
    field: 'duration',
    inputType: 'options+text',
    options: ['Today', 'A few days', '1–2 weeks', 'A month or more'],
    placeholder: 'Or type a custom duration…',
  },
  {
    id: 3,
    question: '**What best describes the nature of the discomfort?**',
    field: 'painType',
    inputType: 'options',
    options: ['Sharp', 'Dull', 'Burning', 'Throbbing', 'Aching', 'Pressure', 'Not applicable'],
  },
  {
    id: 4,
    question: '**On a scale of 1 to 10, how would you rate the severity?**\n\n1 = Very mild &nbsp; 10 = Unbearable',
    field: 'severity',
    inputType: 'scale',
  },
  {
    id: 5,
    question: '**Are you experiencing any of these additional symptoms?**\n\nSelect all that apply (or type your own).',
    field: 'associatedSymptoms',
    inputType: 'multi+text',
    options: ['Fever', 'Nausea', 'Cough', 'Fatigue', 'Dizziness', 'Breathlessness', 'Vomiting', 'None'],
    placeholder: 'Or describe additional symptoms…',
    multi: true,
  },
  {
    id: 6,
    question: '**Last question — any relevant medical history?**\n\nInclude chronic conditions, allergies, or current medications if any.',
    field: 'medicalHistory',
    inputType: 'text',
    placeholder: 'e.g. diabetes, hypertension, aspirin allergy… or "None"',
  },
]

const TOTAL_STEPS = STEPS.length

const makeMsg = (role, content, file, metadata) => ({
  id: Date.now() + Math.random(),
  role,
  content,
  file: file || null,
  metadata: metadata || null,
  timestamp: new Date().toISOString(),
})

export default function ChatWindow({ session, onSessionUpdate }) {
  const [messages, setMessages]         = useState([])
  const [step, setStep]                 = useState(0)       // 0=not started, 1-6=triage, 7=done(diagnosis shown), 8=free-chat
  const [patientData, setPatientData]   = useState({
    symptom: '', duration: '', painType: '',
    severity: null, associatedSymptoms: [], medicalHistory: '',
  })
  const [multiSelected, setMultiSelected] = useState([])
  const [isLoading, setIsLoading]       = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState(null)
  const bottomRef = useRef(null)

  // ── Init session ───────────────────────────────────────────────
  useEffect(() => {
    if (session?.restoredMessages) {
      setMessages(session.restoredMessages)
      setStep(8) // restored sessions go directly to free-chat mode
      setPatientData(session.patientData || {})
    } else if (session && !session.restoredMessages) {
      startConversation()
    }
  }, [session?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const startConversation = () => {
    setMessages([makeMsg('ai', STEPS[0].question)])
    setStep(1)
    setPatientData({ symptom: '', duration: '', painType: '', severity: null, associatedSymptoms: [], medicalHistory: '' })
    setMultiSelected([])
    setDiagnosisResult(null)
    setIsLoading(false)
  }

  // ── Advance to next step ───────────────────────────────────────
  const advance = async (field, value, displayText) => {
    const userMsg = makeMsg('user', displayText)
    const updatedData = { ...patientData, [field]: value }
    setPatientData(updatedData)

    const nextStep = step + 1

    if (nextStep > TOTAL_STEPS) {
      // ── 6-step triage complete → call Orchestrator Diagnostic Agent ──
      const thinkingMsg = makeMsg('ai', '⏳ Analyzing your symptoms…')
      setMessages(prev => [...prev, userMsg, thinkingMsg])
      setStep(7)
      setIsLoading(true)

      try {
        // Build patient_state for the orchestrator
        const patientState = {
          symptoms: [updatedData.symptom].filter(Boolean),
          duration: updatedData.duration || '',
          severity: String(updatedData.severity || ''),
          painType: updatedData.painType || '',
          associatedSymptoms: Array.isArray(updatedData.associatedSymptoms)
            ? updatedData.associatedSymptoms
            : [updatedData.associatedSymptoms].filter(Boolean),
          medicalHistory: typeof updatedData.medicalHistory === 'string'
            ? [updatedData.medicalHistory].filter(Boolean)
            : updatedData.medicalHistory || [],
        }

        // Call Node.js backend which proxies to Python orchestrator
        const data = await request('/chat/message', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: session?.backendId,
            message: `Symptom triage complete. Symptoms: ${updatedData.symptom}. Duration: ${updatedData.duration}. Pain type: ${updatedData.painType}. Severity: ${updatedData.severity}/10. Associated: ${(updatedData.associatedSymptoms || []).join(', ')}. History: ${updatedData.medicalHistory}.`,
            patientState,
          }),
        })

        const result = data.metadata || {}
        setDiagnosisResult(result)

        // Replace the "thinking" message with the real analysis message
        const analysisMsg = makeMsg('ai', result.explanation || '✅ Analysis complete. Here are the results:')
        setMessages(prev => [...prev.slice(0, -1), analysisMsg])

        onSessionUpdate?.({
          patientData: updatedData,
          title: updatedData.symptom || 'Health Consultation',
          sessionTitle: data.sessionTitle,
        })
      } catch (err) {
        console.error('Orchestrator call failed:', err)
        // Fallback: show the static DiagnosisCard
        const fallbackMsg = makeMsg('ai', '✅ I have collected all your information. Here is the initial analysis:')
        setMessages(prev => [...prev.slice(0, -1), fallbackMsg])
        setDiagnosisResult(null) // Will trigger static DiagnosisCard
      } finally {
        setIsLoading(false)
      }
    } else {
      const nextQuestion = makeMsg('ai', STEPS[nextStep - 1].question)
      setMessages(prev => [...prev, userMsg, nextQuestion])
      setStep(nextStep)
      setMultiSelected([])
    }
  }

  // ── Handle text submission ─────────────────────────────────────
  const handleSend = async (text) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      // During triage flow
      const currentStep = STEPS[step - 1]
      if (currentStep.multi && multiSelected.length > 0) {
        const combined = [...multiSelected, text]
        advance(currentStep.field, combined, combined.join(', '))
      } else {
        advance(currentStep.field, text, text)
      }
      return
    }

    // ── Free-form chat mode (step 7 or 8) → Conversational Agent ──
    if (step >= 7) {
      setStep(8) // unlock free chat
      const userMsg = makeMsg('user', text)
      setMessages(prev => [...prev, userMsg])
      setIsLoading(true)

      try {
        const data = await request('/chat/message', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: session?.backendId,
            message: text,
            patientState: patientData,
          }),
        })
        const aiMsg = makeMsg('ai', data.reply || data.metadata?.explanation || 'I couldn\'t process that right now.')
        setMessages(prev => [...prev, aiMsg])
      } catch {
        setMessages(prev => [...prev, makeMsg('ai', 'I\'m having trouble connecting. Please try again.')])
      } finally {
        setIsLoading(false)
      }
    }
  }

  // ── Handle single option ───────────────────────────────────────
  const handleOption = (value) => {
    if (step < 1 || step > TOTAL_STEPS) return
    const currentStep = STEPS[step - 1]

    if (currentStep.multi) {
      setMultiSelected(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev.filter(v => v !== 'None'), value === 'None' ? 'None' : value]
      )
      return
    }

    if (currentStep.inputType === 'scale') {
      advance(currentStep.field, value, `Severity: ${value}/10`)
      return
    }
    advance(currentStep.field, value, value)
  }

  const handleMultiConfirm = () => {
    if (multiSelected.length === 0) return
    advance(STEPS[step - 1].field, multiSelected, multiSelected.join(', '))
  }

  const handleUpload = (file) => {
    const fileMsg = makeMsg('user', null, file)
    const ackMsg  = makeMsg('ai', `📎 I have received your file **"${file.name}"**. I'll factor it into the analysis.`)
    setMessages(prev => [...prev, fileMsg, ackMsg])
  }

  const currentStepDef = step >= 1 && step <= TOTAL_STEPS ? STEPS[step - 1] : null
  const isDone    = step >= 7
  const isFreeChatMode = step === 8
  const isNew     = messages.length === 0

  // ── Empty state ────────────────────────────────────────────────
  if (isNew) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-[#238370]/10 flex items-center justify-center mb-4">
          <Bot size={28} className="text-[#238370]/50" />
        </div>
        <p className="text-gray-600 font-medium">Start a new conversation</p>
        <p className="text-gray-300 text-sm mt-1">with your AI health assistant</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-5 py-3 border-b border-[#238370]/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#238370]/10 flex items-center justify-center">
          <Bot size={16} className="text-[#238370]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">AI Health Assistant</p>
          {!isDone && step >= 1 && (
            <ProgressIndicator current={step} total={TOTAL_STEPS} />
          )}
          {isDone && !isFreeChatMode && <p className="text-xs text-[#238370]">Analysis complete — ask follow-up questions below</p>}
          {isFreeChatMode && <p className="text-xs text-[#238370]">💬 Follow-up mode — ask me anything health-related</p>}
        </div>
        {!isNew && (
          <button
            onClick={startConversation}
            title="Start over"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#238370] transition-colors px-2 py-1 rounded-lg hover:bg-[#238370]/5"
          >
            <RotateCcw size={13} /> Restart
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map(msg => (
          <ChatMessage
            key={msg.id}
            role={msg.role}
            content={msg.content}
            file={msg.file}
            timestamp={msg.timestamp}
          />
        ))}

        {/* Active input widgets (options/scale) during triage */}
        {!isDone && currentStepDef && (
          <div className="pl-9">
            {(currentStepDef.inputType === 'options' ||
              currentStepDef.inputType === 'options+text' ||
              currentStepDef.inputType === 'multi+text') && (
              <div>
                <OptionButtons
                  options={currentStepDef.options}
                  onSelect={handleOption}
                  selected={currentStepDef.multi ? multiSelected : []}
                />
                {currentStepDef.multi && multiSelected.length > 0 && multiSelected[0] !== 'None' && (
                  <button
                    onClick={handleMultiConfirm}
                    className="mt-3 px-4 py-2 text-sm font-semibold bg-[#238370] text-white rounded-xl hover:bg-[#1a6457] active:scale-95 transition-all"
                  >
                    Confirm selection →
                  </button>
                )}
              </div>
            )}

            {currentStepDef.inputType === 'scale' && (
              <div className="flex flex-wrap gap-2 mt-2">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n}
                    onClick={() => handleOption(n)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold border transition-all active:scale-95 ${
                      n <= 3
                        ? 'border-[#238370]/20 text-[#238370] hover:bg-[#238370]/10'
                        : n <= 6
                        ? 'border-[#1a6457]/30 text-[#1a6457] hover:bg-[#1a6457]/10'
                        : 'border-[#1a5245]/30 text-[#1a5245] hover:bg-[#1a5245]/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Diagnosis card after triage */}
        {isDone && (
          <div className="pl-9">
            <DiagnosisCard
              patientData={patientData}
              orchestratorResult={diagnosisResult}
            />
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-2.5 pl-9">
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm border border-[#238370]/10 text-sm text-gray-500"
              style={{ backgroundColor: 'rgba(35,131,112,0.06)' }}>
              <Loader2 size={14} className="animate-spin text-[#238370]" />
              <span>Thinking…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <ChatInput
        onSend={handleSend}
        onUpload={handleUpload}
        disabled={isLoading}
        placeholder={
          currentStepDef?.placeholder ||
          (isFreeChatMode ? 'Ask a follow-up question…' : (isDone ? 'Ask a follow-up question…' : undefined))
        }
      />
    </div>
  )
}
