import { useEffect, useRef, useState, useCallback } from 'react'
import './App.css'

const API_BASE = '' // Vite proxy forwards /auth, /chat, etc. → http://localhost:8000


const SUGGESTIONS = [
  '✦ Summarize a PDF for me',
  '🧠 Explain a complex topic',
  '📝 Help me study for an exam',
  '🔍 Answer a question from my notes',
]

/* ── Utility: auto-grow textarea ── */
function autoGrow(el) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 140) + 'px'
}

/* ── Auth Page ───────────────────────────────────────────── */
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [status, setStatus] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const switchMode = () => { setMode(m => m === 'login' ? 'register' : 'login'); setStatus({ text: '', type: '' }) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ text: '', type: '' })
    setLoading(true)
    const isReg = mode === 'register'
    const body = isReg ? form : { email: form.email, password: form.password }
    try {
      const res = await fetch(`${API_BASE}/auth/${isReg ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok || (!isReg && !data.access_token)) {
        setStatus({ text: data.detail || data.message || 'Something went wrong.', type: 'error' })
        return
      }
      if (isReg) {
        setMode('login')
        setForm(f => ({ ...f, password: '' }))
        setStatus({ text: 'Account created! Please sign in.', type: 'success' })
        return
      }
      localStorage.setItem('chatbot_token', data.access_token)
      onLogin(data.access_token)
    } catch {
      setStatus({ text: 'Cannot reach server. Make sure the backend is running.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      {/* Left hero panel */}
      <section className="auth-intro">
        <div className="grid-lines" />
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />

        <div className="auth-intro brand">
          <span className="brand-icon">✦</span>
          Nix
        </div>

        <div className="intro-body">
          <div className="pill-badge">AI-Powered Learning</div>
          <h1>
            Learn smarter.<br />
            <span className="gradient-text">Ask anything.</span>
          </h1>
          <p>
            Upload your PDFs, ask questions, get clear answers instantly.
            Your personal AI study companion, always ready.
          </p>
          <ul className="feature-list">
            <li><span className="feature-icon">📄</span> Upload & analyze PDF documents</li>
            <li><span className="feature-icon">💬</span> Natural conversation interface</li>
            <li><span className="feature-icon">⚡</span> Instant answers powered by Gemini</li>
            <li><span className="feature-icon">🔐</span> Secure, private conversations</li>
          </ul>
        </div>
      </section>

      {/* Right auth panel */}
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">WELCOME {mode === 'login' ? 'BACK' : 'TO STUDYBOT'}</p>
          <h2>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <label>
                Full name
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input value={form.username} onChange={update('username')} placeholder="Your name" required />
                </div>
              </label>
            )}
            <label>
              Email address
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
              </div>
            </label>
            <label>
              Password
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input type="password" value={form.password} onChange={update('password')} placeholder="••••••••" minLength="4" required />
              </div>
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
              {!loading && <span className="btn-arrow">→</span>}
            </button>
          </form>

          {status.text && <p className={`form-status ${status.type}`}>{status.text}</p>}

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={switchMode}>
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

/* ── Message Bubble ──────────────────────────────────────── */
function Message({ msg }) {
  const isBot = msg.role === 'assistant'
  return (
    <article className={`message ${msg.role}`}>
      <div className={`avatar ${isBot ? 'bot-avatar' : 'user-avatar'}`}>
        {isBot ? '✦' : 'Me'}
      </div>
      <div className="message-wrap">
        <span className="message-meta">{isBot ? 'Nix' : 'You'}</span>
        <div className="message-bubble">{msg.content}</div>
      </div>
    </article>
  )
}

/* ── Typing Indicator ────────────────────────────────────── */
function TypingIndicator() {
  return (
    <article className="message assistant">
      <div className="avatar bot-avatar">✦</div>
      <div className="message-wrap">
        <span className="message-meta">Nix</span>
        <div className="typing-bubble">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </article>
  )
}

/* ── Empty State ─────────────────────────────────────────── */
function EmptyState({ onChip }) {
  return (
    <div className="empty-state">
      <div className="empty-avatar">✦</div>
      <h3>How can I help you today?</h3>
      <p>Ask me anything, upload a PDF, or choose a suggestion below to get started.</p>
      <div className="suggestion-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => onChip(s.replace(/^[^\s]+\s/, ''))}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Main Chat App ───────────────────────────────────────── */
function ChatApp({ token, onLogout }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notice, setNotice] = useState({ text: '', type: '' })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)
  const bottomRef = useRef(null)

  const authHeaders = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const showNotice = (text, type = 'info') => {
    setNotice({ text, type })
    setTimeout(() => setNotice({ text: '', type: '' }), 4000)
  }

  const resetChat = () => {
    setMessages([])
    setInput('')
    setSidebarOpen(false)
  }

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isSending) return

    const userMsg = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsSending(true)
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Unable to get a response.')
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `⚠️ ${err.message}` }])
    } finally {
      setIsSending(false)
    }
  }, [input, isSending, authHeaders])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', headers: authHeaders, body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed.')
      showNotice(`✓ "${data.filename || file.name}" uploaded successfully`, 'success')
    } catch (err) {
      showNotice(`✗ ${err.message}`, 'error')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE', headers: authHeaders })
      resetChat()
      showNotice('Chat history cleared.', 'success')
    } catch {
      resetChat()
      showNotice('Chat reset (server history may remain).', 'info')
    }
  }

  const logout = () => {
    localStorage.removeItem('chatbot_token')
    onLogout()
  }

  return (
    <div className="chat-app">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <span className="brand-icon">✦</span>
            Nix
          </div>
          <button className="close-menu" onClick={() => setSidebarOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <button className="new-chat-btn" onClick={resetChat}>
          <span>＋</span> New conversation
        </button>

        <p className="nav-section-label">Workspace</p>
        <button className="nav-item active">
          <span className="nav-item-icon">◈</span> AI Assistant
        </button>
        <button className="nav-item" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <span className="nav-item-icon">↥</span>
          {isUploading ? 'Uploading…' : 'Upload PDF'}
        </button>
        <input ref={fileInputRef} className="file-input" type="file" accept=".pdf" onChange={handleUpload} />

        <p className="nav-section-label">Account</p>
        <button className="nav-item" onClick={clearHistory}>
          <span className="nav-item-icon">⌫</span> Clear history
        </button>
        <button className="nav-item" onClick={logout}>
          <span className="nav-item-icon">⇥</span> Sign out
        </button>

        <div className="sidebar-bottom">
          <p className="sidebar-footer-text">Nix · Gemini AI powered</p>
        </div>
      </aside>

      {/* ── Main shell ── */}
      <div className="chat-shell">
        {/* Header */}
        <header className="chat-header">
          <div className="header-left">
            <button className="menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
            <div className="header-title-group">
              <p>AI STUDY ASSISTANT</p>
              <h2>How can I help today?</h2>
            </div>
          </div>
          <div className="status-badge">
            <span className="status-dot" />
            <span>Online</span>
          </div>
        </header>

        {/* Messages */}
        <main className="conversation">
          <div className="conversation-inner">
            {messages.length === 0
              ? <EmptyState onChip={(text) => sendMessage(text)} />
              : messages.map(m => <Message key={m.id} msg={m} />)
            }
            {isSending && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </main>

        {/* Composer */}
        <footer className="composer-area">
          <div className="composer-wrap">
            {notice.text && (
              <div className={`notice-bar ${notice.type}`}>{notice.text}</div>
            )}
            <div className="composer">
              <textarea
                ref={textareaRef}
                className="composer-input"
                value={input}
                rows={1}
                placeholder="Message Nix… (Shift+Enter for new line)"
                disabled={isSending}
                onChange={(e) => { setInput(e.target.value); autoGrow(e.target) }}
                onKeyDown={handleKeyDown}
              />
              <div className="composer-actions">
                {isUploading
                  ? <div className="upload-indicator"><span className="upload-spinner" />Uploading</div>
                  : (
                    <button
                      className="icon-btn"
                      title="Upload PDF"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending}
                      aria-label="Upload PDF"
                    >
                      📎
                    </button>
                  )
                }
                <button
                  className="send-btn"
                  disabled={!input.trim() || isSending}
                  onClick={() => sendMessage()}
                  aria-label="Send message"
                >
                  ↑
                </button>
              </div>
            </div>
            <div className="composer-footer">
              <span className="disclaimer">Nix may make mistakes · Always verify important information</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

/* ── Root App ────────────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('chatbot_token') || '')

  if (!token) {
    return <AuthPage onLogin={(t) => setToken(t)} />
  }

  return <ChatApp token={token} onLogout={() => setToken('')} />
}


