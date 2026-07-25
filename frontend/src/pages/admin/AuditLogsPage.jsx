import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const actionColors = {
  vendor_status_update: 'admin-chip-info',
  user_update: 'admin-chip-accent',
  product_update: 'admin-chip-success',
  product_delete: 'admin-chip-danger',
  service_update: 'admin-chip-info',
  service_delete: 'admin-chip-danger',
  review_update: 'admin-chip-warning',
  review_delete: 'admin-chip-danger',
}

function AuditLogsPage() {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [actionFilter, setActionFilter] = useState('')

  const fetchLogs = () => {
    setLoading(true)
    const params = { page }
    if (actionFilter) params.action = actionFilter
    api.get('/admin/audit-logs', { params })
      .then((res) => {
        setLogs(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [page, actionFilter])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.auditLogs')}</h2>
        <p className="admin-page-subheading">{t('adminAudit.subtitle', 'Read-only activity trail of all admin actions')}</p>
      </div>

      <div className="admin-filter-row">
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1) }}
          className="admin-filter-select"
        >
          <option value="">{t('adminAudit.allActions', 'All actions')}</option>
          <option value="vendor_status_update">Vendor Status Update</option>
          <option value="user_update">User Update</option>
          <option value="product_update">Product Update</option>
          <option value="product_delete">Product Delete</option>
          <option value="service_update">Service Update</option>
          <option value="service_delete">Service Delete</option>
          <option value="review_update">Review Update</option>
          <option value="review_delete">Review Delete</option>
        </select>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminAudit.noLogs', 'No audit logs found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.actor', 'Actor')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.action', 'Action')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.entity', 'Entity')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.entityId', 'Entity ID')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.meta', 'Meta')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminAudit.timestamp', 'Timestamp')}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{log.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">User #{log.actor_id}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${actionColors[log.action] || 'admin-chip-neutral'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{log.entity_type}</td>
                    <td className="py-3 px-4 text-gray-500">#{log.entity_id}</td>
                    <td className="py-3 px-4 text-gray-400 max-w-[250px]">
                      {log.meta ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {JSON.stringify(log.meta)}
                        </code>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
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

export default AuditLogsPage