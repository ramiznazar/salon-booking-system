import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const STATUS_CLS = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-violet-100 text-violet-700',
  delivered: 'bg-teal-100 text-teal-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const ALLOWED_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export default function VendorOrderDetailsPage() {
  const { t } = useTranslation()
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/vendor/orders/${orderId}`)
      .then((r) => setOrder(r.data.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleStatusChange = async (newStatus) => {
    if (!newStatus) return
    setUpdating(true)
    try {
      const res = await api.patch(`/vendor/orders/${order.id}/status/${newStatus}`)
      setOrder(res.data.data)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-400 text-sm">{t('vendorOrderDetails.loading', 'Loading order…')}</div>
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => navigate('/vendor/orders')} className="text-sm text-indigo-600 hover:underline">
          {t('vendorOrderDetails.backToOrders', '← Back to Orders')}
        </button>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-500">{t('vendorOrderDetails.notFound', 'Order not found.')}</div>
      </div>
    )
  }

  const itemTotal = order.items?.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0) || 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Order #{order.id}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('vendorOrderDetails.subtitle', 'Detailed order information and status update')}</p>
        </div>
        <Link to="/vendor/orders" className="text-sm text-indigo-600 hover:underline">{t('vendorOrderDetails.backToOrders', '← Back to Orders')}</Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_CLS[order.status] || STATUS_CLS.cancelled}`}>
                {order.status}
              </span>
              <span className="text-sm text-slate-500">{new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorBookings.updateStatus')}</span>
              <select
                disabled={updating || (ALLOWED_TRANSITIONS[order.status] || []).length === 0}
                defaultValue=""
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white disabled:opacity-50"
              >
                <option value="" disabled>{t('common.change', 'Change…')}</option>
                {(ALLOWED_TRANSITIONS[order.status] || []).map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('vendorOrderDetails.items', 'Items')}</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.product?.name || `Product #${item.product_id}`}</p>
                    <p className="text-xs text-slate-500 mt-0.5">€{parseFloat(item.price || 0).toFixed(2)} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-slate-800 text-sm">€{(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorBookings.customer')}</h4>
            <p className="text-sm font-semibold text-slate-800 mt-2">{order.user?.name || `User #${order.user_id}`}</p>
            {order.user?.email && <p className="text-xs text-slate-500 mt-1">{order.user.email}</p>}
            {order.phone && <p className="text-xs text-slate-500 mt-1">{order.phone}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorOrderDetails.delivery', 'Delivery')}</h4>
            <p className="text-sm text-slate-700 mt-2">{order.delivery_address || t('vendorOrderDetails.noAddress', 'No address provided')}</p>
            {order.notes && <p className="text-xs text-slate-500 mt-2">{t('vendorBookings.note')} {order.notes}</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h4 className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorOrderDetails.summary', 'Summary')}</h4>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-slate-500"><span>{t('vendorOrderDetails.itemsTotal', 'Items total')}</span><span>€{itemTotal.toFixed(2)}</span></div>
              <div className="flex items-center justify-between text-slate-500"><span>{t('vendorOrderDetails.commission', 'Commission')}</span><span>€{parseFloat(order.commission_amount || 0).toFixed(2)}</span></div>
              <div className="flex items-center justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 mt-2"><span>{t('vendorOrderDetails.orderTotal', 'Order total')}</span><span>€{parseFloat(order.total || 0).toFixed(2)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
