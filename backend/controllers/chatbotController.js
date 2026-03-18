import fetch from 'node-fetch'
import ChatHistory from '../models/ChatHistory.js'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// POST /api/chatbot/chat
// Forwards user's message to the Python AI microservice and saves the conversation
export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body
    if (!message?.trim()) return res.status(400).json({ message: 'message is required' })

    // Fetch last 10 messages from history for context
    const history = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(10).lean()
    const context = history.reverse().map(h => ({ role: h.role, content: h.content }))

    // Call the Python AI microservice
    let aiReply = ''
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          patient: {
            age:             req.user.age,
            gender:          req.user.gender,
            chronicDiseases: req.user.chronicDiseases,
            allergies:       req.user.allergies,
          },
        }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) throw new Error('AI service error')
      const data = await response.json()
      aiReply = data.reply
    } catch {
      // Fallback: rule-based if Python service is unreachable
      aiReply = fallbackAnalysis(message)
    }

    // Save both sides of the conversation
    await ChatHistory.insertMany([
      { user: req.user._id, role: 'user',      content: message  },
      { user: req.user._id, role: 'assistant', content: aiReply  },
    ])

    res.json({ reply: aiReply })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// GET /api/chatbot/history — Return paginated chat history
export const getChatHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1
    const limit = parseInt(req.query.limit) || 20
    const total = await ChatHistory.countDocuments({ user: req.user._id })
    const messages = await ChatHistory.find({ user: req.user._id })
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
    res.json({ total, page, pages: Math.ceil(total / limit), messages })
  } catch (err) { res.status(500).json({ message: err.message }) }
}

// POST /api/chatbot/analyze
// Forwards structured symptom data to the Python /api/ai/analyze endpoint
// which runs the Triage Engine + Grok AI and returns a structured JSON result.
export const analyzeSymptoms = async (req, res) => {
  try {
    const {
      symptoms, duration, painType, severity, location,
      associatedSymptoms, chronicDiseases, familyHistory,
      medications, allergies,
    } = req.body

    if (!symptoms || symptoms.length === 0)
      return res.status(400).json({ message: 'At least one symptom is required' })

    // Build the Python-schema compliant payload
    const pythonPayload = {
      symptoms:            symptoms,
      duration:            duration || null,
      pain_type:           painType || null,
      severity:            severity  || null,
      location:            location  || [],
      associated_symptoms: associatedSymptoms || [],
      medical_history: {
        chronic_diseases: chronicDiseases  || [],
        family_history:   familyHistory    || '',
        medications:      medications      || [],
        allergies:        allergies        || [],
      },
    }

    // Call the Python Triage Engine + Grok AI
    let triageResult = null
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/ai/analyze`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(pythonPayload),
        signal:  AbortSignal.timeout(25000),
      })
      if (!response.ok) throw new Error(`Python service responded ${response.status}`)
      triageResult = await response.json()
    } catch (pyErr) {
      console.warn('[analyzeSymptoms] Python service unavailable:', pyErr.message)
      // Return a minimal triage fallback based on first symptom
      triageResult = {
        probable_conditions:    [{ name: 'General Illness', probability: 'Medium', description: 'Could not reach AI service.' }],
        severity_level:         'Unknown',
        recommended_departments: ['General Medicine'],
        triage_advice:          fallbackAnalysis(symptoms[0] || ''),
        risk_score:             0,
        urgency:                'Low',
      }
    }

    // Save a compact summary to ChatHistory for context continuity
    const summaryText = `Symptom analysis — ${symptoms.join(', ')} (severity: ${severity || 'N/A'}/10, duration: ${duration || 'N/A'})`
    const aiSummary   = `Triage result: ${triageResult.severity_level} risk. Departments: ${triageResult.recommended_departments.join(', ')}. ${triageResult.triage_advice}`
    await ChatHistory.insertMany([
      { user: req.user._id, role: 'user',      content: summaryText },
      { user: req.user._id, role: 'assistant', content: aiSummary  },
    ])

    res.json(triageResult)
  } catch (err) { res.status(500).json({ message: err.message }) }
}


// ── Fallback rule-based analysis if Python AI service is offline ──
function fallbackAnalysis(message) {
  const msg = message.toLowerCase()
  if (msg.includes('fever') || msg.includes('temperature'))
    return '🌡️ Fever can have many causes. Stay hydrated, rest, and take paracetamol if above 38°C. See a doctor if it persists beyond 3 days or exceeds 39.5°C.'
  if (msg.includes('headache') || msg.includes('migraine'))
    return '🧠 Headaches are common. Try resting in a quiet, dark room and drinking water. If severe, sudden, or with vision changes, seek urgent care.'
  if (msg.includes('chest pain') || msg.includes('heart'))
    return '❤️ Chest pain should never be ignored. If accompanied by breathlessness, arm pain, or sweating, call emergency services immediately.'
  if (msg.includes('cough') || msg.includes('cold'))
    return '🤧 Rest, stay hydrated, and consider honey-ginger tea for soothing relief. See a doctor if cough persists beyond 2 weeks or produces blood.'
  if (msg.includes('diabetes') || msg.includes('blood sugar'))
    return '🩺 Diabetes management involves diet, exercise, and medication. Monitor your blood sugar regularly and consult your endocrinologist for adjustments.'
  return `I'm your AI Health Assistant. You mentioned: "${message}". While I'm providing general health guidance, please consult a qualified doctor for accurate medical diagnosis and treatment.`
}
