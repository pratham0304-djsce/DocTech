import { useState, useEffect, useCallback } from 'react'
import ChatHistoryList from '../components/chat/ChatHistoryList'
import ChatViewer from '../components/chat/ChatViewer'
import request from '../utils/api'

export default function ChatHistoryPage() {
  const [sessions, setSessions]             = useState([])
  const [activeSession, setActiveSession]   = useState(null)
  const [messages, setMessages]             = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [sending, setSending]               = useState(false)
  const [mobileView, setMobileView]         = useState('list') // 'list' | 'chat'

  // ── Fetch all sessions ──────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const data = await request('/chat/sessions')
      setSessions(data.sessions || [])
    } catch (err) {
      console.error('Failed to load sessions:', err.message)
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // ── Select a session ───────────────────────────────────────────
  const handleSelectSession = async (session) => {
    setActiveSession(session)
    setMessages([])
    setMobileView('chat')
    try {
      const data = await request(`/chat/messages/${session._id}`)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Failed to load messages:', err.message)
    }
  }

  // ── Create new session ─────────────────────────────────────────
  const handleNewChat = async () => {
    try {
      const data = await request('/chat/session', { method: 'POST' })
      const newSession = { ...data.session, preview: '' }
      setSessions(prev => [newSession, ...prev])
      setActiveSession(newSession)
      setMessages([])
      setMobileView('chat')
    } catch (err) {
      console.error('Failed to create session:', err.message)
    }
  }

  // ── Delete session ─────────────────────────────────────────────
  const handleDeleteSession = async (sessionId) => {
    try {
      await request(`/chat/session/${sessionId}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s._id !== sessionId))
      if (activeSession?._id === sessionId) {
        setActiveSession(null)
        setMessages([])
        setMobileView('list')
      }
    } catch (err) {
      console.error('Failed to delete session:', err.message)
    }
  }

  // ── Send message ───────────────────────────────────────────────
  const handleSendMessage = async (text) => {
    if (!activeSession || sending) return

    // Optimistic UI
    const userMsg = { sender: 'user', message: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setSending(true)

    try {
      const data = await request('/chat/message', {
        method: 'POST',
        body: JSON.stringify({ sessionId: activeSession._id, message: text }),
      })

      const aiMsg = { sender: 'ai', message: data.reply, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, aiMsg])

      // Update session title if auto-generated
      if (data.sessionTitle && data.sessionTitle !== activeSession.title) {
        const updatedSession = { ...activeSession, title: data.sessionTitle, preview: text.slice(0, 80) }
        setActiveSession(updatedSession)
        setSessions(prev =>
          prev.map(s => s._id === activeSession._id ? { ...s, title: data.sessionTitle, preview: text.slice(0, 80) } : s)
        )
      } else {
        setSessions(prev =>
          prev.map(s => s._id === activeSession._id ? { ...s, preview: text.slice(0, 80) } : s)
        )
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', message: 'Sorry, I couldn\'t process your message. Please try again.', timestamp: new Date().toISOString() },
      ])
    } finally {
      setSending(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="flex rounded-2xl shadow-sm border border-[#238370]/10 overflow-hidden bg-white" style={{ height: 'calc(100vh - 10rem)' }}>

      {/* Mobile back button bar */}
      {mobileView === 'chat' && (
        <div className="lg:hidden absolute top-20 left-4 z-10">
          <button
            onClick={() => setMobileView('list')}
            className="text-xs text-[#238370] flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl shadow border border-[#238370]/15"
          >
            ← Back to chats
          </button>
        </div>
      )}

      {/* LEFT PANEL — sessions list */}
      <div className={`
        w-full lg:w-auto lg:col-span-1 flex-shrink-0
        lg:block border-r border-[#238370]/10
        ${mobileView === 'list' ? 'block' : 'hidden lg:block'}
        lg:w-72 xl:w-80
      `}>
        <ChatHistoryList
          sessions={sessions}
          activeSessionId={activeSession?._id}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onNewChat={handleNewChat}
          loading={loadingSessions}
        />
      </div>

      {/* RIGHT PANEL — chat viewer */}
      <div className={`
        flex-1 min-w-0
        ${mobileView === 'chat' ? 'block' : 'hidden lg:block'}
      `}>
        <ChatViewer
          session={activeSession}
          messages={messages}
          onSendMessage={handleSendMessage}
          sending={sending}
        />
      </div>
    </div>
  )
}
