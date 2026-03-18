import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !isLoading) {
      onSend(text.trim())
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100 mt-auto rounded-b-2xl">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your symptoms..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm shadow-primary-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5 ml-0.5" />
          )}
        </button>
      </div>
      <p className="text-center text-xs text-gray-400 mt-3">
        DocTech AI can make mistakes. Always consult a real doctor for medical decisions.
      </p>
    </form>
  )
}
