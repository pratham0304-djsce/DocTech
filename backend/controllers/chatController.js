import ChatSession from '../models/ChatSession.js'
import ChatMessage from '../models/ChatMessage.js'

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:8000'

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateTitle = (text) => {
  if (!text) return 'New Consultation'
  const clean = text.replace(/[^a-zA-Z0-9 .,'-]/g, '').trim()
  return clean.length > 50 ? clean.slice(0, 50) + '…' : clean || 'New Consultation'
}

// ── Create Session ────────────────────────────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const session = await ChatSession.create({ userId: req.user._id })
    res.status(201).json({ session })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get All Sessions ──────────────────────────────────────────────────────────
export const getSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean()

    // Attach last message preview
    const sessionIds = sessions.map(s => s._id)
    const lastMessages = await ChatMessage.aggregate([
      { $match: { sessionId: { $in: sessionIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$sessionId', preview: { $first: '$message' } } },
    ])
    const previewMap = Object.fromEntries(lastMessages.map(m => [m._id.toString(), m.preview]))

    const result = sessions.map(s => ({
      ...s,
      preview: (previewMap[s._id.toString()] || '').slice(0, 80),
    }))

    res.json({ sessions: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Get Messages for a Session ────────────────────────────────────────────────
export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: 1 })
      .lean()
    const session = await ChatSession.findById(req.params.sessionId).lean()
    res.json({ messages, patientState: session?.patientState || {} })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── Send Message (The Pipeline Proxy) ─────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, patientState, file } = req.body
    if (!sessionId || !message) {
      return res.status(400).json({ message: 'sessionId and message are required' })
    }

    // 1. Save user message
    await ChatMessage.create({ sessionId, sender: 'user', message, file: file || undefined })

    // 2. Fetch last 15 messages for context
    const history = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean()
    const context = history.reverse().map(m => ({
      role: m.sender === 'ai' ? 'assistant' : 'user',
      content: m.message,
    }))

    // 3. Update patient state in DB if sent
    if (patientState) {
      await ChatSession.findByIdAndUpdate(sessionId, {
        patientState: { ...patientState, lastUpdated: new Date() },
      })
    }

    // 4. Forward to Python AI service orchestrator
    let aiReply = ''
    let metadata = {}
    try {
      const resp = await fetch(`${AI_SERVICE}/api/ai/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context,
          patient_state: patientState || {},
          has_file: !!file,
        }),
      })
      const data = await resp.json()
      aiReply  = data.explanation || data.reply || 'I couldn\'t process that right now.'
      metadata = {
        conditions:  data.conditions  || [],
        severity:    data.severity    || '',
        department:  data.department  || [],
        urgency:     data.urgency     || '',
        explanation: data.explanation || '',
        confidence:  data.confidence  || '',
        followUp:    data.follow_up   || [],
      }
    } catch {
      aiReply = 'I\'m having trouble connecting to the AI service. Please try again shortly.'
    }

    // 5. Save AI message
    const aiMsg = await ChatMessage.create({
      sessionId, sender: 'ai', message: aiReply, metadata,
    })

    // 6. Auto-title the session from the first user message
    const session = await ChatSession.findById(sessionId)
    if (session && session.title === 'New Consultation') {
      session.title = generateTitle(message)
      await session.save()
    }

    res.json({
      reply: aiReply,
      metadata,
      sessionTitle: session?.title,
    })
  } catch (err) {
    console.error('[Chat sendMessage]', err.message)
    res.status(500).json({ message: err.message })
  }
}

// ── Delete Session ────────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ sessionId: req.params.id })
    await ChatSession.findByIdAndDelete(req.params.id)
    res.json({ message: 'Session deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
