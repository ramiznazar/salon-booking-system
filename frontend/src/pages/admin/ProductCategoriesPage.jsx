import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, ActivateIcon, DeactivateIcon, DeleteIcon } from '../../components/admin/ActionIconButton'

const emptyForm = { name: '', slug: '', is_active: true }

export default function ProductCategoriesPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchItems = () => {
    setLoading(true)
    api.get('/admin/product-categories')
      .then((res) => setItems(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({ name: item.name || '', slug: item.slug || '', is_active: !!item.is_active })
    setError('')
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const payload = {
      name: form.name,
      slug: form.slug || null,
      is_active: !!form.is_active,
    }
    try {
      if (editing) {
        await api.put(`/admin/product-categories/${editing.id}`, payload)
      } else {
        await api.post('/admin/product-categories', payload)
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (item) => {
    await api.put(`/admin/product-categories/${item.id}`, { is_active: !item.is_active }).catch(() => {})
    fetchItems()
  }

  const handleDelete = async (item) => {
    if (!confirm(`Delete category "${item.name}"?`)) return
    await api.delete(`/admin/product-categories/${item.id}`).catch(() => {})
    fetchItems()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-page-heading">{t('admin.productCategories')}</h2>
          <p className="admin-page-subheading">{t('adminCats.subtitle', 'Create and manage product category options')}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('adminCats.addCategory', 'Add Category')}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editing ? t('adminCats.editCategory', 'Edit Product Category') : t('adminCats.addProductCategory', 'Add Product Category')}</h3>
            {error && <div className="bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('common.name')}
                <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Skincare" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('adminCats.slug', 'Slug')} ({t('auth.optional', 'optional')})
                <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="skincare" />
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                {t('adminUsers.active', 'Active')}
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer">{saving ? t('common.saving', 'Saving…') : t('adminCats.saveCategory', 'Save Category')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminCats.noCategories', 'No categories found.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('adminCats.slug', 'Slug')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('vendorBookings.status')}</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{item.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-gray-500">{item.slug}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${item.is_active ? 'admin-chip-success' : 'admin-chip-danger'}`}>{item.is_active ? t('adminUsers.active', 'Active') : t('adminUsers.inactive', 'Inactive')}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <ActionIconButton onClick={() => openEdit(item)} label="Edit category" className="admin-action-icon bg-violet-600 hover:bg-violet-700">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </ActionIconButton>
                        <ActionIconButton onClick={() => toggleActive(item)} label={item.is_active ? 'Deactivate category' : 'Activate category'} className={`admin-action-icon ${item.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}>
                          {item.is_active ? <DeactivateIcon /> : <ActivateIcon />}
                        </ActionIconButton>
                        <ActionIconButton onClick={() => handleDelete(item)} label="Delete category" className="admin-action-icon bg-red-600 hover:bg-red-700">
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
      </div>
    </div>
  )
}
