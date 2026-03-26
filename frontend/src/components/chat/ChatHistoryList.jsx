import { Plus, History } from 'lucide-react'
import ChatHistoryItem from './ChatHistoryItem'

export default function ChatHistoryList({ sessions, activeId, onSelect, onDelete, onNewChat }) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-[#238370]/10">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0 border-b border-[#238370]/10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <History size={15} className="text-[#238370]" />
            <h2 className="font-semibold text-gray-800 text-sm">Chat History</h2>
          </div>
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#238370] text-white text-xs font-medium rounded-lg hover:bg-[#1a6457] active:scale-95 transition-all"
          >
            <Plus size={12} /> New
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <History size={24} className="text-[#238370]/20 mb-2" />
            <p className="text-xs text-gray-400">No past chats yet</p>
          </div>
        ) : (
          sessions.map(s => (
            <ChatHistoryItem
              key={s.id}
              session={s}
              isActive={s.id === activeId}
              onClick={() => onSelect(s)}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
