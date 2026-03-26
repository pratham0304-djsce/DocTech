import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import UploadButton from './UploadButton'

export default function ChatInput({ onSend, onUpload, disabled, placeholder = 'Type your answer…' }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  const submit = () => {
    const t = text.trim()
    if (!t || disabled) return
    onSend(t)
    setText('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="px-4 py-3 border-t border-[#238370]/10 bg-white">
      <div className="flex items-end gap-2">
        <UploadButton onUpload={onUpload} />

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Analysis complete. Start a new chat.' : placeholder}
          className="flex-1 resize-none rounded-xl border border-[#238370]/20 bg-[#238370]/5 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#238370]/25 transition-all max-h-28 overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ lineHeight: '1.5' }}
        />

        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#238370] text-white flex items-center justify-center hover:bg-[#1a6457] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="text-[10px] text-center text-gray-300 mt-1.5">
        AI responses are for guidance only. Always consult a licensed physician.
      </p>
    </div>
  )
}
