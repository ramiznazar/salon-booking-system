import { Fragment, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, ExpandIcon } from '../../components/admin/ActionIconButton'

const statusColors = {
  pending: 'admin-chip-warning',
  paid: 'admin-chip-success',
  shipped: 'admin-chip-info',
  delivered: 'admin-chip-accent',
  cancelled: 'admin-chip-danger',
}

function OrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [expandedId, setExpandedId] = useState(null)

  const fetchOrders = () => {
    setLoading(true)
    api.get('/admin/orders', { params: { page } })
      .then((res) => {
        setOrders(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.orders')}</h2>
        <p className="admin-page-subheading">{t('adminOrders.subtitle', 'Track all product orders and their statuses')}</p>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminOrders.noOrders', 'No orders found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.orderId')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.customer')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('admin.vendorRole', 'Vendor')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminOrders.subtotal', 'Subtotal')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrderDetails.commission', 'Commission')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.total')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.date')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.items', 'Items')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">#{o.id}</td>
                      <td className="py-3 px-4 text-gray-500">{o.user?.name || `User #${o.user_id}`}</td>
                      <td className="py-3 px-4 text-gray-500">{o.vendor?.name || `Vendor #${o.vendor_id}`}</td>
                      <td className="py-3 px-4 text-gray-500">€{parseFloat(o.subtotal).toFixed(2)}</td>
                      <td className="py-3 px-4 text-orange-600">€{parseFloat(o.commission_amount).toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">€{parseFloat(o.total).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`admin-status-chip ${statusColors[o.status] || 'admin-chip-neutral'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {o.items?.length > 0 && (
                            <ActionIconButton
                              onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                              label={expandedId === o.id ? 'Hide order items' : 'Show order items'}
                              className="admin-action-icon bg-indigo-600 hover:bg-indigo-700"
                            >
                              <ExpandIcon open={expandedId === o.id} />
                            </ActionIconButton>
                          )}
                          {o.items?.length > 0 && <span className="text-xs text-gray-500">{o.items.length}</span>}
                        </div>
                      </td>
                    </tr>
                    {expandedId === o.id && o.items?.length > 0 && (
                      <tr>
                        <td colSpan={9} className="bg-gray-50 px-8 py-3">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="text-left py-1 px-2">{t('vendorOrderDetails.items', 'Product')}</th>
                                <th className="text-left py-1 px-2">{t('adminOrders.qty', 'Quantity')}</th>
                                <th className="text-left py-1 px-2">{t('adminOrders.unitPrice', 'Unit Price')}</th>
                                <th className="text-left py-1 px-2">{t('vendorOrders.total')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {o.items.map((item) => (
                                <tr key={item.id} className="text-gray-600">
                                  <td className="py-1 px-2 font-medium">{item.product?.name || `Product #${item.product_id}`}</td>
                                  <td className="py-1 px-2">{item.quantity}</td>
                                  <td className="py-1 px-2">€{parseFloat(item.price ?? item.unit_price ?? 0).toFixed(2)}</td>
                                  <td className="py-1 px-2">€{(parseFloat(item.price ?? item.unit_price ?? 0) * item.quantity).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 && (
          <div className="admin-pagination">
            <span className="text-sm text-gray-500">{t('vendorBookings.page', { current: meta.current_page, total: meta.last_page })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="admin-pagination-button">{t('vendorBookings.prev')}</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.last_page} className="admin-pagination-button">{t('vendorBookings.next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersPage
