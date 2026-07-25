import { useEffect, useState, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

function DashboardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function ScissorsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
}
function BagIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
}
function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function BoxIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
}
function ClockIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function PlanIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

function NotificationsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
}

const NAV_KEYS = [
  { to: '/vendor',                  key: 'vendor.dashboard',     Icon: DashboardIcon, exact: true },
  { to: '/vendor/services',         key: 'vendor.services',      Icon: ScissorsIcon },
  { to: '/vendor/products',         key: 'vendor.products',      Icon: BagIcon },
  { to: '/vendor/bookings',         key: 'vendor.bookings',      Icon: CalendarIcon },
  { to: '/vendor/orders',           key: 'vendor.orders',        Icon: BoxIcon, ordersBadge: true },
  { to: '/vendor/availability',     key: 'vendor.availability',  Icon: ClockIcon },
  { to: '/vendor/plan',             key: 'vendor.planBilling',   Icon: PlanIcon },
  { to: '/vendor/chat',             key: 'vendor.chat',          Icon: ChatIcon },
  { to: '/vendor/notifications',    key: 'vendor.notifications', Icon: NotificationsIcon },
]

function notifTitle(n, t) {
  if (n.title) return n.title
  const e = n.event
  if (e === 'new_order') return t('vendor.notifNewOrder', { customer: n.payload?.customer || 'customer' })
  if (e === 'new_booking') return t('vendor.notifNewBooking', { customer: n.payload?.customer || 'customer' })
  if (e === 'product_out_of_stock') return t('vendor.notifOutOfStock', { product: n.payload?.product_name || 'product' })
  if (e === 'boost_exhausted') return t('vendor.notifBoostEnded', { item: n.payload?.product_name || n.payload?.service_name || 'item' })
  return n.event?.replace(/_/g, ' ') || t('common.notifications')
}

function notifSub(n, t) {
  const e = n.event
  if (e === 'new_order') return t('vendor.notifOrderSub', { id: n.payload?.order_id, total: n.payload?.total })
  if (e === 'new_booking') return t('vendor.notifBookingSub', { service: n.payload?.service, time: n.payload?.time })
  if (e === 'product_out_of_stock') return t('vendor.notifProductIdSub', { id: n.payload?.product_id })
  if (e === 'boost_exhausted') return t('vendor.notifBoostDepleted', { type: n.payload?.type === 'service' ? t('vendor.notifService') : t('vendor.notifProduct') })
  if (n.payload?.status) return t('vendor.notifStatusSub', { status: n.payload.status })
  return null
}

export default function VendorLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isChatRoute = location.pathname.startsWith('/vendor/chat')
  const user = JSON.parse(localStorage.getItem('app_user') || 'null')
  const [vendor, setVendor] = useState(null)
  const [activePlan, setActivePlan] = useState(null)
  const [notifCount, setNotifCount] = useState(0)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [chatUnread, setChatUnread] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const notifRef = useRef(null)
  const dropRef = useRef(null)
  const chatPollRef = useRef(null)
  const notifPollRef = useRef(null)
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/vendor/login')
      return
    }
    const loadVendor = () => {
      api.get('/vendor/me').then(r => {
        setVendor(r.data.data?.vendor)
        setActivePlan(r.data.data?.active_plan)
      }).catch(() => {})
    }

    loadVendor()

    const loadNotifs = () => {
      api.get('/vendor/notifications/count').then(r => {
        setNotifCount(r.data?.data?.count || 0)
      }).catch(() => {})
      api.get('/vendor/orders/new-count').then(r => {
        setNewOrdersCount(r.data?.data?.count || 0)
      }).catch(() => {})
    }

    api.get('/vendor/notifications').then(r => {
      const list = r.data.data || []
      setNotifs(list)
    }).catch(() => {})

    loadNotifs()
    clearInterval(notifPollRef.current)
    notifPollRef.current = setInterval(loadNotifs, 10000)

    const loadChatUnread = () => {
      api.get('/vendor/chat/unread').then(r => {
        setChatUnread(r.data?.data?.unread || 0)
      }).catch(() => {})
    }

    loadChatUnread()
    clearInterval(chatPollRef.current)
    chatPollRef.current = setInterval(loadChatUnread, 5000)

    const handleRefresh = () => loadChatUnread()
    const handleVendorRefresh = () => loadVendor()

    window.addEventListener('chat-unread-refresh', handleRefresh)
    window.addEventListener('vendor-profile-updated', handleVendorRefresh)

    return () => {
      clearInterval(chatPollRef.current)
      clearInterval(notifPollRef.current)
      window.removeEventListener('chat-unread-refresh', handleRefresh)
      window.removeEventListener('vendor-profile-updated', handleVendorRefresh)
    }
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const handleNotifOpen = () => {
    if (!notifOpen) {
      api.get('/vendor/notifications').then(r => {
        setNotifs(r.data.data || [])
      }).catch(() => {})
    }
    setNotifOpen(o => !o)
    if (notifCount > 0) {
      api.patch('/vendor/notifications/read').then(() => setNotifCount(0)).catch(() => {})
    }
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_user')
    navigate('/login')
  }

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)

  const daysLeft = activePlan ? Math.max(0, Math.ceil((new Date(activePlan.expires_at) - new Date()) / 86400000)) : null
  const noPlan = !activePlan

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-gray-900 text-white flex flex-col flex-shrink-0 transition-all">
        <div className="px-3 lg:px-6 py-5 border-b border-gray-800">
          <Link to="/vendor" className="text-sm lg:text-xl font-bold tracking-wide text-white no-underline block text-center lg:text-left">
            <img src={vendor?.logo_url || '/logo.png'} alt="Logo" className="hidden lg:block" style={{ height: 46, width: 'auto' }} />
            <img src={vendor?.logo_url || '/logo.png'} alt="Logo" className="lg:hidden mx-auto" style={{ height: 34, width: 'auto' }} />
          </Link>
        </div>

        <nav className="vendor-nav-scroll flex-1 overflow-y-auto py-4">
          {NAV_KEYS.map(({ to, key, Icon, exact, ordersBadge }) => {
            const label = t(key)
            const active = isActive({ to, exact })
            const badgeCount = to === '/vendor/chat' ? chatUnread : (ordersBadge ? newOrdersCount : 0)
            return (
              <Link
                key={to}
                to={to}
                title={label}
                className={`relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-6 py-2.5 text-sm no-underline transition-colors ${
                  active
                    ? 'bg-gray-800 text-white font-semibold border-r-2 border-indigo-400'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                }`}
              >
                <Icon />
                <span className="hidden lg:inline">{label}</span>
                {badgeCount > 0 && (
                  <span key={`nav-badge-${to}-${badgeCount}`} className="ml-auto hidden lg:inline-flex min-w-[18px] h-[18px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold items-center justify-center leading-none" style={{ animation: 'badgePop 0.3s ease-out' }}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
                {badgeCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 lg:hidden" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 lg:px-6 py-4 border-t border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-2 px-2 lg:px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs lg:text-sm rounded-lg transition-colors cursor-pointer border-0"
            title={t('common.logout')}
          >
            <LogoutIcon />
            <span className="hidden lg:inline">{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-base lg:text-lg font-semibold text-gray-800">{vendor?.name || t('vendor.panel')}</p>
            {activePlan && (
              <p className="text-xs text-gray-500 hidden sm:block">
                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {activePlan.plan?.name}
                </span>
                <span className="ml-1">{t('vendor.daysRemaining', { count: daysLeft })}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/vendor/chat"
              className="relative p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer text-gray-700"
              title={t('vendor.chat')}
            >
              <ChatIcon />
              {chatUnread > 0 && (
                <span key={`vendor-chat-unread-top-${chatUnread}`} className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center" style={{ animation: 'badgePop 0.3s ease-out' }}>
                  {chatUnread > 9 ? '9+' : chatUnread}
                </span>
              )}
            </Link>

            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={handleNotifOpen}
                className="relative p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer"
              >
                <BellIcon />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-[110%] bg-white border border-gray-200 rounded-xl w-80 shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-800">{t('common.notifications')}</span>
                    <Link to="/vendor/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-indigo-600 hover:underline no-underline">{t('common.viewAll')}</Link>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-gray-400">{t('common.noNewNotifications')}</p>
                  ) : notifs.slice(0, 8).map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 text-sm ${!n.read_at ? 'bg-indigo-50/40' : ''}`}>
                      <p className="font-semibold text-gray-800 m-0">{notifTitle(n, t)}</p>
                      {notifSub(n, t) && <p className="text-xs text-gray-400 m-0 mt-0.5">{notifSub(n, t)}</p>}
                      <p className="text-xs text-gray-300 m-0 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link to="/vendor/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-indigo-600 hover:underline no-underline block text-center">{t('common.seeAll')}</Link>
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div ref={dropRef} className="relative hidden sm:block">
              <button
                onClick={() => setDropOpen((o) => !o)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                title={t('common.profile')}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() ?? 'V'}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-[115%] bg-white border border-gray-200 rounded-xl min-w-[220px] shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-100 flex justify-end">
                    <LanguageSwitcher />
                  </div>
                  <Link
                    to="/vendor/profile"
                    onClick={() => setDropOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 no-underline"
                  >
                    {t('common.profile')}
                  </Link>
                  <button
                    onClick={() => { setDropOpen(false); logout() }}
                    className="w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 bg-transparent border-0 cursor-pointer"
                  >
                    {t('common.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Pending approval banner */}
        {vendor && vendor.status !== 'approved' && (
          <div className={`border-b px-6 py-2.5 flex items-center gap-3 text-sm ${
            vendor.status === 'rejected' ? 'bg-rose-50 border-rose-200 text-rose-800'
            : vendor.status === 'banned'   ? 'bg-red-50 border-red-200 text-red-900'
            : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {vendor.status === 'pending'  && <span dangerouslySetInnerHTML={{ __html: t('vendor.pendingApproval') }} />}
            {vendor.status === 'rejected' && <span dangerouslySetInnerHTML={{ __html: t('vendor.profileRejected') }} />}
            {vendor.status === 'banned'   && <span dangerouslySetInnerHTML={{ __html: t('vendor.accountBanned') }} />}
          </div>
        )}

        {/* Plan expiry warning */}
        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-sm text-amber-800">
            <span dangerouslySetInnerHTML={{ __html: t('vendor.planExpires', { count: daysLeft, plural: daysLeft !== 1 ? 's' : '' }) }} />
            <Link to="/plans" className="text-amber-700 font-bold text-sm no-underline hover:underline">{t('vendor.renewPlan')}</Link>
          </div>
        )}

        {/* No plan gate */}
        {noPlan ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 m-0">{t('vendor.noActivePlan')}</h2>
            <p className="text-gray-500 max-w-sm">{t('vendor.noActivePlanDesc')}</p>
            <Link to="/plans" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 no-underline font-semibold transition-colors">
              {t('vendor.browsePlans')}
            </Link>
          </div>
        ) : (
          <main className={isChatRoute ? 'flex-1 overflow-hidden flex flex-col min-h-0' : 'vendor-main-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8'}>
            <Outlet />
          </main>
        )}

        <style>{`
          .vendor-nav-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .vendor-nav-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
          }

          .vendor-main-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .vendor-main-scroll::-webkit-scrollbar {
            width: 0;
            height: 0;
          }

          @keyframes badgePop {
            0% { transform: scale(0.7); }
            70% { transform: scale(1.12); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}
