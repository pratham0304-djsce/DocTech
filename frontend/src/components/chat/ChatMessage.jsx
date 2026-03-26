import { Bot, User, FileText } from 'lucide-react'

const formatTime = (ts) => {
  if (!ts) return ''
  try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

const renderText = (text) => {
  if (typeof text !== 'string') return null
  return text.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <p key={i} className={i > 0 ? 'mt-1' : ''}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )}
      </p>
    )
  })
}

export default function ChatMessage({ role, content, timestamp, file }) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
        isUser ? 'bg-[#238370] text-white' : 'bg-[#238370]/10 text-[#238370]'
      }`}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Content */}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Text bubble */}
        {content && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'bg-[#238370] text-white rounded-tr-sm'
                : 'border border-[#238370]/10 text-gray-700 rounded-tl-sm'
            }`}
            style={!isUser ? { backgroundColor: 'rgba(35,131,112,0.06)' } : {}}
          >
            {renderText(content)}
          </div>
        )}

        {/* File attachment bubble */}
        {file && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${
            isUser
              ? 'bg-[#238370]/80 text-white border-[#238370]/40'
              : 'bg-white border-[#238370]/15 text-gray-600'
          }`}>
            <FileText size={13} />
            <span className="truncate max-w-[160px]">{file.name}</span>
            <span className="opacity-60">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
        )}

        <p className="text-[10px] text-gray-300 px-1">{formatTime(timestamp)}</p>
      </div>
    </div>
  )
}
