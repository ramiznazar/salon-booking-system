import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'

const FALLBACK = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80'
const API_ORIGIN = new URL(api.defaults.baseURL).origin

function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url)
      const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
      if (isLocalHost && parsed.pathname.startsWith('/storage/') && parsed.origin !== API_ORIGIN) {
        return `${API_ORIGIN}${parsed.pathname}`
      }
    } catch { return url }
    return url
  }
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

const STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#10b981',
  processing: '#3b82f6',
  shipped: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

export default function CheckoutPage() {
  const { t } = useTranslation()
  const { cart, refreshCart } = useCart()
  const { isAuthenticated, isCustomer, user } = useAppAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    delivery_address: '',
    city: '',
    postal_code: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successOrders, setSuccessOrders] = useState(null)

  if (!isAuthenticated || !isCustomer) {
    return (
      <section className="lumina-page">
        <div className="section-wrap">
          <section className="lumina-block" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>{t('checkout2.signInToCheckout')}</h2>
            <p className="muted" style={{ marginBottom: 20 }}>{t('checkout2.signInToCheckoutDesc')}</p>
            <Link className="btn-primary" to="/login">{t('common.login')}</Link>
          </section>
        </div>
      </section>
    )
  }

  const items = cart?.items || []

  if (items.length === 0 && !successOrders) {
    return (
      <section className="lumina-page">
        <div className="section-wrap">
          <section className="lumina-block" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>{t('checkout2.emptyCartTitle')}</h2>
            <p className="muted" style={{ marginBottom: 20 }}>{t('checkout2.emptyCartDesc')}</p>
            <Link className="btn-primary" to="/shop">{t('checkout2.browseProducts')}</Link>
          </section>
        </div>
      </section>
    )
  }

  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity, 0)

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!form.delivery_address.trim() || !form.city.trim()) {
      setError(t('checkout2.addressRequired'))
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const fullAddress = [form.delivery_address.trim(), form.city.trim(), form.postal_code.trim()].filter(Boolean).join(', ')
      const payload = {
        items: items.map(i => ({ vendor_id: i.vendor_id, product_id: i.product_id, quantity: i.quantity })),
        delivery_address: fullAddress,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      }
      const res = await api.post('/checkout', payload)
      const orders = res.data.data || []
      setSuccessOrders(orders)
      await refreshCart()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Checkout failed.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (successOrders) {
    return (
      <section className="lumina-page">
        <div className="section-wrap">
          <section className="lumina-block" style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🎉</div>
              <h2 style={{ color: '#10b981', marginBottom: 6 }}>{t('checkout2.orderSuccess')}</h2>
              <p className="muted">{t('checkout2.orderSuccessDesc')}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {successOrders.map((order) => (
                <div key={order.id} style={{ padding: '14px 18px', border: '1px solid #e5e7eb', borderRadius: 12, background: '#f9fafb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 15 }}>Order #{order.id}</strong>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{order.vendor?.name}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: 16, color: '#2f2a42' }}>€{parseFloat(order.total).toFixed(2)}</strong>
                      <p style={{ margin: '2px 0 0' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status] }}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" type="button" onClick={() => navigate('/orders')}>{t('checkout2.viewMyOrders')}</button>
              <Link className="btn-secondary" to="/shop">{t('checkout2.continueShopping')}</Link>
            </div>
          </section>
        </div>
      </section>
    )
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/cart">{t('cart2.cartTitle')}</Link>
          <span>/</span>
          <span>{t('checkout.title')}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
          {/* Address Form */}
          <section className="lumina-block">
            <h2 style={{ marginBottom: 20 }}>{t('checkout2.deliveryDetails')}</h2>
            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('checkout2.fullName')}</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('auth.phoneLabel')}</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  {t('checkout2.streetAddress')} <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  placeholder="123 Beauty Lane, Apt 4B"
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                    {t('checkout2.city')} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="New York"
                    required
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('checkout2.postalCode')}</label>
                  <input
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    placeholder="10001"
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>{t('checkout2.orderNotes')}</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder={t('checkout2.orderNotesPlaceholder')}
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <button
                className="btn-primary"
                type="submit"
                disabled={submitting}
                style={{ padding: '13px 24px', fontSize: 15, fontWeight: 700, marginTop: 4 }}
              >
                {submitting ? t('checkout2.placingOrder') : t('checkout2.placeOrderBtn', { total: grandTotal.toFixed(2) })}
              </button>
            </form>
          </section>

          {/* Order Summary */}
          <section className="lumina-block" style={{ position: 'sticky', top: 20 }}>
            <h3 style={{ marginBottom: 14 }}>{t('checkout2.orderSummary')}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((item) => {
                const price = parseFloat(item.product?.price || 0)
                const line = price * item.quantity
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={resolveImageUrl(item.product?.image_url) || FALLBACK}
                      alt={item.product?.name}
                      onError={e => { e.target.src = FALLBACK }}
                      style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 7, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: 13, color: '#2f2a42', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.product?.name || `#${item.product_id}`}
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '1px 0 0' }}>×{item.quantity}</p>
                    </div>
                    <strong style={{ fontSize: 13, color: '#2f2a42', flexShrink: 0 }}>€{line.toFixed(2)}</strong>
                  </div>
                )
              })}
            </div>
            <div style={{ borderTop: '1.5px solid #e5e7eb', marginTop: 14, paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                <span>{t('checkout2.subtotal', { count: items.length, plural: items.length !== 1 ? 's' : '' })}</span>
                <span>€{grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                <span>{t('checkout2.shipping')}</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{t('checkout2.free')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#2f2a42' }}>
                <span>{t('checkout2.total')}</span>
                <span>€{grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, lineHeight: 1.5 }}>
              {t('checkout2.stockNote')}
            </p>
          </section>
        </div>
      </div>
    </section>
  )
}
