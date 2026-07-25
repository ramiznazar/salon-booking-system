import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const STATUS_CLS = {
  pending:    'bg-amber-100 text-amber-700',
  paid:       'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-violet-100 text-violet-700',
  delivered:  'bg-teal-100 text-teal-700',
  cancelled:  'bg-slate-100 text-slate-500',
}

const ALLOWED_TRANSITIONS = {
  pending:    ['processing', 'cancelled'],
  paid:       ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered'],
  delivered:  [],
  cancelled:  [],
}

export default function VendorOrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get(`/vendor/orders?page=${page}`)
      .then(r => { setOrders(r.data.data?.data || []); setMeta(r.data.data?.meta || r.data.data || {}) })
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => {
    api.patch('/vendor/orders/mark-seen').catch(() => {})
  }, [])

  useEffect(() => { fetchOrders() }, [page])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await api.patch(`/vendor/orders/${orderId}/status/${newStatus}`)
      const updated = res.data.data
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
    } catch {
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('vendorOrders.title')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('vendorOrders.subtitle', 'Product orders from customers')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('vendorBookings.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('vendorOrders.noOrders')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[t('vendorOrders.orderId'), t('vendorBookings.customer'), t('vendorOrders.items'), t('vendorOrders.total'), t('vendorBookings.status'), t('vendorBookings.updateStatus'), t('vendorOrders.date'), t('common.action')].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-indigo-600">#{o.id}</td>
                    <td className="px-4 py-3 text-slate-700">{o.user?.name || `User #${o.user_id}`}</td>
                    <td className="px-4 py-3 text-slate-500">{o.items?.length ?? 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600">€{parseFloat(o.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[o.status] || STATUS_CLS.cancelled}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(ALLOWED_TRANSITIONS[o.status] || []).length > 0 ? (
                        <select
                          disabled={updatingId === o.id}
                          defaultValue=""
                          onChange={e => { if (e.target.value) handleStatusChange(o.id, e.target.value) }}
                          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer disabled:opacity-50"
                        >
                          <option value="" disabled>{t('common.change', 'Change…')}</option>
                          {(ALLOWED_TRANSITIONS[o.status] || []).map(s => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/vendor/orders/${o.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors"
                        title="View order details"
                        aria-label={`View order ${o.id}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">{t('vendorBookings.page', { current: meta.current_page, total: meta.last_page })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.prev')}</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.last_page} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
