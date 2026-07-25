import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppAuth } from '../context/AppAuthContext'
import { useCart } from '../context/CartContext'
import api from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

const CUSTOMER_NOTIF_ICONS = {
  order_status_updated:  '📦',
  booking_confirmed:     '✅',
  booking_status_updated:'📋',
  vendor_approved:       '✅',
  vendor_rejected:       '❌',
  vendor_banned:         '🚫',
}

function customerNotifTitle(n, t) {
  if (n.title) return n.title
  const e = n.event
  const p = n.payload || {}
  if (e === 'order_status_updated') return `${t('orders.orderNumber', { id: p.order_id })}: ${p.status || t('common.status')}`
  if (e === 'booking_confirmed') return t('bookings.title') + `: ${p.service || ''}`
  if (e === 'booking_status_updated') return `${p.status || ''}: ${p.service || ''}`
  if (e === 'vendor_approved') return t('common.approved')
  if (e === 'vendor_rejected') return t('common.rejected')
  if (e === 'vendor_banned') return t('common.banned')
  return n.event?.replace(/_/g, ' ') || t('common.notifications')
}

function MainLayout() {
  const { t } = useTranslation()
  const { user, isAuthenticated, isVendor, isCustomer, logout } = useAppAuth()
  const { cartCount } = useCart()
  const [chatUnread, setChatUnread] = useState(0)
  const [notifCount, setNotifCount] = useState(0)
  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)
  const notifRef = useRef(null)
  const chatPollRef = useRef(null)
  const notifPollRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isChatRoute = location.pathname.startsWith('/chat')

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setChatUnread(0)
      setNotifCount(0)
      clearInterval(chatPollRef.current)
      clearInterval(notifPollRef.current)
      return
    }

    const loadChatUnread = () => {
      api.get('/my/chat/unread')
        .then(r => setChatUnread(r.data?.data?.unread || 0))
        .catch(() => {})
    }

    const loadNotifCount = () => {
      api.get('/my/notifications/count')
        .then(r => setNotifCount(r.data?.data?.count || 0))
        .catch(() => {})
    }

    loadChatUnread()
    loadNotifCount()
    clearInterval(chatPollRef.current)
    clearInterval(notifPollRef.current)
    chatPollRef.current = setInterval(loadChatUnread, 5000)
    notifPollRef.current = setInterval(loadNotifCount, 15000)

    const handleRefresh = () => loadChatUnread()
    window.addEventListener('chat-unread-refresh', handleRefresh)

    return () => {
      clearInterval(chatPollRef.current)
      clearInterval(notifPollRef.current)
      window.removeEventListener('chat-unread-refresh', handleRefresh)
    }
  }, [isAuthenticated, isCustomer])

  const handleNotifOpen = () => {
    if (!notifOpen && isCustomer) {
      api.get('/my/notifications').then(r => {
        const d = r.data?.data
        setNotifs((d?.data || []).slice(0, 8))
      }).catch(() => {})
      api.patch('/my/notifications/read').then(() => setNotifCount(0)).catch(() => {})
    }
    setNotifOpen(o => !o)
  }

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    navigate('/')
  }

  return (
    <div
      className="app-shell"
      style={isChatRoute ? { paddingBottom: 0, display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' } : undefined}
    >
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <img src="/logo.png" alt="Logo" style={{ height: 44, width: 'auto', display: 'block' }} />
          </Link>
          <nav className="desktop-links" aria-label="Top navigation">
            <Link to="/">{t('nav.home')}</Link>
            <Link to="/shop">{t('nav.shop')}</Link>
            <Link to="/search">{t('nav.findBarbers')}</Link>
            <Link to="/plans">{t('nav.plans')}</Link>
            {isAuthenticated && isCustomer && <Link to="/bookings">{t('nav.myBookings')}</Link>}
            {isAuthenticated && isCustomer && <Link to="/orders">{t('nav.myOrders')}</Link>}
            {isAuthenticated && isCustomer && (
              <Link to="/chat" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {t('nav.myChats')}
                {chatUnread > 0 && (
                  <span key={`chat-unread-top-${chatUnread}`} style={{ background: '#ef4444', color: '#fff', borderRadius: 999, minWidth: 18, height: 18, padding: '0 6px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, animation: 'badgePop 0.3s ease-out' }}>
                    {chatUnread > 99 ? '99+' : chatUnread}
                  </span>
                )}
              </Link>
            )}
          </nav>
          <div className="top-actions">
            {isAuthenticated && isCustomer && (
              <div ref={notifRef} style={{ position: 'relative', display: 'inline-flex' }}>
                <button
                  onClick={handleNotifOpen}
                  title={t('common.notifications')}
                  style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, background: 'transparent', border: 'none', color: '#374151', cursor: 'pointer' }}
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {notifCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -8, background: '#ef4444', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, padding: '0 4px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      {notifCount > 99 ? '99+' : notifCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{ position: 'absolute', right: -40, top: '130%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, width: 320, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{t('common.notifications')}</span>
                    </div>
                    {notifs.length === 0 ? (
                      <p style={{ padding: '16px', fontSize: 14, color: '#9ca3af', margin: 0, textAlign: 'center' }}>{t('common.noNotifications')}</p>
                    ) : notifs.map(n => (
                      <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid #f9fafb', background: !n.read_at ? '#eef2ff' : '#fff', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{CUSTOMER_NOTIF_ICONS[n.event] || '🔔'}</span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: !n.read_at ? 600 : 400, color: '#111827', lineHeight: 1.4 }}>{customerNotifTitle(n, t)}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                        </div>
                        {!n.read_at && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4f46e5', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Link to="/cart" aria-label={t('cart.title')} title={t('cart.title')} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, padding: 0, background: 'transparent', border: 'none', color: '#374151', textDecoration: 'none' }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 4h2l2.4 10.2a2 2 0 0 0 1.95 1.55h8.7a2 2 0 0 0 1.94-1.5L22 7H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="20" r="1.6" fill="currentColor"/>
                <circle cx="18" cy="20" r="1.6" fill="currentColor"/>
              </svg>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -8, background: '#4f46e5', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </Link>

            {!isAuthenticated ? (
              <>
                <LanguageSwitcher />
              <Link className="btn-light checkout-pill" to="/login">{t('common.login')}</Link>
                <Link className="btn-primary" to="/register" style={{ padding: '0.45rem 1rem', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', background: '#4f46e5', border: 'none', cursor: 'pointer', textDecoration: 'none' }}>{t('common.register')}</Link>
              </>
            ) : (
              <div ref={dropRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 999, padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                    {user?.name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  {user?.name?.split(' ')[0]}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" /></svg>
                </button>
                {dropOpen && (
                  <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, minWidth: 180, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                      <LanguageSwitcher />
                    </div>
                    {isVendor && (
                      <Link to="/vendor" onClick={() => setDropOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: 14, color: '#4f46e5', fontWeight: 600, borderBottom: '1px solid #f3f4f6', textDecoration: 'none' }}>
                        {t('nav.vendorPanel')}
                      </Link>
                    )}
                    {isCustomer && (
                      <>
                        <Link to="/bookings" onClick={() => setDropOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: 14, color: '#374151', textDecoration: 'none' }}>
                          {t('nav.myBookings')}
                        </Link>
                        <Link to="/orders" onClick={() => setDropOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: 14, color: '#374151', textDecoration: 'none' }}>
                          {t('nav.myOrders')}
                        </Link>
                        <Link to="/chat" onClick={() => setDropOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '0.75rem 1rem', fontSize: 14, color: '#374151', textDecoration: 'none' }}>
                          <span>{t('nav.myChats')}</span>
                          {chatUnread > 0 && (
                            <span key={`chat-unread-menu-${chatUnread}`} style={{ background: '#ef4444', color: '#fff', borderRadius: 999, minWidth: 18, height: 18, padding: '0 6px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, animation: 'badgePop 0.3s ease-out' }}>
                              {chatUnread > 99 ? '99+' : chatUnread}
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                    <Link to="/profile" onClick={() => setDropOpen(false)} style={{ display: 'block', padding: '0.75rem 1rem', fontSize: 14, color: '#374151', textDecoration: 'none' }}>
                      {t('common.profile')}
                    </Link>
                    <button onClick={handleLogout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.75rem 1rem', fontSize: 14, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}>
                      {t('common.logout')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main-content" style={isChatRoute ? { flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' } : undefined}>
        <Outlet />
      </main>

      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.7); }
          70% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default MainLayout
