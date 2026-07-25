import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const statusColors = {
  pending: 'admin-chip-warning',
  confirmed: 'admin-chip-success',
  completed: 'admin-chip-info',
  cancelled: 'admin-chip-danger',
}

function AdminBookingsPage() {
  const { t } = useTranslation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  const fetchBookings = () => {
    setLoading(true)
    api.get('/admin/bookings', { params: { page } })
      .then((res) => {
        setBookings(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.bookings')}</h2>
        <p className="admin-page-subheading">{t('adminBookings.subtitle', 'View and monitor all customer bookings')}</p>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminBookings.noBookings', 'No bookings found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.customer')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('admin.vendorRole', 'Vendor')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.service')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminBookings.scheduled', 'Scheduled')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('checkout2.notes')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.date')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{b.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{b.user?.name || `User #${b.user_id}`}</td>
                    <td className="py-3 px-4 text-gray-500">{b.vendor?.name || `Vendor #${b.vendor_id}`}</td>
                    <td className="py-3 px-4 text-gray-500">{b.service?.name || `Service #${b.service_id}`}</td>
                    <td className="py-3 px-4 text-gray-500">{b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${statusColors[b.status] || 'admin-chip-neutral'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 max-w-[200px] truncate">{b.notes || '-'}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(b.created_at).toLocaleDateString()}</td>
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

export default AdminBookingsPage
