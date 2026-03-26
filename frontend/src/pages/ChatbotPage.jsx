import { useState, useEffect, useCallback } from 'react'
import ChatHistoryList from '../components/chat/ChatHistoryList'
import ChatWindow from '../components/chat/ChatWindow'
import request from '../utils/api'

export default function ChatbotPage() {
  const [sessions, setSessions]       = useState([])
  const [activeSession, setActive]    = useState(null)
  const [loadingSessions, setLoading] = useState(true)
  const [mobileView, setMobileView]   = useState('chat')

  // ── Fetch sessions from backend ────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const data = await request('/chat/sessions')
      const mapped = (data.sessions || []).map(s => ({
        id: s._id,
        backendId: s._id,
        title: s.title || 'New Consultation',
        preview: s.preview || '',
        updatedAt: s.updatedAt,
        patientData: s.patientState || {},
      }))
      setSessions(mapped)
    } catch { /* silent */ } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // ── Create new session on backend ──────────────────────────────
  const handleNewChat = async () => {
    try {
      const data = await request('/chat/session', { method: 'POST' })
      const s = {
        id: data.session._id,
        backendId: data.session._id,
        title: 'New Consultation',
        preview: '',
        updatedAt: new Date().toISOString(),
        patientData: {},
      }
      setSessions(prev => [s, ...prev])
      setActive(s)
      setMobileView('chat')
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  // ── Select a past session → load its messages ──────────────────
  const handleSelect = async (s) => {
    try {
      const data = await request(`/chat/messages/${s.backendId || s.id}`)
      const restoredMessages = (data.messages || []).map(m => ({
        id: m._id,
        role: m.sender === 'ai' ? 'ai' : 'user',
        content: m.message,
        timestamp: m.createdAt,
        file: m.file || null,
        metadata: m.metadata || null,
      }))
      setActive({
        ...s,
        restoredMessages: restoredMessages.length > 0 ? restoredMessages : null,
        patientData: data.patientState || s.patientData || {},
      })
    } catch {
      setActive(s)
    }
    setMobileView('chat')
  }

  // ── Delete session ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    const session = sessions.find(s => s.id === id)
    const backendId = session?.backendId || id
    try {
      await request(`/chat/session/${backendId}`, { method: 'DELETE' })
    } catch { /* silent */ }
    setSessions(prev => prev.filter(s => s.id !== id))
    if (activeSession?.id === id) setActive(null)
  }

  // ── ChatWindow reports updates ─────────────────────────────────
  const handleSessionUpdate = ({ patientData, title, sessionTitle }) => {
    const displayTitle = sessionTitle || title || 'Health Consultation'
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSession?.id
          ? { ...s, title: displayTitle, preview: patientData?.symptom?.slice(0, 60) || '', updatedAt: new Date().toISOString() }
          : s
      )
    )
  }

  return (
    <div
      className="flex rounded-2xl shadow-sm border border-[#238370]/10 overflow-hidden bg-white"
      style={{ height: 'calc(100vh - 10rem)' }}
    >
      {/* Mobile: back bar */}
      {mobileView === 'chat' && (
        <button
          onClick={() => setMobileView('list')}
          className="lg:hidden absolute top-20 left-4 z-10 text-xs text-[#238370] flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow-sm border border-[#238370]/15"
        >
          ← History
        </button>
      )}

      {/* ── LEFT: History Panel ── */}
      <div className={`
        flex-shrink-0 border-r border-[#238370]/10
        w-full lg:w-72 xl:w-80
        ${mobileView === 'list' ? 'block' : 'hidden lg:block'}
      `}>
        <ChatHistoryList
          sessions={sessions}
          activeId={activeSession?.id}
          onSelect={handleSelect}
          onDelete={handleDelete}
          onNewChat={handleNewChat}
        />
      </div>

      {/* ── RIGHT: Chat Window ── */}
      <div className={`flex-1 min-w-0 ${mobileView === 'chat' ? 'block' : 'hidden lg:block'}`}>
        {!activeSession ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#238370]/10 flex items-center justify-center">
              <span className="text-3xl">🩺</span>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Start a new conversation</p>
              <p className="text-sm text-gray-400 mt-1">with your AI health assistant</p>
            </div>
            <button
              onClick={handleNewChat}
              className="px-5 py-2.5 bg-[#238370] text-white text-sm font-semibold rounded-xl hover:bg-[#1a6457] active:scale-95 transition-all"
            >
              + New Chat
            </button>
          </div>
        ) : (
          <ChatWindow
            key={activeSession.id}
            session={activeSession}
            onSessionUpdate={handleSessionUpdate}
          />
        )}
      </div>
    </div>
  )
}
