import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const EVENT_ICONS = {
  new_order:             '🛒',
  new_booking:           '📅',
  product_out_of_stock:  '⚠️',
  boost_exhausted:       '🔥',
  new_user_registered:   '👤',
  new_vendor_registered: '🏪',
  vendor_approved:       '✅',
  vendor_rejected:       '❌',
  vendor_banned:         '🚫',
  booking_confirmed:     '✅',
  booking_status_updated:'📋',
  order_status_updated:  '📦',
}

function getTitle(n) {
  if (n.title) return n.title
  const e = n.event
  const p = n.payload || {}
  const map = {
    new_order:             `New order from ${p.customer || 'customer'} · €${p.total || ''}`,
    new_booking:           `New booking from ${p.customer || 'customer'} for ${p.service || ''}`,
    new_user_registered:   `New user registered: ${p.name || ''} (${p.email || ''})`,
    new_vendor_registered: `New vendor registered: ${p.vendor_name || ''} by ${p.user_name || ''}`,
    product_out_of_stock:  `Product out of stock: ${p.product_name || ''}`,
    boost_exhausted:       `Boost budget exhausted: ${p.product_name || p.service_name || ''}`,
    vendor_approved:       `Vendor approved: ${p.vendor_name || ''}`,
    vendor_rejected:       `Vendor rejected: ${p.vendor_name || ''}`,
    vendor_banned:         `Vendor banned: ${p.vendor_name || ''}`,
  }
  return map[e] || e?.replace(/_/g, ' ') || 'Notification'
}

function getDetail(n) {
  const e = n.event
  const p = n.payload || {}
  if (e === 'new_order') return `Order #${p.order_id} · Vendor ID: ${p.vendor_id}`
  if (e === 'new_booking') return `Time: ${p.time}`
  if (e === 'new_user_registered') return `User ID: ${p.user_id}`
  if (e === 'new_vendor_registered') return `Vendor ID: ${p.vendor_id} · ${p.email}`
  return null
}

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function AdminNotificationsPage() {
  const { t } = useTranslation()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [marking, setMarking] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const load = (p = 1) => {
    setLoading(true)
    api.get(`/admin/notifications?page=${p}`)
      .then(r => {
        const d = r.data?.data
        const list = d?.data || []
        setNotifs(list)
        setLastPage(d?.last_page || 1)
        setPage(d?.current_page || 1)
        setUnreadCount(list.filter(n => !n.read_at).length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(1) }, [])

  const handleMarkAllRead = () => {
    setMarking(true)
    api.patch('/admin/notifications/read')
      .then(() => {
        setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
        setUnreadCount(0)
      })
      .catch(() => {})
      .finally(() => setMarking(false))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 m-0">{t('vendor.notifications')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 m-0 mt-0.5">{unreadCount} {t('notif.unreadOnPage', 'unread on this page')}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 bg-indigo-50 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {marking ? t('common.loading') : t('notif.markAllRead', 'Mark all as read')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">{t('common.loading')}</div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-500 font-medium">{t('notif.noNotifs', 'No notifications yet')}</p>
          <p className="text-gray-400 text-sm">{t('notif.adminNotifsDesc', 'Admin notifications will appear here.')}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {notifs.map((n, idx) => {
            const icon = EVENT_ICONS[n.event] || '📌'
            const isUnread = !n.read_at
            return (
              <div
                key={n.id}
                className={`flex gap-4 p-4 ${idx < notifs.length - 1 ? 'border-b border-gray-100' : ''} ${isUnread ? 'bg-indigo-50/30' : 'bg-white'}`}
              >
                <div className="text-xl w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100 flex-shrink-0">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm m-0 ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {getTitle(n)}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isUnread && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {getDetail(n) && (
                    <p className="text-xs text-gray-500 m-0 mt-0.5">{getDetail(n)}</p>
                  )}
                  <p className="text-xs text-gray-300 m-0 mt-0.5">{n.event?.replace(/_/g, ' ')}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => load(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            {t('vendorBookings.prev')}
          </button>
          <span className="text-sm text-gray-500">{t('vendorBookings.page', { current: page, total: lastPage })}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page === lastPage}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 cursor-pointer"
          >
            {t('vendorBookings.next')}
          </button>
        </div>
      )}
    </div>
  )
}
