import { useState, useEffect } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import DiagnosisPanel from '../components/chat/DiagnosisPanel'
import UploadReportButton from '../components/chat/UploadReportButton'
import SymptomWizard from '../components/chat/SymptomWizard'
import request from '../utils/api'

// ── Initial patientSymptoms shape (matches the backend body) ─────
const EMPTY_PATIENT_SYMPTOMS = {
  symptoms: [],
  duration: '',
  painType: '',
  severity: 5,
  location: [],
  associatedSymptoms: [],
  chronicDiseases: [],
  familyHistory: '',
  medications: [],
  allergies: [],
}

export default function AIChatbot() {
  const [view, setView] = useState('wizard')       // 'wizard' | 'chat'
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [patientSymptoms, setPatientSymptoms] = useState(EMPTY_PATIENT_SYMPTOMS)
  const [detectedSymptoms, setDetectedSymptoms] = useState([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Resets all state and returns the user to the Symptom Wizard
  const handleRestart = () => {
    setView('wizard')
    setMessages([])
    setPatientSymptoms(EMPTY_PATIENT_SYMPTOMS)
    setDetectedSymptoms([])
    setAnalysisComplete(false)
    sessionStorage.removeItem('pendingHopi')
  }

  // Load chat history on mount — if user has past messages skip wizard
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await request('/chatbot/history?limit=50')
        const msgs = data.messages || []
        setMessages(msgs)
        extractSymptomsFromHistory(msgs)
        // If they have previous messages jump straight to chat
        if (msgs.length > 0) setView('chat')
      } catch (err) {
        console.info('Chat history not loaded:', err.message)
      }
    }
    fetchHistory()
  }, [])

  // Extract symptom keyword chips for DiagnosisPanel
  const extractSymptomsFromHistory = (msgs) => {
    const keywords = ['fever', 'headache', 'pain', 'cough', 'nausea', 'rash', 'dizziness', 'fatigue', 'vomiting', 'chills']
    const found = new Set()
    msgs.filter(m => m.role === 'user').forEach(msg => {
      const text = msg.content.toLowerCase()
      keywords.forEach(kw => { if (text.includes(kw)) found.add(kw) })
    })
    setDetectedSymptoms(Array.from(found))
  }

  // ── Called when SymptomWizard is submitted ───────────────────
  const handleWizardComplete = async (symptoms) => {
    setPatientSymptoms(symptoms)
    // Also pre-populate the DiagnosisPanel chips from the wizard selection
    setDetectedSymptoms(symptoms.symptoms)
    setIsLoading(true)

    // Optimistically add a user message showing what was collected
    const summaryMsg = {
      role: 'user',
      content: `Symptom analysis request:\n• Symptoms: ${symptoms.symptoms.join(', ')}\n• Duration: ${symptoms.duration || 'Not specified'}\n• Severity: ${symptoms.severity}/10\n• Pain type: ${symptoms.painType || 'Not specified'}\n• Location: ${(symptoms.location || []).join(', ') || 'Not specified'}`,
      createdAt: new Date().toISOString(),
    }
    setMessages([summaryMsg])
    setView('chat')

    try {
      const data = await request('/chatbot/analyze', {
        method: 'POST',
        body: JSON.stringify(symptoms),
      })

      // data is now a structured triage object, not a plain reply string
      // Build a rich human-readable AI message from the structured response
      const conditions = (data.probable_conditions || [])
        .map(c => `  • ${c.name} (${c.probability} probability) — ${c.description}`)
        .join('\n')

      const depts = (data.recommended_departments || []).join(', ') || 'General Medicine'

      const riskEmoji = data.urgency === 'High' ? '🔴' : data.urgency === 'Moderate' ? '🟡' : '🟢'

      const formattedReply = [
        `${riskEmoji} **Triage Result: ${data.severity_level || data.urgency} Risk** (Score: ${data.risk_score ?? 'N/A'}/10+)`,
        '',
        data.triage_advice,
        '',
        conditions ? `**Probable Conditions:**\n${conditions}` : '',
        '',
        `**Recommended Departments:** ${depts}`,
      ].filter(line => line !== undefined).join('\n').trim()

      // Also update sidebar diagnosis panel with AI + wizard symptoms
      setDetectedSymptoms([
        ...symptoms.symptoms,
        ...(symptoms.associatedSymptoms || []),
      ])

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: formattedReply,
        createdAt: new Date().toISOString(),
      }])
      setAnalysisComplete(true) // Analysis is done — show Restart button
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process your symptoms right now. Please try again or describe them in the chat.',
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  // ── Called when user types in the chat input ─────────────────
  const handleSendMessage = async (text) => {
    const newUserMsg = { role: 'user', content: text, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, newUserMsg])
    extractSymptomsFromHistory([...messages, newUserMsg])
    setIsLoading(true)

    try {
      const data = await request('/chatbot/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      }])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble connecting right now. Please try again later.',
        createdAt: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadClick = () => alert('Medical report upload is coming soon!')

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* LEFT: Wizard or Chat */}
      <div className="lg:col-span-2 flex flex-col">
        {view === 'wizard' ? (
          <div>
            {/* Header nudge */}
            <div className="mb-4 p-4 bg-primary-50 border border-primary-100 rounded-2xl flex items-start gap-3">
              <span className="text-2xl">🩺</span>
              <div>
                <p className="font-semibold text-primary-800">Before we chat…</p>
                <p className="text-sm text-primary-600/80">
                  Answer a few quick questions so our AI can give you more accurate, personalised health insights.
                </p>
              </div>
            </div>
            <SymptomWizard onComplete={handleWizardComplete} />
            <button
              onClick={() => setView('chat')}
              className="mt-3 text-sm text-gray-400 hover:text-gray-600 underline decoration-dotted mx-auto block transition-colors"
            >
              Skip and start chatting directly →
            </button>
          </div>
        ) : (
          <>
            {/* Restart button — always visible in chat view once there are messages */}
            {messages.length > 0 && (
              <div className="mb-3 flex justify-end">
                <button
                  onClick={handleRestart}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 text-gray-600 rounded-xl shadow-sm transition-all"
                >
                  <span>🔄</span> Start Over
                </button>
              </div>
            )}
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      {/* RIGHT: Action Sidebar */}
      <div className="space-y-6">
        <DiagnosisPanel symptoms={detectedSymptoms} />
        <UploadReportButton onUpload={handleUploadClick} />

        {/* How it works info card */}
        <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
          <h4 className="font-medium text-primary-800 mb-2">How it works</h4>
          <ol className="text-sm text-primary-600/80 space-y-2 list-none">
            <li className="flex gap-2"><span className="font-bold text-primary-600">1.</span> Fill in the symptom form</li>
            <li className="flex gap-2"><span className="font-bold text-primary-600">2.</span> AI analyses your profile</li>
            <li className="flex gap-2"><span className="font-bold text-primary-600">3.</span> Chat for follow-up questions</li>
            <li className="flex gap-2"><span className="font-bold text-primary-600">4.</span> Find the right doctor</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
