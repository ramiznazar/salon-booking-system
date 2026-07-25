import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, ApproveIcon, RejectIcon, BanIcon } from '../../components/admin/ActionIconButton'

const statusColors = {
  pending: 'admin-chip-warning',
  approved: 'admin-chip-success',
  rejected: 'admin-chip-danger',
  banned: 'admin-chip-neutral',
}

function VendorsPage() {
  const { t } = useTranslation()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [actionLoading, setActionLoading] = useState(null)

  const fetchVendors = () => {
    setLoading(true)
    const params = { page }
    if (filter) params.status = filter
    if (search) params.search = search
    api.get('/admin/vendors', { params })
      .then((res) => {
        setVendors(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchVendors() }, [page, filter])

  const handleAction = async (vendorId, action) => {
    setActionLoading(`${vendorId}-${action}`)
    try {
      await api.patch(`/admin/vendors/${vendorId}/${action}`)
      fetchVendors()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchVendors()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.vendors')}</h2>
        <p className="admin-page-subheading">{t('adminVendors.subtitle', 'Approve, reject, or ban salon vendors')}</p>
      </div>

      {/* Filters */}
      <div className="admin-filter-row">
        <form onSubmit={handleSearch} className="admin-filter-form">
          <input
            type="text"
            placeholder={t('adminVendors.searchPlaceholder', 'Search vendors...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filter-input"
          />
          <button type="submit" className="admin-filter-button border-0">
            {t('common.search')}
          </button>
        </form>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1) }}
          className="admin-filter-select"
        >
          <option value="">{t('adminVendors.allStatuses', 'All statuses')}</option>
          <option value="pending">{t('adminVendors.pending', 'Pending')}</option>
          <option value="approved">{t('adminVendors.approved', 'Approved')}</option>
          <option value="rejected">{t('adminVendors.rejected', 'Rejected')}</option>
          <option value="banned">{t('adminVendors.banned', 'Banned')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminVendors.noVendors', 'No vendors found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('auth.emailLabel')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('checkout2.city')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminVendors.rating', 'Rating')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.date')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{v.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{v.name}</td>
                    <td className="py-3 px-4 text-gray-500">{v.email}</td>
                    <td className="py-3 px-4 text-gray-500">{v.city}</td>
                    <td className="py-3 px-4 text-gray-500">{v.rating}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${statusColors[v.status] || 'admin-chip-neutral'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        {v.status !== 'approved' && (
                          <ActionIconButton
                            onClick={() => handleAction(v.id, 'approve')}
                            label="Approve vendor"
                            disabled={actionLoading === `${v.id}-approve`}
                            className="admin-action-icon bg-green-600 hover:bg-green-700"
                          >
                            <ApproveIcon />
                          </ActionIconButton>
                        )}
                        {v.status !== 'rejected' && v.status !== 'banned' && (
                          <ActionIconButton
                            onClick={() => handleAction(v.id, 'reject')}
                            label="Reject vendor"
                            disabled={actionLoading === `${v.id}-reject`}
                            className="admin-action-icon bg-red-600 hover:bg-red-700"
                          >
                            <RejectIcon />
                          </ActionIconButton>
                        )}
                        {v.status !== 'banned' && (
                          <ActionIconButton
                            onClick={() => handleAction(v.id, 'ban')}
                            label="Ban vendor"
                            disabled={actionLoading === `${v.id}-ban`}
                            className="admin-action-icon bg-gray-800 hover:bg-gray-900"
                          >
                            <BanIcon />
                          </ActionIconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="admin-pagination">
            <span className="text-sm text-gray-500">{t('vendorBookings.page', { current: meta.current_page, total: meta.last_page })}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="admin-pagination-button"
              >
                {t('vendorBookings.prev')}
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= meta.last_page}
                className="admin-pagination-button"
              >
                {t('vendorBookings.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorsPage
