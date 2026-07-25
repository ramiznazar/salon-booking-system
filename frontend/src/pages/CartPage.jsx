import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import EmptyState from '../components/EmptyState'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'

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

const FALLBACK = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80'

function CartPage() {
  const { t } = useTranslation()
  const { cart, cartCount, loading, removeFromCart } = useCart()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const navigate = useNavigate()

  if (!isAuthenticated || !isCustomer) {
    return (
      <section className="lumina-page">
        <div className="section-wrap">
          <section className="lumina-block" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>{t('cart2.signInToCart')}</h2>
            <p className="muted" style={{ marginBottom: 20 }}>{t('cart2.signInToCartDesc')}</p>
            <Link className="btn-primary" to="/login">{t('common.login')}</Link>
          </section>
        </div>
      </section>
    )
  }

  const items = cart?.items || []

  const groupedByVendor = items.reduce((acc, item) => {
    const vid = item.vendor_id
    acc[vid] = acc[vid] || { vendor: item.product?.vendor || { id: vid, name: `Vendor #${vid}` }, items: [] }
    acc[vid].items.push(item)
    return acc
  }, {})

  const grandTotal = items.reduce((sum, item) => sum + parseFloat(item.product?.price || 0) * item.quantity, 0)

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>{t('cart2.cartTitle')} {cartCount > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: '#6b7280' }}>({cartCount})</span>}</h2>
              <p>{t('cart2.cartSplitNote')}</p>
            </div>
            <Link className="btn-secondary" to="/shop">{t('cart2.continueShopping')}</Link>
          </div>

          {loading ? (
            <p className="muted" style={{ marginTop: 20 }}>{t('cart2.loadingCart')}</p>
          ) : items.length === 0 ? (
            <EmptyState title={t('cart2.emptyTitle')} description={t('cart2.emptyDesc')} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                {Object.values(groupedByVendor).map(({ vendor, items: vendorItems }) => {
                  const vendorSubtotal = vendorItems.reduce((s, i) => s + parseFloat(i.product?.price || 0) * i.quantity, 0)
                  return (
                    <div key={vendor.id} className="vendor-side-box" style={{ background: '#fff', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <strong style={{ fontSize: 15 }}>{vendor.name}</strong>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{t('cart2.subtotal')} <strong style={{ color: '#2f2a42' }}>€{vendorSubtotal.toFixed(2)}</strong></span>
                      </div>
                      {vendorItems.map((item) => {
                        const price = parseFloat(item.product?.price || 0)
                        const lineTotal = price * item.quantity
                        return (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
                            <img
                              src={resolveImageUrl(item.product?.image_url) || FALLBACK}
                              alt={item.product?.name}
                              onError={e => { e.target.src = FALLBACK }}
                              style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Link to={`/products/${item.product_id}`} style={{ fontWeight: 600, fontSize: 14, color: '#2f2a42', textDecoration: 'none' }}>
                                {item.product?.name || `Product #${item.product_id}`}
                              </Link>
                              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>€{price.toFixed(2)} {t('cart2.each')}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>×{item.quantity}</span>
                              <strong style={{ fontSize: 14, color: '#2f2a42', minWidth: 60, textAlign: 'right' }}>€{lineTotal.toFixed(2)}</strong>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                title="Remove"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 16, padding: '2px 6px', borderRadius: 6, lineHeight: 1 }}
                              >✕</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '16px 20px', background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{t('cart2.grandTotal')}</p>
                  <strong style={{ fontSize: 22, color: '#2f2a42' }}>€{grandTotal.toFixed(2)}</strong>
                </div>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => navigate('/checkout')}
                  style={{ padding: '12px 28px', fontSize: 15 }}
                >
                  {t('cart2.proceedCheckout')}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  )
}

export default CartPage
