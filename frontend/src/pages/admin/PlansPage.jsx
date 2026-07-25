import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { getLocalizedField } from '../../utils/localize'

const empty = { name: '', name_it: '', description: '', description_it: '', price: '', duration_days: 30, features: '', features_it: '', max_services: '', max_products: '', is_active: true, boost_price: '4.99', boost_duration_days: 7 }

export default function AdminPlansPage() {
  const { t, i18n } = useTranslation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetch = () => {
    setLoading(true)
    api.get('/admin/plans').then(r => setPlans(r.data.data?.data || r.data.data || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const openAdd = () => { setForm(empty); setEditing(null); setShowModal(true); setError('') }
  const openEdit = (p) => {
    setForm({
      name: p.name, name_it: p.name_it || '', description: p.description || '', description_it: p.description_it || '', price: p.price, duration_days: p.duration_days,
      features: Array.isArray(p.features) ? p.features.join(', ') : '',
      features_it: Array.isArray(p.features_it) ? p.features_it.join(', ') : '',
      max_services: p.max_services ?? '', max_products: p.max_products ?? '', is_active: p.is_active,
      boost_price: p.boost_price ?? '4.99', boost_duration_days: p.boost_duration_days ?? 7,
    })
    setEditing(p.id); setShowModal(true); setError('')
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const payload = { ...form, features: form.features || '', features_it: form.features_it || '' }
      editing ? await api.put(`/admin/plans/${editing}`, payload) : await api.post('/admin/plans', payload)
      setShowModal(false); fetch()
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') } finally { setSaving(false) }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this plan? Existing subscribers keep access.')) return
    await api.delete(`/admin/plans/${id}`).catch(() => {}); fetch()
  }

  const inp = { padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' }
  const lbl = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, fontWeight: 500, color: '#374151' }

  return (
    <div className="space-y-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="admin-page-heading">{t('admin.plans')}</h2>
          <p className="admin-page-subheading">{t('adminPlans.subtitle', 'Manage vendor subscription plans')}</p>
        </div>
        <button onClick={openAdd} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 9, padding: '0.6rem 1.25rem', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ {t('adminPlans.newPlan', 'New Plan')}</button>
      </div>

      <div className="admin-table-shell">
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>{t('common.loading')}</div>
          : plans.length === 0 ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>{t('adminPlans.noPlans', 'No plans yet. Create one to get started.')}</div>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="admin-table-head">
                  <tr>
                    {[t('common.name'), t('adminPlans.price', 'Price'), t('adminPlans.duration', 'Duration'), t('adminPlans.maxServices', 'Max Services'), t('adminPlans.maxProducts', 'Max Products'), t('adminPlans.boostPrice', 'Boost Price'), t('adminPlans.boostDays', 'Boost Days'), t('vendorBookings.status'), t('common.actions')].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plans.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-medium text-gray-900">{getLocalizedField(p, 'name', i18n.language)}</td>
                      <td className="py-3 px-4 text-gray-700">€{parseFloat(p.price).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-500">{p.duration_days}d</td>
                      <td className="py-3 px-4 text-gray-500">{p.max_services ?? '∞'}</td>
                      <td className="py-3 px-4 text-gray-500">{p.max_products ?? '∞'}</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">€{parseFloat(p.boost_price ?? 4.99).toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-500">{p.boost_duration_days ?? 7}d</td>
                      <td className="py-3 px-4">
                        <span className={`admin-status-chip ${p.is_active ? 'admin-chip-success' : 'admin-chip-neutral'}`}>
                          {p.is_active ? t('adminUsers.active', 'Active') : t('adminUsers.inactive', 'Inactive')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => openEdit(p)} style={{ background: '#ede9fe', color: '#6d28d9', border: 'none', borderRadius: 7, padding: '0.3rem 0.75rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('common.edit')}</button>
                          {p.is_active && <button onClick={() => handleDeactivate(p.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 7, padding: '0.3rem 0.75rem', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{t('adminUsers.inactive', 'Deactivate')}</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 700 }}>{editing ? t('adminPlans.editPlan', 'Edit Plan') : t('adminPlans.newPlan', 'New Plan')}</h3>
            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.6rem 0.75rem', borderRadius: 8, marginBottom: '0.75rem', fontSize: 13 }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Plan Name (EN) <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Starter" /></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Plan Name (IT) <input style={inp} value={form.name_it} onChange={e => setForm(f => ({ ...f, name_it: e.target.value }))} placeholder="es. Starter (opzionale)" /></label>
              <label style={lbl}>Price (€) <input style={inp} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></label>
              <label style={lbl}>Duration (days) <input style={inp} type="number" value={form.duration_days} onChange={e => setForm(f => ({ ...f, duration_days: e.target.value }))} /></label>
              <label style={lbl}>Max Services <input style={inp} type="number" value={form.max_services} onChange={e => setForm(f => ({ ...f, max_services: e.target.value }))} placeholder="Blank = unlimited" /></label>
              <label style={lbl}>Max Products <input style={inp} type="number" value={form.max_products} onChange={e => setForm(f => ({ ...f, max_products: e.target.value }))} placeholder="Blank = unlimited" /></label>
              <label style={lbl}>Boost Price (€) <input style={inp} type="number" step="0.01" value={form.boost_price} onChange={e => setForm(f => ({ ...f, boost_price: e.target.value }))} /></label>
              <label style={lbl}>Boost Duration (days) <input style={inp} type="number" value={form.boost_duration_days} onChange={e => setForm(f => ({ ...f, boost_duration_days: e.target.value }))} /></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Description (EN) <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Description (IT) <textarea style={{ ...inp, minHeight: 64, resize: 'vertical' }} value={form.description_it} onChange={e => setForm(f => ({ ...f, description_it: e.target.value }))} /></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Features (EN, comma-separated) <input style={inp} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="Bookings, Services, Products" /></label>
              <label style={{ ...lbl, gridColumn: '1/-1' }}>Features (IT, comma-separated) <input style={inp} value={form.features_it} onChange={e => setForm(f => ({ ...f, features_it: e.target.value }))} placeholder="Prenotazioni, Servizi, Prodotti" /></label>
              <label style={{ ...lbl, gridColumn: '1/-1', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active (visible to vendors)
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.65rem', background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>{t('common.cancel')}</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.65rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                {saving ? t('common.saving', 'Saving…') : (editing ? t('adminPlans.updatePlan', 'Update Plan') : t('adminPlans.createPlan', 'Create Plan'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
