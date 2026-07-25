import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAppAuth } from '../context/AppAuthContext'

const API_ORIGIN = new URL(api.defaults.baseURL).origin

function resolveLogoUrl(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ChatPage() {
  const { t } = useTranslation()
  const { conversationId } = useParams()
  const [searchParams] = useSearchParams()
  const vendorId = searchParams.get('vendorId')
  const navigate = useNavigate()
  const { isAuthenticated, isCustomer } = useAppAuth()

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(conversationId ? parseInt(conversationId) : null)
  const [messages, setMessages] = useState([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [pendingImageUrl, setPendingImageUrl] = useState(null)
  const [loadingConvs, setLoadingConvs] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [activeVendor, setActiveVendor] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const bottomRef = useRef(null)
  const pollRef = useRef(null)
  const convPollRef = useRef(null)
  const menuRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      navigate('/register', { state: { from: window.location.pathname + window.location.search } })
      return
    }
    const initChat = async () => {
      if (vendorId) {
        try {
          const r = await api.post(`/my/chat/conversations/vendor/${vendorId}`)
          const conv = r.data.data
          setActiveId(conv.id)
          setActiveVendor(conv.vendor)
          navigate(`/chat/${conv.id}`, { replace: true })
        } catch { /* fallthrough */ }
      }
      loadConversations()
    }
    initChat()
  }, [isAuthenticated, isCustomer, vendorId])

  useEffect(() => {
    clearInterval(convPollRef.current)
    convPollRef.current = setInterval(() => {
      loadConversations({ silent: true })
    }, 5000)

    return () => clearInterval(convPollRef.current)
  }, [])

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId)
      startPolling(activeId)
    }
    return () => clearInterval(pollRef.current)
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadConversations = ({ silent = false } = {}) => {
    if (!silent) setLoadingConvs(true)
    api.get('/my/chat/conversations')
      .then(r => setConversations(r.data.data || []))
      .catch(() => {})
      .finally(() => {
        if (!silent) setLoadingConvs(false)
      })
  }

  const loadMessages = (id) => {
    setLoadingMsgs(true)
    api.get(`/my/chat/conversations/${id}/messages`)
      .then(r => {
        setMessages(r.data.data || [])
        setConversations(prev => prev.map(c => (c.id === id ? { ...c, unread_count: 0 } : c)))
        window.dispatchEvent(new Event('chat-unread-refresh'))
      })
      .catch(() => {})
      .finally(() => setLoadingMsgs(false))
  }

  const startPolling = (id) => {
    clearInterval(pollRef.current)
    pollRef.current = setInterval(() => {
      api.get(`/my/chat/conversations/${id}/messages`)
        .then(r => setMessages(r.data.data || []))
        .then(() => loadConversations({ silent: true }))
        .catch(() => {})
    }, 5000)
  }

  const selectConversation = (conv) => {
    setActiveId(conv.id)
    setActiveVendor(conv.vendor)
    setConversations(prev => prev.map(c => (c.id === conv.id ? { ...c, unread_count: 0 } : c)))
    setImagePreview(null)
    setPendingImageUrl(null)
    navigate(`/chat/${conv.id}`, { replace: true })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if ((!body.trim() && !pendingImageUrl) || !activeId || sending) return
    setSending(true)
    try {
      const payload = {}
      if (body.trim()) payload.body = body.trim()
      if (pendingImageUrl) payload.image_url = pendingImageUrl
      const r = await api.post(`/my/chat/conversations/${activeId}/messages`, payload)
      setMessages(prev => [...prev, r.data.data])
      setBody('')
      setImagePreview(null)
      setPendingImageUrl(null)
      loadConversations()
    } catch { /* ignore */ } finally { setSending(false) }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setUploadingImage(true)
    try {
      const form = new FormData()
      form.append('image', file)
      const r = await api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPendingImageUrl(r.data.data.url)
    } catch {
      setImagePreview(null)
      setPendingImageUrl(null)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleCloseChat = () => {
    setMenuOpen(false)
    clearInterval(pollRef.current)
    setActiveId(null)
    setMessages([])
    setActiveVendor(null)
    setImagePreview(null)
    setPendingImageUrl(null)
    navigate('/chat', { replace: true })
  }

  const handleClearChat = async () => {
    if (!activeId || clearing) return
    setMenuOpen(false)
    setClearing(true)
    try {
      await api.delete(`/my/chat/conversations/${activeId}/messages`)
      setMessages([])
      loadConversations()
    } catch { /* ignore */ } finally { setClearing(false) }
  }

  const activeConv = conversations.find(c => c.id === activeId)
  const displayVendor = activeVendor || activeConv?.vendor

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 0, background: '#f8fafc', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, flexShrink: 0, minHeight: 0, background: '#fff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #f3f4f6' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>{t('chatPage.messages', 'Messages')}</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>{t('chatPage.chatWithVendors', 'Chat with vendors')}</p>
        </div>
        <div className="chat-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loadingConvs ? (
            <div style={{ padding: 24, color: '#9ca3af', fontSize: 14, textAlign: 'center' }}>{t('common.loading')}</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{t('chatPage.noConversations', 'No conversations yet.')}</p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>{t('chatPage.visitVendor', 'Visit a vendor profile to start chatting.')}</p>
            </div>
          ) : conversations.map(conv => (
            <button key={conv.id} onClick={() => selectConversation(conv)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', background: conv.id === activeId ? '#eef2ff' : 'transparent', borderLeft: conv.id === activeId ? '3px solid #4f46e5' : '3px solid transparent', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0, overflow: 'hidden' }}>
                {conv.vendor?.logo_url ? <img src={resolveLogoUrl(conv.vendor.logo_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : conv.vendor?.name?.[0]?.toUpperCase() ?? 'V'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.vendor?.name}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginLeft: 6 }}>{formatTime(conv.last_message_at)}</span>
                </div>
                <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ margin: 0, flex: 1, minWidth: 0, fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.last_message ? <>{conv.last_message.sender_type === 'user' ? `${t('chatPage.you', 'You')}: ` : ''}{conv.last_message.image_url && !conv.last_message.body ? `📷 ${t('chatPage.image', 'Image')}` : conv.last_message.body}</> : t('chatPage.startConversation', 'Start the conversation')}
                  </p>
                  {(conv.unread_count || 0) > 0 && (
                    <span
                      key={`unread-${conv.id}-${conv.unread_count}`}
                      style={{ flexShrink: 0, minWidth: 18, height: 18, padding: '0 6px', borderRadius: 999, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', animation: 'badgePop 0.3s ease-out' }}
                    >
                      {conv.unread_count > 99 ? '99+' : conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat area */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!activeId ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ fontSize: 52 }}>💬</div>
            <h3 style={{ margin: 0, fontSize: 18, color: '#374151', fontWeight: 600 }}>{t('chatPage.selectConversation', 'Select a conversation')}</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#9ca3af' }}>{t('chatPage.chooseVendor', 'Choose a vendor from the list to start messaging')}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, overflow: 'hidden', flexShrink: 0 }}>
                {displayVendor?.logo_url ? <img src={resolveLogoUrl(displayVendor.logo_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : displayVendor?.name?.[0]?.toUpperCase() ?? 'V'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{displayVendor?.name ?? 'Vendor'}</div>
                <div style={{ fontSize: 12, color: '#10b981' }}>{t('chatPage.active', 'Active')}</div>
              </div>

              {/* Three-dot menu */}
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(o => !o)}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: menuOpen ? '#f3f4f6' : 'transparent', border: '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}
                  title="Options"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#6b7280' }}>
                    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                  </svg>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, minWidth: 170, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                    <button
                      onClick={handleCloseChat}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: 14, color: '#374151', textAlign: 'left' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      {t('chatPage.closeChat', 'Close Chat')}
                    </button>
                    <button
                      onClick={handleClearChat}
                      disabled={clearing}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 16px', background: 'none', border: 'none', cursor: clearing ? 'not-allowed' : 'pointer', fontSize: 14, color: '#dc2626', textAlign: 'left', opacity: clearing ? 0.6 : 1 }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      {clearing ? t('chatPage.clearing', 'Clearing…') : t('chatPage.clearChat', 'Clear Chat')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loadingMsgs ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{t('chatPage.loadingMessages', 'Loading messages…')}</div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 40 }}>{t('chatPage.noMessages', 'No messages yet. Say hello!')}</div>
              ) : messages.map(msg => {
                const isMe = msg.sender_type === 'user'
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '68%', padding: msg.image_url && !msg.body ? '6px' : '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? '#4f46e5' : '#fff', color: isMe ? '#fff' : '#111827', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14, lineHeight: 1.5 }}>
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="Shared"
                          style={{ display: 'block', maxWidth: '100%', maxHeight: 260, borderRadius: 12, objectFit: 'cover', marginBottom: msg.body ? 8 : 0 }}
                        />
                      )}
                      {msg.body && <p style={{ margin: 0 }}>{msg.body}</p>}
                      <div style={{ fontSize: 11, marginTop: 4, opacity: 0.65, textAlign: isMe ? 'right' : 'left' }}>{formatTime(msg.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Image preview strip */}
            {imagePreview && (
              <div style={{ background: '#fff', borderTop: '1px solid #f3f4f6', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ position: 'relative' }}>
                  <img src={imagePreview} alt="Preview" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 8, border: '2px solid #e5e7eb' }} />
                  {uploadingImage && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 18, height: 18, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                  )}
                </div>
                {!uploadingImage && (
                  <button onClick={() => { setImagePreview(null); setPendingImageUrl(null) }} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>✕ Remove</button>
                )}
                <span style={{ fontSize: 12, color: '#6b7280' }}>{uploadingImage ? t('chatPage.uploading', 'Uploading…') : t('chatPage.readyToSend', 'Ready to send')}</span>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} style={{ background: '#fff', borderTop: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Send image"
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              </button>
              <input
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={t('chatPage.typePlaceholder', 'Type a message…')}
                style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 24, padding: '10px 18px', fontSize: 14, outline: 'none', background: '#f9fafb' }}
              />
              <button
                type="submit"
                disabled={(!body.trim() && !pendingImageUrl) || sending || uploadingImage}
                style={{ padding: '10px 22px', borderRadius: 24, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, fontSize: 14, cursor: (body.trim() || pendingImageUrl) && !sending && !uploadingImage ? 'pointer' : 'not-allowed', opacity: (body.trim() || pendingImageUrl) && !sending && !uploadingImage ? 1 : 0.5, transition: 'opacity 0.2s', flexShrink: 0 }}
              >
                {sending ? '…' : t('chatPage.send', 'Send')}
              </button>
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes badgePop {
          0% { transform: scale(0.7); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .chat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
