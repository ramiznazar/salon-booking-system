import { Link, NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import LanguageSwitcher from '../components/LanguageSwitcher'

const ADMIN_SECTION_SEEN_KEY = 'admin_seen_sections'
const ADMIN_BADGE_CONFIGS = [
  { key: 'admin.vendors', path: '/admin/vendors', endpoint: '/admin/vendors' },
  { key: 'admin.users', path: '/admin/users', endpoint: '/admin/users' },
  { key: 'admin.bookings', path: '/admin/bookings', endpoint: '/admin/bookings' },
  { key: 'admin.orders', path: '/admin/orders', endpoint: '/admin/orders' },
  { key: 'admin.products', path: '/admin/products', endpoint: '/admin/products' },
  { key: 'admin.services', path: '/admin/services', endpoint: '/admin/services' },
  { key: 'admin.reviews', path: '/admin/reviews', endpoint: '/admin/reviews' },
  { key: 'admin.commissions', path: '/admin/commissions', endpoint: '/admin/commissions' },
  { key: 'admin.auditLogs', path: '/admin/audit-logs', endpoint: '/admin/audit-logs' },
  { key: 'admin.plans', path: '/admin/plans', endpoint: '/admin/plans' },
  { key: 'admin.boostTiers', path: '/admin/boost-tiers', endpoint: '/admin/boost-tiers' },
]

const navItemDefs = [
  { to: '/admin', key: 'admin.dashboard', icon: '📊' },
  { to: '/admin/vendors', key: 'admin.vendors', icon: '🏪' },
  { to: '/admin/users', key: 'admin.users', icon: '👥' },
  { to: '/admin/bookings', key: 'admin.bookings', icon: '📅' },
  { to: '/admin/orders', key: 'admin.orders', icon: '📦' },
  {
    key: 'admin.products',
    icon: '🛍️',
    children: [
      { to: '/admin/products', key: 'admin.products', icon: '📦' },
      { to: '/admin/product-categories', key: 'admin.productCategories', icon: '🏷️' },
    ],
  },
  {
    key: 'admin.services',
    icon: '✂️',
    children: [
      { to: '/admin/services', key: 'admin.services', icon: '⚡' },
      { to: '/admin/service-categories', key: 'admin.serviceCategories', icon: '🧾' },
    ],
  },
  { to: '/admin/reviews', key: 'admin.reviews', icon: '⭐' },
  { to: '/admin/commissions', key: 'admin.commissions', icon: '💰' },
  { to: '/admin/audit-logs', key: 'admin.auditLogs', icon: '📋' },
  { to: '/admin/plans', key: 'admin.plans', icon: '🎯' },
  { to: '/admin/boost-tiers', key: 'admin.boostTiers', icon: '🔥' },
  { to: '/admin/notifications', key: 'admin.notifications', icon: '🔔' },
]

const EVENT_ICONS = {
  new_order: '🛒', new_booking: '📅', new_user_registered: '👤',
  new_vendor_registered: '🏪', product_out_of_stock: '⚠️', boost_exhausted: '🔥',
}

function adminNotifTitle(n, t) {
  if (n.title) return n.title
  const e = n.event
  if (e === 'new_order') return t('admin.notifNewOrder', { customer: n.payload?.customer || 'customer' })
  if (e === 'new_booking') return t('admin.notifNewBooking', { customer: n.payload?.customer || 'customer' })
  if (e === 'new_user_registered') return t('admin.notifNewUser', { name: n.payload?.name || '' })
  if (e === 'new_vendor_registered') return t('admin.notifNewVendor', { name: n.payload?.vendor_name || '' })
  return n.event?.replace(/_/g, ' ') || t('common.notifications')
}

function getSeenSections() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SECTION_SEEN_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveSeenSections(next) {
  localStorage.setItem(ADMIN_SECTION_SEEN_KEY, JSON.stringify(next))
}

function getCollectionItems(data) {
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data)) return data
  return []
}

function getCountSince(items, seenAt) {
  if (!seenAt) return 0
  const seenTime = new Date(seenAt).getTime()
  if (Number.isNaN(seenTime)) return 0

  return items.filter((item) => {
    const createdTime = item?.created_at ? new Date(item.created_at).getTime() : NaN
    return !Number.isNaN(createdTime) && createdTime > seenTime
  }).length
}

function AdminLayout() {
  const { t } = useTranslation()
  const { user, isAuthenticated, logout } = useAuth()
  const location = useLocation()
  const navItems = navItemDefs.map(item => ({
    ...item,
    label: t(item.key),
    children: item.children?.map(c => ({ ...c, label: t(c.key) })),
  }))
  const [openDropdowns, setOpenDropdowns] = useState(() => {
    const initial = {}
    navItemDefs.forEach((item) => {
      if (item.children) {
        initial[item.key] = item.children.some((child) =>
          location.pathname.startsWith(child.to)
        )
      }
    })
    return initial
  })
  const [notifCount, setNotifCount] = useState(0)
  const [notifs, setNotifs] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [sectionCounts, setSectionCounts] = useState({})
  const notifRef = useRef(null)
  const dropRef = useRef(null)
  const pollRef = useRef(null)
  const sectionPollRef = useRef(null)
  const [dropOpen, setDropOpen] = useState(false)

  useEffect(() => {
    const loadCount = () => {
      api.get('/admin/notifications/count').then(r => {
        setNotifCount(r.data?.data?.count || 0)
      }).catch(() => {})
    }
    loadCount()
    clearInterval(pollRef.current)
    pollRef.current = setInterval(loadCount, 15000)
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => {
    const loadSectionCounts = () => {
      const seenSections = getSeenSections()
      const normalizedSeenSections = { ...seenSections }
      let hasNewSeenKey = false

      ADMIN_BADGE_CONFIGS.forEach((section) => {
        if (!normalizedSeenSections[section.key]) {
          normalizedSeenSections[section.key] = new Date().toISOString()
          hasNewSeenKey = true
        }
      })

      if (hasNewSeenKey) {
        saveSeenSections(normalizedSeenSections)
      }

      Promise.all(
        ADMIN_BADGE_CONFIGS.map((section) =>
          api.get(section.endpoint, { params: { page: 1 } })
            .then((r) => {
              const items = getCollectionItems(r.data?.data)
              return [section.key, getCountSince(items, normalizedSeenSections[section.key])]
            })
            .catch(() => [section.key, 0])
        )
      ).then((entries) => {
        setSectionCounts(Object.fromEntries(entries))
      }).catch(() => {})
    }
    loadSectionCounts()
    clearInterval(sectionPollRef.current)
    sectionPollRef.current = setInterval(loadSectionCounts, 15000)
    return () => clearInterval(sectionPollRef.current)
  }, [])

  useEffect(() => {
    const matchedSection = ADMIN_BADGE_CONFIGS.find((section) => location.pathname.startsWith(section.path))
    if (!matchedSection) return

    const nextSeenSections = {
      ...getSeenSections(),
      [matchedSection.key]: new Date().toISOString(),
    }

    saveSeenSections(nextSeenSections)
    setSectionCounts((prev) => ({ ...prev, [matchedSection.key]: 0 }))
  }, [location.pathname])

  const handleNotifOpen = () => {
    if (!notifOpen) {
      api.get('/admin/notifications').then(r => {
        const d = r.data?.data
        setNotifs(d?.data || d || [])
      }).catch(() => {})
    }
    setNotifOpen(o => !o)
    if (notifCount > 0) {
      api.patch('/admin/notifications/read').then(() => setNotifCount(0)).catch(() => {})
    }
  }

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getBadgeCount = (path) => {
    const matched = ADMIN_BADGE_CONFIGS.find((section) => section.path === path)
    return matched ? (sectionCounts[matched.key] || 0) : 0
  }

  const getParentBadgeCount = (children = []) => {
    return children.reduce((sum, child) => sum + getBadgeCount(child.to), 0)
  }

  const markSectionAsSeen = (path) => {
    const matched = ADMIN_BADGE_CONFIGS.find((section) => section.path === path)
    if (!matched) return

    const nextSeenSections = {
      ...getSeenSections(),
      [matched.key]: new Date().toISOString(),
    }

    saveSeenSections(nextSeenSections)
    setSectionCounts((prev) => ({ ...prev, [matched.key]: 0 }))
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/admin/login" replace />

  return (
    <div className="admin-shell flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-[#061533] text-white flex flex-col flex-shrink-0 transition-all">
        <div className="px-3 lg:px-6 py-5 border-b border-[#112246]">
          <Link to="/admin" className="text-sm lg:text-xl font-bold tracking-wide text-white no-underline block text-center lg:text-left">
            <img src={user?.logo_url || '/logo.png'} alt="Logo" className="hidden lg:block" style={{ height: 46, width: 'auto' }} />
            <img src={user?.logo_url || '/logo.png'} alt="Logo" className="lg:hidden mx-auto" style={{ height: 34, width: 'auto' }} />
          </Link>
        </div>
        <nav className="admin-scroll flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            if (item.children) {
              const isOpen = openDropdowns[item.key]
              const hasActiveChild = item.children.some((child) =>
                location.pathname.startsWith(child.to)
              )
              const parentBadgeCount = getParentBadgeCount(item.children)
              return (
                <div key={item.key}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleDropdown(item.key)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleDropdown(item.key)}
                    title={item.label}
                    className={`flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-6 py-2.5 text-sm no-underline transition-colors cursor-pointer select-none ${
                      hasActiveChild
                        ? 'bg-white/8 text-white font-semibold border-r-2 border-indigo-400'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="hidden lg:inline flex-1 min-w-0 text-left">{item.label}</span>
                    {parentBadgeCount > 0 && (
                      <span className="ml-auto hidden lg:inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold leading-none">
                        {t('common.new')}
                      </span>
                    )}
                    <svg
                      className={`hidden lg:inline w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''} ${parentBadgeCount > 0 ? 'ml-2' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className={`overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="lg:pl-11 py-1">
                      {item.children.map((child) => (
                        (() => {
                          const childBadgeCount = getBadgeCount(child.to)
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              end={child.to === '/admin'}
                              title={child.label}
                              className={({ isActive }) =>
                                `flex items-center justify-center lg:justify-start gap-2 px-2 lg:px-2 py-1.5 text-sm no-underline transition-colors ${
                                  isActive
                                    ? 'text-white font-medium'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`
                              }
                              onClick={() => markSectionAsSeen(child.to)}
                            >
                              <span className="w-1 h-1 rounded-full bg-current opacity-70"></span>
                              <span className="hidden lg:inline truncate">{child.label}</span>
                              {childBadgeCount > 0 && (
                                <span className="ml-auto hidden lg:inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold leading-none">
                                  {t('common.new')}
                                </span>
                              )}
                            </NavLink>
                          )
                        })()
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
            const itemBadgeCount = getBadgeCount(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                title={item.label}
                className={({ isActive }) =>
                  `flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-6 py-2.5 text-sm no-underline transition-colors text-left ${
                    isActive
                      ? 'bg-white/8 text-white font-semibold border-r-2 border-indigo-400'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`
                }
                onClick={() => markSectionAsSeen(item.to)}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="hidden lg:inline min-w-0">{item.label}</span>
                {itemBadgeCount > 0 && (
                  <span className="ml-auto hidden lg:inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold leading-none">
                    {t('common.new')}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 lg:px-6 py-4 border-t border-[#112246]">
          <button
            onClick={logout}
            className="w-full px-2 lg:px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs lg:text-sm rounded-lg transition-colors cursor-pointer border-0"
            title={t('common.logout')}
          >
            <span className="lg:hidden">⎋</span>
            <span className="hidden lg:inline">{t('common.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-base lg:text-lg font-semibold text-gray-800">{t('admin.panel')}</h1>
          <div className="flex items-center gap-3">
            <div ref={notifRef} className="relative">
              <button
                onClick={handleNotifOpen}
                className="relative p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors cursor-pointer"
                title={t('common.notifications')}
              >
                <span className="text-base">🔔</span>
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
                    <Link to="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-indigo-600 hover:underline no-underline">{t('common.viewAll')}</Link>
                  </div>
                  {notifs.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-gray-400">{t('common.noNewNotifications')}</p>
                  ) : notifs.slice(0, 7).map(n => (
                    <div key={n.id} className={`px-4 py-3 border-b border-gray-50 text-sm ${!n.read_at ? 'bg-indigo-50/40' : ''}`}>
                      <div className="flex gap-2 items-start">
                        <span className="text-base">{EVENT_ICONS[n.event] || '📌'}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 m-0 leading-snug truncate">{adminNotifTitle(n, t)}</p>
                          <p className="text-xs text-gray-400 m-0 mt-0.5">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</p>
                        </div>
                        {!n.read_at && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <Link to="/admin/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-indigo-600 hover:underline no-underline block text-center">{t('common.seeAll')}</Link>
                  </div>
                </div>
              )}
            </div>

            <div ref={dropRef} className="relative hidden sm:block">
              <button
                onClick={() => setDropOpen((o) => !o)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                title={t('common.profile')}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() ?? 'A'}
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
                    to="/admin/profile"
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
        <main className="admin-scroll flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
