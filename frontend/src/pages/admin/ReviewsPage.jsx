import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, DeleteIcon, FlagIcon, UnflagIcon } from '../../components/admin/ActionIconButton'

function ReviewsPage() {
  const { t } = useTranslation()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [flagFilter, setFlagFilter] = useState('')
  const [reviewTypeFilter, setReviewTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  const fetchReviews = () => {
    setLoading(true)
    const params = { page }
    if (flagFilter !== '') params.is_flagged = flagFilter
    if (reviewTypeFilter !== '') params.review_type = reviewTypeFilter
    api.get('/admin/reviews', { params })
      .then((res) => {
        setReviews(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [page, flagFilter, reviewTypeFilter])

  const toggleFlag = async (review) => {
    try {
      await api.patch(`/admin/reviews/${review.id}`, { is_flagged: !review.is_flagged })
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (review) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      await api.delete(`/admin/reviews/${review.id}`)
      fetchReviews()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.reviews')}</h2>
        <p className="admin-page-subheading">{t('adminReviews.subtitle', 'Flag or remove inappropriate reviews')}</p>
      </div>

      <div className="admin-filter-row">
        <select
          value={flagFilter}
          onChange={(e) => { setFlagFilter(e.target.value); setPage(1) }}
          className="admin-filter-select"
        >
          <option value="">{t('adminReviews.allReviews', 'All reviews')}</option>
          <option value="1">{t('adminReviews.flaggedOnly', 'Flagged only')}</option>
          <option value="0">{t('adminReviews.notFlagged', 'Not flagged')}</option>
        </select>

        <select
          value={reviewTypeFilter}
          onChange={(e) => { setReviewTypeFilter(e.target.value); setPage(1) }}
          className="admin-filter-select"
        >
          <option value="">{t('adminReviews.allTypes', 'All types')}</option>
          <option value="service">{t('adminReviews.serviceReviews', 'Service reviews')}</option>
          <option value="product">{t('adminReviews.productReviews', 'Product reviews')}</option>
        </select>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminReviews.noReviews', 'No reviews found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.customer')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('admin.vendorRole', 'Vendor')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminVendors.rating', 'Rating')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminReviews.comment', 'Comment')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminReviews.flagged', 'Flagged')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorOrders.date')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${r.is_flagged ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-4 text-gray-400">#{r.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{r.user?.name || `User #${r.user_id}`}</td>
                    <td className="py-3 px-4 text-gray-500">{r.vendor?.name || `Vendor #${r.vendor_id}`}</td>
                    <td className="py-3 px-4 text-yellow-500">{renderStars(r.rating)}</td>
                    <td className="py-3 px-4 text-gray-600 max-w-[300px] truncate">{r.comment || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${r.is_flagged ? 'admin-chip-danger' : 'admin-chip-success'}`}>
                        {r.is_flagged ? t('adminReviews.flaggedLabel', 'Flagged') : t('adminReviews.clean', 'Clean')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <ActionIconButton
                          onClick={() => toggleFlag(r)}
                          label={r.is_flagged ? 'Unflag review' : 'Flag review'}
                          className={`admin-action-icon ${r.is_flagged ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                        >
                          {r.is_flagged ? <UnflagIcon /> : <FlagIcon />}
                        </ActionIconButton>
                        <ActionIconButton
                          onClick={() => handleDelete(r)}
                          label="Delete review"
                          className="admin-action-icon bg-red-600 hover:bg-red-700"
                        >
                          <DeleteIcon />
                        </ActionIconButton>
                      </div>
                    </td>
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

export default ReviewsPage
