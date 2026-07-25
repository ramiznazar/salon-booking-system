import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

function CommissionsPage() {
  const { t } = useTranslation()
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  const fetchCommissions = () => {
    setLoading(true)
    api.get('/admin/commissions', { params: { page } })
      .then((res) => {
        setCommissions(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchCommissions() }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.commissions')}</h2>
        <p className="admin-page-subheading">{t('adminCommissions.subtitle', 'Track platform commissions from vendor orders')}</p>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminCommissions.noCommissions', 'No commissions found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.orderId')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('admin.vendorRole', 'Vendor')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminCommissions.mode', 'Mode')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminCommissions.value', 'Value')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminCommissions.amount', 'Amount')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminCommissions.global', 'Global')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.date')}</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{c.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">Order #{c.order_id || '-'}</td>
                    <td className="py-3 px-4 text-gray-500">{c.vendor?.name || `Vendor #${c.vendor_id}`}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${c.mode === 'percent' ? 'admin-chip-info' : 'admin-chip-accent'}`}>
                        {c.mode}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{c.mode === 'percent' ? `${c.value}%` : `€${parseFloat(c.value).toFixed(2)}`}</td>
                    <td className="py-3 px-4 font-semibold text-green-700">€{parseFloat(c.amount).toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${c.is_global ? 'admin-chip-info' : 'admin-chip-neutral'}`}>
                        {c.is_global ? t('common.yes', 'Yes') : t('common.no', 'No')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
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

export default CommissionsPage
