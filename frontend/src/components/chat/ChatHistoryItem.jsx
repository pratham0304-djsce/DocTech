import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Trash2 } from 'lucide-react'

export default function ChatHistoryItem({ session, isActive, onClick, onDelete }) {
  const timeAgo = session.updatedAt
    ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })
    : 'Just now'

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col gap-1 px-4 py-3 rounded-xl cursor-pointer transition-all border ${
        isActive
          ? 'bg-[#238370] border-[#238370] text-white'
          : 'bg-white border-[#238370]/10 hover:border-[#238370]/30 hover:bg-[#238370]/5'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 pr-5">
        <MessageSquare size={13} className={`flex-shrink-0 ${isActive ? 'text-white/70' : 'text-[#238370]/40'}`} />
        <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-800'}`}>
          {session.title}
        </p>
      </div>
      {session.preview && (
        <p className={`text-xs truncate pl-5 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
          {session.preview}
        </p>
      )}
      <p className={`text-[10px] pl-5 ${isActive ? 'text-white/50' : 'text-gray-300'}`}>{timeAgo}</p>

      <button
        onClick={e => { e.stopPropagation(); onDelete(session.id) }}
        className={`absolute right-2 top-2.5 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity ${
          isActive ? 'hover:bg-white/20 text-white/70' : 'hover:bg-[#238370]/10 text-[#238370]/40 hover:text-[#238370]'
        }`}
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}
