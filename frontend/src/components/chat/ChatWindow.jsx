import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatWindow({ messages, onSendMessage, isLoading }) {
  // Ref to the scrollable messages container (NOT a child element)
  const messagesContainerRef = useRef(null)

  // Skip the very first time messages populate (from history load)
  const isInitialLoad = useRef(true)
  const prevLengthRef = useRef(0)

  useEffect(() => {
    if (isInitialLoad.current) {
      // First paint — just record the length, don't scroll the page
      prevLengthRef.current = messages.length
      isInitialLoad.current = false
      return
    }
    // Only scroll within the chat container when a NEW message is added
    if (messages.length > prevLengthRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
    prevLengthRef.current = messages.length
  }, [messages, isLoading])

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      
      {/* Header */}
      <div className="bg-primary-600 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <h2 className="text-lg font-semibold text-white">DocTech AI Assistant</h2>
          <p className="text-primary-100 text-sm">Online &bull; Analyzing symptoms</p>
        </div>
      </div>

      {/* Messages Area — scrollable container */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🤖</span>
            </div>
            <p>How can I help you today?</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}
        
        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <ChatInput onSend={onSendMessage} isLoading={isLoading} />
    </div>
  )
}
