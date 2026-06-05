import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap, RefreshCw } from 'lucide-react'
import { aiApi } from '../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const STARTER_PROMPTS = [
  'How can I improve my savings rate?',
  'Analyze my spending habits',
  'What\'s the best way to reach my goals faster?',
  'Help me create a budget plan',
  'Should I pay off debt or invest?',
  'How is my financial health score calculated?',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'var(--bg-card)' }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full"
          style={{ background: 'var(--purple-light)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
      ))}
    </div>
  )
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your PesaPilot AI financial advisor. I've analyzed your financial data and I'm ready to provide personalized advice.\n\nYou can ask me anything about your spending habits, savings goals, budget optimization, or investment strategies. What would you like to explore today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await aiApi.chat(text, history)
      const aiMsg: Message = {
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your backend connection and try again.",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I'm still here with your financial data loaded. What would you like to know?",
      timestamp: new Date(),
    }])
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 73px)' }}>
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 scroll-area">
        {/* AI Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-2"
          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)' }}
        >
          <Zap size={15} style={{ color: 'var(--purple-light)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            AI Advisor has access to your transactions, goals, budget, and financial health score.
          </p>
          <button onClick={clearChat} className="ml-auto" style={{ color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
          </button>
        </motion.div>

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                style={{
                  background: msg.role === 'assistant' ? 'var(--gradient-brand)' : 'rgba(255,255,255,0.1)',
                }}
              >
                {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                }`}
                style={
                  msg.role === 'user'
                    ? { background: 'var(--gradient-brand)', color: 'white' }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
                }
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1.5 opacity-60">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--gradient-brand)' }}>
              <Bot size={16} className="text-white" />
            </div>
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter prompts */}
      {messages.length <= 1 && (
        <div className="px-8 pb-3">
          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="px-8 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="flex items-end gap-3 rounded-2xl p-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <textarea
            id="advisor-input"
            rows={1}
            placeholder="Ask your AI financial advisor anything..."
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(120, e.target.scrollHeight) + 'px'
            }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            className="flex-1 bg-transparent text-sm outline-none resize-none py-2 px-2 leading-relaxed"
            style={{ color: 'var(--text-primary)', minHeight: '36px' }}
          />
          <button
            id="send-message-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{
              background: input.trim() && !loading ? 'var(--gradient-brand)' : 'var(--border)',
              opacity: !input.trim() || loading ? 0.5 : 1,
            }}
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
