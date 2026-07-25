import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, ActivateIcon, DeactivateIcon } from '../../components/admin/ActionIconButton'

const roleColors = {
  admin: 'admin-chip-accent',
  vendor: 'admin-chip-info',
  customer: 'admin-chip-success',
}

function UsersPage() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [editingId, setEditingId] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    const params = { page }
    if (roleFilter) params.role = roleFilter
    if (search) params.search = search
    api.get('/admin/users', { params })
      .then((res) => {
        setUsers(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page, roleFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active })
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const changeRole = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}`, { role: newRole })
      setEditingId(null)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="admin-page-heading">{t('admin.users')}</h2>
        <p className="admin-page-subheading">{t('adminUsers.subtitle', 'Manage all users, change roles, and toggle active status')}</p>
      </div>

      <div className="admin-filter-row">
        <form onSubmit={handleSearch} className="admin-filter-form">
          <input
            type="text"
            placeholder={t('adminUsers.searchPlaceholder', 'Search by name...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filter-input"
          />
          <button type="submit" className="admin-filter-button border-0">
            {t('common.search')}
          </button>
        </form>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
          className="admin-filter-select"
        >
          <option value="">{t('adminUsers.allRoles', 'All roles')}</option>
          <option value="admin">{t('admin.adminRole', 'Admin')}</option>
          <option value="vendor">{t('admin.vendorRole', 'Vendor')}</option>
          <option value="customer">{t('admin.customerRole', 'Customer')}</option>
        </select>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminUsers.noUsers', 'No users found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('auth.emailLabel')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('auth.phoneLabel')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminUsers.role', 'Role')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminUsers.joined', 'Joined')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{u.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email}</td>
                    <td className="py-3 px-4 text-gray-500">{u.phone || '-'}</td>
                    <td className="py-3 px-4">
                      {editingId === u.id ? (
                        <select
                          defaultValue={u.role}
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          onBlur={() => setEditingId(null)}
                          autoFocus
                          className="px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                        >
                          <option value="admin">admin</option>
                          <option value="vendor">vendor</option>
                          <option value="customer">customer</option>
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingId(u.id)}
                          className={`admin-status-chip cursor-pointer ${roleColors[u.role] || 'admin-chip-neutral'}`}
                          title="Click to change role"
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${u.is_active ? 'admin-chip-success' : 'admin-chip-danger'}`}>
                        {u.is_active ? t('adminUsers.active', 'Active') : t('adminUsers.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <ActionIconButton
                        onClick={() => toggleActive(u)}
                        label={`${u.is_active ? 'Deactivate' : 'Activate'} user`}
                        className={`admin-action-icon ${u.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                      >
                        {u.is_active ? <DeactivateIcon /> : <ActivateIcon />}
                      </ActionIconButton>
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

export default UsersPage
