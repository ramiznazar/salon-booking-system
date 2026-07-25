import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const EVENT_ICONS = {
  new_order:             '🛒',
  new_booking:           '📅',
  product_out_of_stock:  '⚠️',
  boost_exhausted:       '🔥',
  booking_confirmed:     '✅',
  booking_status_updated:'📋',
  order_status_updated:  '📦',
  vendor_approved:       '✅',
  vendor_rejected:       '❌',
  vendor_banned:         '🚫',
  new_user_registered:   '👤',
  new_vendor_registered: '🏪',
}

function getTitle(n) {
  if (n.title) return n.title
  const e = n.event
  const map = {
    new_order:             `New order from ${n.payload?.customer || 'customer'}`,
    new_booking:           `New booking from ${n.payload?.customer || 'customer'}`,
    product_out_of_stock:  `Out of stock: ${n.payload?.product_name || 'product'}`,
    boost_exhausted:       `Boost budget exhausted: ${n.payload?.product_name || n.payload?.service_name || 'item'}`,
    booking_confirmed:     `Booking confirmed for ${n.payload?.service || 'service'}`,
    booking_status_updated:`Booking ${n.payload?.status || 'updated'}: ${n.payload?.service || ''}`,
    order_status_updated:  `Order #${n.payload?.order_id}: ${n.payload?.status || 'updated'}`,
  }
  return map[e] || e?.replace(/_/g, ' ') || 'Notification'
}

function getDetail(n) {
  const e = n.event
  const p = n.payload || {}
  if (e === 'new_order') return `Order #${p.order_id} · Total: €${p.total}`
  if (e === 'new_booking') return `${p.service} · ${p.time}`
  if (e === 'product_out_of_stock') return `Product ID: ${p.product_id}`
  if (e === 'boost_exhausted') return `${p.type === 'service' ? 'Service' : 'Product'} boost budget fully used`
  if (e === 'booking_status_updated') return `Status: ${p.status} · Vendor: ${p.vendor || ''}`
  if (e === 'order_status_updated') return `Status: ${p.status} · Vendor: ${p.vendor || ''}`
  if (e === 'vendor_approved') return `${p.vendor_name} has been approved`
  if (e === 'vendor_rejected') return `${p.vendor_name} has been rejected`
  if (e === 'vendor_banned') return `${p.vendor_name} has been banned`
  if (e === 'new_user_registered') return `${p.name} · ${p.email}`
  if (e === 'new_vendor_registered') return `${p.vendor_name} · ${p.email}`
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

export default function VendorNotificationsPage() {
  const { t } = useTranslation()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [marking, setMarking] = useState(false)

  const load = (p = 1) => {
    setLoading(true)
    api.get(`/vendor/notifications/all?page=${p}`)
      .then(r => {
        const d = r.data?.data
        setNotifs(d?.data || [])
        setLastPage(d?.last_page || 1)
        setPage(d?.current_page || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(1)
  }, [])

  const handleMarkAllRead = () => {
    setMarking(true)
    api.patch('/vendor/notifications/read')
      .then(() => {
        setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      })
      .catch(() => {})
      .finally(() => setMarking(false))
  }

  const unreadCount = notifs.filter(n => !n.read_at).length

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 m-0">{t('vendor.notifications')}</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 m-0 mt-0.5">{unreadCount} {t('notif.unread', 'unread')}</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={marking}
            className="text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 bg-indigo-50 px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {marking ? t('common.loading') : t('notif.markAllRead', 'Mark all as read')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">{t('common.loading')}</div>
      ) : notifs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔔</div>
          <p className="text-gray-500 font-medium">{t('notif.noNotifs', 'No notifications yet')}</p>
          <p className="text-gray-400 text-sm">{t('notif.noNotifsDesc', "You'll be notified about orders, bookings, and more.")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => {
            const icon = EVENT_ICONS[n.event] || '📌'
            const isUnread = !n.read_at
            return (
              <div
                key={n.id}
                className={`flex gap-4 p-4 rounded-xl border transition-colors ${
                  isUnread
                    ? 'bg-indigo-50 border-indigo-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="text-2xl flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm m-0 leading-snug ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {getTitle(n)}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
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
        <div className="flex items-center justify-center gap-3 mt-8">
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
