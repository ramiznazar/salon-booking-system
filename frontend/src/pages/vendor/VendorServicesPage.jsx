import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import ImageUpload from '../../components/ImageUpload'
import { getLocalizedField } from '../../utils/localize'

const empty = { name: '', name_it: '', description: '', description_it: '', image_url: '', price: '', duration_minutes: 30, service_category_id: '', is_active: true }
const API_ORIGIN = new URL(api.defaults.baseURL).origin

const resolveImageUrl = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
      if (isLocalHost && parsed.pathname.startsWith('/storage/') && parsed.origin !== API_ORIGIN) {
        return `${API_ORIGIN}${parsed.pathname}`
      }
    } catch {
      return url
    }
    return url
  }
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
}
function BoostIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}

export default function VendorServicesPage() {
  const { t, i18n } = useTranslation()
  const [services, setServices] = useState([])
  const [meta, setMeta] = useState({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [planData, setPlanData] = useState(null)
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [boosting, setBoosting] = useState(null)
  const [error, setError] = useState('')
  const [boostTiers, setBoostTiers] = useState([])
  const [categories, setCategories] = useState([])
  const [boostTarget, setBoostTarget] = useState(null)  // service being boosted
  const [selectedTier, setSelectedTier] = useState(null)
  const [boostBudget, setBoostBudget] = useState('')

  const fetchServices = () => {
    setLoading(true)
    api.get(`/vendor/services?page=${page}`)
      .then(r => { setServices(r.data.data?.data || []); setMeta(r.data.data?.meta || r.data.data || {}) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    api.get('/vendor/plan').then(r => setPlanData(r.data.data)).catch(() => {})
    api.get('/boost-tiers').then(r => setBoostTiers(r.data.data || [])).catch(() => {})
    api.get('/service-categories').then(r => setCategories(r.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => { fetchServices() }, [page])

  const openAdd = () => { setForm(empty); setEditing(null); setShowForm(true); setError('') }
  const openEdit = (s) => { setForm({ name: s.name || '', name_it: s.name_it || '', description: s.description || '', description_it: s.description_it || '', image_url: s.image_url || '', price: s.price, duration_minutes: s.duration_minutes, service_category_id: s.service_category_id || '', is_active: s.is_active }); setEditing(s.id); setShowForm(true); setError('') }

  const handleSave = async () => {
    setSaving(true); setError('')
    const payload = {
      ...form,
      service_category_id: form.service_category_id || null,
    }
    try {
      editing ? await api.put(`/vendor/services/${editing}`, payload) : await api.post('/vendor/services', payload)
      setShowForm(false); fetchServices()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save service')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    await api.delete(`/vendor/services/${id}`).catch(() => {})
    fetchServices()
  }

  const toggleActive = async (s) => {
    await api.put(`/vendor/services/${s.id}`, { is_active: !s.is_active }).catch(() => {})
    fetchServices()
  }

  const openBoostModal = (service) => {
    const firstActive = boostTiers.find(t => t.is_active)
    setBoostTarget(service)
    setSelectedTier(firstActive?.id ?? null)
    setBoostBudget('')
  }

  const handleBoost = async () => {
    if (!boostTarget || !selectedTier) return
    const tier = boostTiers.find(t => t.id === selectedTier)
    const budget = parseFloat(boostBudget)
    if (!tier || isNaN(budget) || budget < tier.cost_per_click) {
      alert(`Budget must be at least €${parseFloat(tier?.cost_per_click || 0).toFixed(2)}`)
      return
    }
    setBoosting(boostTarget.id)
    try {
      await api.post(`/vendor/services/${boostTarget.id}/boost`, { boost_tier_id: selectedTier, budget })
      setBoostTarget(null); setBoostBudget(''); fetchServices()
    } catch (err) {
      alert(err.response?.data?.message || 'Boost failed')
    } finally { setBoosting(null) }
  }

  const activePlan = planData?.active_plan
  const usage = planData?.usage
  const maxServices = activePlan?.plan?.max_services ?? null
  const usedServices = usage?.services ?? 0
  const atLimit = maxServices !== null && usedServices >= maxServices
  const nearLimit = maxServices !== null && usedServices >= maxServices * 0.8

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('nav.services')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('vendorServices.subtitle', 'Manage your offered services')}</p>
        </div>
        <button
          onClick={openAdd}
          disabled={atLimit}
          title={atLimit ? `Limit reached (${maxServices}). Upgrade your plan.` : undefined}
          className={`flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors border-0 ${
            atLimit ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {t('vendorServices.addService', 'Add Service')}
        </button>
      </div>

      {/* Usage banner */}
      {maxServices !== null && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm border ${
          atLimit ? 'bg-rose-50 border-rose-200 text-rose-700' : nearLimit ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}>
          <span>
            <strong>{usedServices}</strong> {t('vendorPlan.of', 'of')} <strong>{maxServices}</strong> {t('vendorServices.servicesUsed', 'services used')}
            {!atLimit && <span className="ml-1 opacity-70">— {maxServices - usedServices} {t('vendorPlan.remaining', 'remaining')}</span>}
            {atLimit && <span className="ml-1 font-semibold"> — {t('vendorPlan.limitReached', 'Limit reached!')}</span>}
          </span>
          {(atLimit || nearLimit) && (
            <Link to="/vendor/plan" className="text-xs font-semibold underline">
              {atLimit ? 'Upgrade to add more →' : 'View plan →'}
            </Link>
          )}
        </div>
      )}

      {/* Boost info */}
      {activePlan && boostTiers.length > 0 && (
        <p className="text-xs text-slate-400">
          <svg className="inline mr-1" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          {t('vendorServices.boostTip', 'Boost a service to appear on the homepage — choose a tier when clicking Boost')}
        </p>
      )}

      {/* Boost tier modal */}
      {boostTarget && (() => {
        const activeTiers = boostTiers.filter(t => t.is_active)
        const tier = activeTiers.find(t => t.id === selectedTier)
        const cpc = tier ? parseFloat(tier.cost_per_click) : 0
        const budget = parseFloat(boostBudget) || 0
        const estClicks = cpc > 0 && budget >= cpc ? Math.floor(budget / cpc) : 0
        const budgetValid = budget >= cpc && cpc > 0
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">{t('vendorServices.boostService', 'Boost Service')}</h3>
              <p className="text-sm text-slate-500 mb-4">{getLocalizedField(boostTarget, 'name', i18n.language)}</p>
              {activeTiers.length === 0 ? (
                <p className="text-sm text-slate-400">{t('vendorProducts.noBoostTiers', 'No boost tiers available. Contact admin.')}</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {activeTiers.map(t => (
                    <label key={t.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedTier === t.id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="boost_tier" className="accent-amber-500" checked={selectedTier === t.id} onChange={() => { setSelectedTier(t.id); setBoostBudget('') }} />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                          {t.description && <p className="text-xs text-slate-400">{t.description}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-indigo-600">€{parseFloat(t.cost_per_click).toFixed(2)}/click</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {tier && (
                <div className="space-y-3 mb-4">
                  <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
                    Your Budget (€) — min €{cpc.toFixed(2)}
                    <input
                      type="number" step="0.01" min={cpc}
                      className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
                      value={boostBudget}
                      onChange={e => setBoostBudget(e.target.value)}
                      placeholder={`e.g. ${(cpc * 10).toFixed(2)}`}
                    />
                  </label>
                  {budget > 0 && (
                    <div className={`text-xs px-3 py-2 rounded-lg ${
                      budgetValid ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {budgetValid
                        ? <>⚡ Est. <strong>{estClicks} clicks</strong> &nbsp;&mdash;&nbsp; €{cpc.toFixed(2)} per click</>
                        : `Budget must be at least €${cpc.toFixed(2)}`
                      }
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setBoostTarget(null); setBoostBudget('') }} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">{t('common.cancel')}</button>
                <button onClick={handleBoost} disabled={!!boosting || !selectedTier || !budgetValid} className="flex-[2] py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">
                  {boosting ? t('vendorProducts.boosting', 'Boosting…') : t('vendorProducts.confirmBoost', 'Confirm Boost')}
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">{editing ? t('vendorServices.editService', 'Edit Service') : t('vendorServices.newService', 'New Service')}</h3>
          {error && <div className="bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-3">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
              {t('common.name')} (EN)
              <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Haircut &amp; Style" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
              {t('common.name')} (IT)
              <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.name_it} onChange={e => setForm(f => ({ ...f, name_it: e.target.value }))} placeholder="Nome servizio (opzionale)" />
            </label>
            <div className="sm:col-span-2">
              <ImageUpload
                label="Service Image"
                value={form.image_url}
                onChange={url => setForm(f => ({ ...f, image_url: url }))}
              />
            </div>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              {t('vendorServices.price', 'Price')} (€)
              <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="25" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
              {t('vendorServices.duration', 'Duration')} (min)
              <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
              {t('vendorProducts.category', 'Category')}
              <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" value={form.service_category_id} onChange={e => setForm(f => ({ ...f, service_category_id: e.target.value }))}>
                <option value="">{t('vendorProducts.uncategorized', 'Uncategorized')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
              {t('vendorProfile.description', 'Description')} (EN)
              <textarea className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y min-h-[64px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description…" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:col-span-2">
              {t('vendorProfile.description', 'Description')} (IT)
              <textarea className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y min-h-[64px]" value={form.description_it} onChange={e => setForm(f => ({ ...f, description_it: e.target.value }))} placeholder="Descrizione in italiano (opzionale)" />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" className="rounded" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
              {t('vendorProducts.activeVisible', 'Active (visible to customers)')}
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">{t('common.cancel')}</button>
            <button onClick={handleSave} disabled={saving} className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">
              {saving ? t('common.saving', 'Saving…') : editing ? t('vendorServices.updateService', 'Update Service') : t('vendorServices.createService', 'Create Service')}
            </button>
          </div>
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('common.loading')}</div>
        ) : services.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('vendorServices.noServices', 'No services yet. Click "Add Service" to get started.')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[t('common.name'), t('vendorProducts.category', 'Category'), t('vendorServices.price', 'Price'), t('vendorServices.duration', 'Duration'), t('vendorProducts.boost', 'Boost'), t('vendorBookings.status'), t('common.actions')].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map(s => {
                  const isActiveBoosted = !!s.is_boosted
                  const budgetLeft = isActiveBoosted ? Math.max(0, (parseFloat(s.boost_budget) || 0) - (parseFloat(s.boost_budget_spent) || 0)) : 0
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {s.image_url ? (
                            <img src={resolveImageUrl(s.image_url)} alt={getLocalizedField(s, 'name', i18n.language)} className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" onError={e => { e.target.style.display = 'none' }} />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-900">{getLocalizedField(s, 'name', i18n.language)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{s.service_category?.name || 'Uncategorized'}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">€{parseFloat(s.price).toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-500">{s.duration_minutes} min</td>
                      <td className="px-4 py-3">
                        {isActiveBoosted ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full" title={`${s.boost_clicks || 0} clicks · €${budgetLeft.toFixed(2)} left`}>
                            <BoostIcon /> Boosted · €{budgetLeft.toFixed(2)}
                          </span>
                        ) : (
                          <button
                            onClick={() => openBoostModal(s)}
                            title="Boost this service to appear on homepage"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-full border-0 cursor-pointer transition-colors"
                          >
                            <BoostIcon /> Boost
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(s)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer transition-colors ${s.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          {s.is_active ? t('adminUsers.active', 'Active') : t('adminUsers.inactive', 'Inactive')}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openEdit(s)} title="Edit" className="p-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 border-0 cursor-pointer transition-colors"><EditIcon /></button>
                          <button onClick={() => handleDelete(s.id)} title="Delete" className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border-0 cursor-pointer transition-colors"><TrashIcon /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">{t('vendorBookings.page', { current: meta.current_page, total: meta.last_page })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.prev')}</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.last_page} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
