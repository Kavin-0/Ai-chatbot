import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE = 'http://localhost:8000'
const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I\'m your AI study assistant. Ask me anything or upload a PDF and I\'ll help you understand it.',
}

function Icon({ children, size = 20 }) {
  return <span className="icon" style={{ width: size, height: size }} aria-hidden="true">{children}</span>
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('chatbot_token') || '')
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [authStatus, setAuthStatus] = useState('')
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fileInput = useRef(null)
  const messageEnd = useRef(null)

  useEffect(() => messageEnd.current?.scrollIntoView({ behavior: 'smooth' }), [messages, isSending])

  const authHeaders = { Authorization: `Bearer ${token}` }
  const resetChat = () => {
    setMessages([WELCOME_MESSAGE])
    setQuestion('')
    setNotice('New chat started.')
    setSidebarOpen(false)
  }

  const handleAuth = async (event) => {
    event.preventDefault()
    setAuthStatus('')
    const isRegistering = mode === 'register'
    const body = isRegistering
      ? form
      : { email: form.email, password: form.password }

    try {
      const response = await fetch(`${API_BASE}/auth/${isRegistering ? 'register' : 'login'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok || (!isRegistering && !data.access_token)) {
        setAuthStatus(data.detail || data.message || 'Something went wrong. Please try again.')
        return
      }
      if (isRegistering) {
        setMode('login')
        setForm((current) => ({ ...current, password: '' }))
        setAuthStatus('Account created. Please sign in.')
        return
      }
      localStorage.setItem('chatbot_token', data.access_token)
      setToken(data.access_token)
      setAuthStatus('')
    } catch {
      setAuthStatus('Unable to reach the backend. Make sure it is running on port 8000.')
    }
  }

  const sendMessage = async (event) => {
    event?.preventDefault()
    const text = question.trim()
    if (!text || isSending) return
    const userMessage = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages((current) => [...current, userMessage])
    setQuestion('')
    setIsSending(true)
    setNotice('')
    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ message: text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Unable to get an answer.')
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: data.response }])
    } catch (error) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: `Sorry, ${error.message}` }])
    } finally {
      setIsSending(false)
    }
  }

  const uploadFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setNotice('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const response = await fetch(`${API_BASE}/upload`, { method: 'POST', headers: authHeaders, body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Upload failed.')
      setNotice(`${data.filename || file.name} uploaded successfully.`)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const clearHistory = async () => {
    try {
      await fetch(`${API_BASE}/history`, { method: 'DELETE', headers: authHeaders })
      resetChat()
    } catch {
      setNotice('Could not clear server history, but this chat has been reset.')
      setMessages([WELCOME_MESSAGE])
    }
  }

  const logout = () => { localStorage.removeItem('chatbot_token'); setToken(''); setMessages([WELCOME_MESSAGE]); setForm({ username: '', email: '', password: '' }) }

  if (!token) return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="brand"><span className="brand-mark">✦</span> StudyBot</div>
        <div className="intro-copy"><p className="eyebrow">YOUR LEARNING COMPANION</p><h1>Learn faster.<br /><em>Ask anything.</em></h1><p>Get clear answers, explore your study material, and make every question count.</p></div>
        <div className="orb orb-one" /><div className="orb orb-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">WELCOME {mode === 'login' ? 'BACK' : 'TO STUDYBOT'}</p>
          <h2>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</h2>
          <form className="auth-form" onSubmit={handleAuth}>
            {mode === 'register' && <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Your name" required /></label>}
            <label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" minLength="4" required /></label>
            <button className="primary-button" type="submit">{mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
          </form>
          {authStatus && <p className="form-status">{authStatus}</p>}
          <p className="auth-switch">{mode === 'login' ? 'New here?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setAuthStatus('') }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        </div>
      </section>
    </main>
  )

  return (
    <div className="chat-app">
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-top"><div className="brand"><span className="brand-mark">✦</span> StudyBot</div><button className="close-menu" onClick={() => setSidebarOpen(false)}>×</button></div>
        <button className="new-chat" onClick={resetChat}><Icon>＋</Icon> New conversation</button>
        <div className="nav-label">WORKSPACE</div>
        <button className="nav-item active"><Icon>◈</Icon> AI assistant</button>
        <button className="nav-item" onClick={() => fileInput.current?.click()}><Icon>↥</Icon> Upload document</button>
        <input ref={fileInput} className="file-input" type="file" accept=".pdf" onChange={uploadFile} />
        <div className="sidebar-bottom"><button className="nav-item" onClick={clearHistory}><Icon>⌫</Icon> Clear history</button><button className="nav-item" onClick={logout}><Icon>⇥</Icon> Sign out</button><p>StudyBot · AI powered</p></div>
      </aside>
      <div className="chat-shell">
        <header className="chat-header"><button className="menu-button" onClick={() => setSidebarOpen(true)}>☰</button><div><p>AI STUDY ASSISTANT</p><h2>How can I help today?</h2></div><div className="online"><span /> Online</div></header>
        <main className="conversation">
          <div className="conversation-inner">
            {messages.map((message) => <article className={`message ${message.role}`} key={message.id}><div className="avatar">{message.role === 'assistant' ? '✦' : 'You'}</div><div className="message-content"><span>{message.role === 'assistant' ? 'StudyBot' : 'You'}</span><p>{message.content}</p></div></article>)}
            {isSending && <article className="message assistant"><div className="avatar">✦</div><div className="typing"><i /><i /><i /></div></article>}
            <div ref={messageEnd} />
          </div>
        </main>
        <footer className="composer-area">
          {notice && <div className="notice">{notice}</div>}
          <form className="composer" onSubmit={sendMessage}><button type="button" className="attach" title="Upload PDF" onClick={() => fileInput.current?.click()} disabled={isUploading}>⌕</button><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Message StudyBot..." disabled={isSending} /><button className="send" type="submit" disabled={!question.trim() || isSending}>↑</button></form>
          <p className="disclaimer">StudyBot can make mistakes. Check important information.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
