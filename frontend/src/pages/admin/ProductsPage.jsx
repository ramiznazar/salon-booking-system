import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { ActionIconButton, ActivateIcon, DeactivateIcon, DeleteIcon } from '../../components/admin/ActionIconButton'
import { getLocalizedField } from '../../utils/localize'

const emptyForm = { vendor_id: '', product_category_id: '', name: '', name_it: '', description: '', description_it: '', price: '', stock: 0 }

function ProductsPage() {
  const { i18n } = useTranslation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [vendors, setVendors] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [boostTiers, setBoostTiers] = useState([])
  const [boostTarget, setBoostTarget] = useState(null)
  const [selectedTier, setSelectedTier] = useState(null)
  const [boostPrice, setBoostPrice] = useState('')
  const [boosting, setBoosting] = useState(false)

  const fetchProducts = () => {
    setLoading(true)
    const params = { page }
    if (search) params.search = search
    api.get('/admin/products', { params })
      .then((res) => {
        setProducts(res.data.data?.data || [])
        setMeta(res.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [page])

  useEffect(() => {
    api.get('/admin/vendors', { params: { page: 1 } })
      .then(r => setVendors(r.data.data?.data || []))
      .catch(() => {})
    api.get('/admin/product-categories').then(r => setCategories(r.data.data || [])).catch(() => {})
    api.get('/admin/boost-tiers').then(r => setBoostTiers(r.data.data || [])).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  const handleCreate = async () => {
    setSaving(true); setFormError('')
    const payload = {
      ...form,
      product_category_id: form.product_category_id || null,
    }
    try {
      await api.post('/admin/products', payload)
      setShowModal(false); setForm(emptyForm); fetchProducts()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create product')
    } finally { setSaving(false) }
  }

  const openBoostModal = (product) => {
    setBoostTarget(product)
    setSelectedTier(boostTiers[0]?.id ?? null)
    setBoostPrice(product.boost_price || '')
  }

  const handleBoost = async () => {
    if (!boostTarget) return
    setBoosting(true)
    try {
      const payload = boostTarget.is_boosted
        ? { is_boosted: false }
        : { is_boosted: true, boost_tier_id: selectedTier || null, boost_price: boostPrice || null }
      await api.patch(`/admin/products/${boostTarget.id}`, payload)
      setBoostTarget(null); fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    } finally { setBoosting(false) }
  }

  const toggleActive = async (product) => {
    try {
      await api.patch(`/admin/products/${product.id}`, { is_active: !product.is_active })
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  const handleDelete = async (product) => {
    if (!confirm(`Delete product "${product.name}"?`)) return
    try {
      await api.delete(`/admin/products/${product.id}`)
      fetchProducts()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="admin-page-heading">Product Management</h2>
          <p className="admin-page-subheading">View, toggle, and remove vendor products</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setFormError(''); setShowModal(true) }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg border-0 cursor-pointer transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Product
        </button>
      </div>

      {/* Boost tier modal */}
      {boostTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            {boostTarget.is_boosted ? (
              <>
                <h3 className="text-base font-bold text-slate-900 mb-1">Remove Boost</h3>
                <p className="text-sm text-slate-500 mb-4">Remove boost from <strong>{boostTarget.name}</strong>?</p>
                <div className="flex gap-2">
                  <button onClick={() => setBoostTarget(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleBoost} disabled={boosting} className="flex-[2] py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">{boosting ? 'Removing…' : 'Remove Boost'}</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-slate-900 mb-1">Boost Product</h3>
                <p className="text-sm text-slate-500 mb-4">{boostTarget.name}</p>
                <div className="space-y-2 mb-4">
                  {boostTiers.filter(t => t.is_active).map(t => (
                    <label key={t.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedTier === t.id ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <input type="radio" name="admin_boost_tier_p" className="accent-amber-500" checked={selectedTier === t.id} onChange={() => setSelectedTier(t.id)} />
                        <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                      </div>
                      <p className="text-xs font-bold text-indigo-600">€{parseFloat(t.cost_per_click || 0).toFixed(2)}/click</p>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setBoostTarget(null)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleBoost} disabled={boosting} className="flex-[2] py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">{boosting ? 'Boosting…' : 'Apply Boost'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Product for Vendor</h3>
            {formError && <div className="bg-rose-50 text-rose-700 text-sm px-3 py-2 rounded-lg mb-3">{formError}</div>}
            <div className="space-y-3">
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Vendor
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" value={form.vendor_id} onChange={e => setForm(f => ({ ...f, vendor_id: e.target.value }))}>
                  <option value="">Select vendor…</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.business_name || v.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Category
                <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white" value={form.product_category_id} onChange={e => setForm(f => ({ ...f, product_category_id: e.target.value }))}>
                  <option value="">Uncategorized</option>
                  {categories.filter(c => c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Product Name (EN)
                <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Hair Wax" />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Product Name (IT)
                <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.name_it} onChange={e => setForm(f => ({ ...f, name_it: e.target.value }))} placeholder="Nome prodotto (opzionale)" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Price (€)
                  <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="12.99" />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                  Stock
                  <input type="number" className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Description (EN)
                <textarea className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y min-h-[60px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                Description (IT)
                <textarea className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y min-h-[60px]" value={form.description_it} onChange={e => setForm(f => ({ ...f, description_it: e.target.value }))} />
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg border-0 cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-[2] py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors">{saving ? 'Creating…' : 'Create Product'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-filter-row">
        <form onSubmit={handleSearch} className="admin-filter-form">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-filter-input"
          />
          <button type="submit" className="admin-filter-button border-0">
            Search
          </button>
        </form>
      </div>

      <div className="admin-table-shell">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="admin-table-head">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Vendor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Stock</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Boost</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-gray-400">#{p.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{getLocalizedField(p, 'name', i18n.language)}</td>
                    <td className="py-3 px-4 text-gray-500">{getLocalizedField(p.vendor, 'name', i18n.language, p.vendor?.name || `Vendor #${p.vendor_id}`)}</td>
                    <td className="py-3 px-4 text-gray-500">{p.product_category?.name || 'Uncategorized'}</td>
                    <td className="py-3 px-4 text-gray-700">€{parseFloat(p.price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-gray-500">{p.stock}</td>
                    <td className="py-3 px-4">
                      <span className={`admin-status-chip ${p.is_active ? 'admin-chip-success' : 'admin-chip-danger'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.is_boosted ? (() => {
                        const spent = parseFloat(p.boost_budget_spent) || 0
                        const budget = parseFloat(p.boost_budget) || 0
                        const left = Math.max(0, budget - spent)
                        return (
                          <div>
                            <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Boosted</span>
                            <p className="text-xs text-gray-500 mt-1">€{left.toFixed(2)} left &middot; {p.boost_clicks || 0} clicks</p>
                          </div>
                        )
                      })() : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        <ActionIconButton
                          onClick={() => openBoostModal(p)}
                          label={p.is_boosted ? 'Remove boost' : 'Boost product'}
                          className={`admin-action-icon ${p.is_boosted ? 'bg-amber-500 hover:bg-amber-600' : 'bg-amber-400 hover:bg-amber-500'}`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </ActionIconButton>
                        <ActionIconButton
                          onClick={() => toggleActive(p)}
                          label={`${p.is_active ? 'Deactivate' : 'Activate'} product`}
                          className={`admin-action-icon ${p.is_active ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                          {p.is_active ? <DeactivateIcon /> : <ActivateIcon />}
                        </ActionIconButton>
                        <ActionIconButton
                          onClick={() => handleDelete(p)}
                          label="Delete product"
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
            <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="admin-pagination-button">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.last_page} className="admin-pagination-button">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsPage
