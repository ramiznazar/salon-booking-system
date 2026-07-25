import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const empty = { name: '', description: '', cost_per_click: '', is_active: true }

export default function BoostTiersPage() {
  const { t } = useTranslation()
  const [tiers, setTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetch = () => {
    setLoading(true)
    api.get('/admin/boost-tiers').then(r => setTiers(r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setError(''); setShowModal(true) }
  const openEdit = (t) => {
    setForm({ name: t.name, description: t.description || '', cost_per_click: t.cost_per_click ?? '', is_active: t.is_active })
    setEditing(t.id); setError(''); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      editing
        ? await api.put(`/admin/boost-tiers/${editing}`, form)
        : await api.post('/admin/boost-tiers', form)
      setShowModal(false); fetch()
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') } finally { setSaving(false) }
  }

  const handleDelete = async (tier) => {
    if (!confirm(`Delete "${tier.name}"?`)) return
    await api.delete(`/admin/boost-tiers/${tier.id}`).catch(() => {})
    fetch()
  }

  const toggleActive = async (tier) => {
    await api.put(`/admin/boost-tiers/${tier.id}`, { is_active: !tier.is_active }).catch(() => {})
    fetch()
  }

  const inp = 'border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-page-heading">{t('admin.boostTiers')}</h2>
          <p className="admin-page-subheading">{t('adminBoost.subtitle', 'Configure homepage boost packages available to vendors')}</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('adminBoost.newTier', 'New Tier')}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">{editing ? t('adminBoost.editTier', 'Edit Boost Tier') : t('adminBoost.newTier', 'New Boost Tier')}</h3>
            {error && <div className="bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('adminBoost.tierName', 'Tier Name')}
                <input className={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Starter Boost" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('adminBoost.costPerClick', 'Cost Per Click (€)')}
                <input type="number" step="0.01" min="0.01" className={inp} value={form.cost_per_click} onChange={e => setForm(f => ({ ...f, cost_per_click: e.target.value }))} placeholder="0.10" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                {t('vendorProfile.description', 'Description')}
                <textarea className={`${inp} resize-y min-h-[56px]`} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this tier offer?" />
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                {t('adminBoost.activeVisible', 'Active (visible to vendors)')}
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving} className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">
                {saving ? t('common.saving', 'Saving…') : (editing ? t('adminBoost.updateTier', 'Update Tier') : t('adminBoost.createTier', 'Create Tier'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : tiers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{t('adminBoost.noTiers', 'No boost tiers yet. Create one above.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  {[t('common.name'), t('vendorProfile.description'), t('adminBoost.costPerClick', 'Cost/Click'), t('vendorBookings.status'), t('common.actions')].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <span className="inline-flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        {t.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{t.description || '—'}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold">€{parseFloat(t.cost_per_click || 0).toFixed(2)}/click</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${t.is_active ? 'admin-chip-success' : 'admin-chip-neutral'}`}>
                        {t.is_active ? t('adminUsers.active', 'Active') : t('adminUsers.inactive', 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(t)} className="text-xs font-semibold px-2.5 py-1 bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-md border-0 cursor-pointer transition-colors">{t('common.edit')}</button>
                        <button onClick={() => toggleActive(t)} className={`text-xs font-semibold px-2.5 py-1 rounded-md border-0 cursor-pointer transition-colors ${t.is_active ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                          {t.is_active ? t('adminUsers.inactive', 'Deactivate') : t('adminUsers.active', 'Activate')}
                        </button>
                        <button onClick={() => handleDelete(t)} className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md border-0 cursor-pointer transition-colors">{t('common.delete')}</button>
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
