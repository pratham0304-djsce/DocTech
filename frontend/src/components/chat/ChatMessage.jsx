import { User, Bot, Clock, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const navigate = useNavigate()

  const formatTime = (isoString) => {
    if (!isoString) return 'Just now'
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Look for "Recommended Departments:" pattern in the AI message
  const getDepartments = (text) => {
    if (!text || isUser) return []
    const match = text.match(/\*\*Recommended Departments:\*\*(.*)/i)
    if (!match) return []
    return match[1].split(',').map(d => d.trim()).filter(Boolean)
  }

  const handleFindDoctor = (dept) => {
    // Store the full AI triage result so DoctorFinder can attach it to the booking
    sessionStorage.setItem('pendingHopi', message.content)
    // Redirect with department filter
    navigate(`/patient/doctor-finder?department=${encodeURIComponent(dept)}`)
  }

  const recommendedDepts = getDepartments(message.content)

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      
      {/* Bot Avatar (Left) */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 hidden sm:block">
          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center shadow-md shadow-primary-200">
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div 
        className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl relative shadow-sm ${
          isUser 
            ? 'bg-primary-600 text-white rounded-br-sm' 
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
          {message.content}
        </p>
        
        <div className={`flex items-center gap-1 mt-2 text-xs ${isUser ? 'text-primary-200 justify-end' : 'text-gray-400 justify-start'}`}>
          <Clock className="h-3 w-3" />
          {formatTime(message.createdAt)}
        </div>
      </div>

      {/* User Avatar (Right) */}
      {isUser && (
        <div className="flex-shrink-0 ml-3 hidden sm:block">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <User className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      )}

      {/* Action Chips (Rendered immediately below the bubble if applicable) */}
      {!isUser && recommendedDepts.length > 0 && (
        <div className="absolute top-[100%] left-14 mt-1 flex gap-2 w-max">
          {recommendedDepts.map(dept => (
            <button
              key={dept}
              onClick={() => handleFindDoctor(dept)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-full transition-colors border border-blue-100 shadow-sm"
            >
              <Search className="w-3 h-3 border-blue-600 rounded-full" /> Find {dept} Doctor
            </button>
          ))}
        </div>
      )}

    </div>
  )
}
