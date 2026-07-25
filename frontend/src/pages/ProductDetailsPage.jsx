import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'
import { getLocalizedField } from '../utils/localize'
import { useTranslation } from 'react-i18next'

const FALLBACK_PRODUCT = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80'
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
    } catch {
      return url
    }
    return url
  }
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`
}

function ProductDetailsPage() {
  const { i18n } = useTranslation()
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [cartState, setCartState] = useState(null)
  const [cartMsg, setCartMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    setReviewsLoading(true)
    Promise.all([
      api.get(`/products/${productId}`),
      api.get('/reviews', { params: { product_id: productId, review_type: 'product', per_page: 50 } }),
    ])
      .then(([productRes, reviewsRes]) => {
        const p = productRes.data.data
        setProduct(p)
        setReviews(reviewsRes.data.data?.data || [])
        if (p?.is_boosted) {
          api.post(`/products/${p.id}/click`).catch(() => {})
        }
      })
      .catch(() => {
        setProduct(null)
        setReviews([])
      })
      .finally(() => {
        setLoading(false)
        setReviewsLoading(false)
      })
  }, [productId])

  const handleAddToCart = async (buyNow = false) => {
    if (!isAuthenticated || !isCustomer) { navigate('/login'); return }
    if (product.stock < quantity) { setCartMsg('Not enough stock.'); return }
    setCartState('adding')
    setCartMsg('')
    const result = await addToCart(product, quantity)
    if (result.success) {
      setCartState('added')
      setCartMsg('Added to cart!')
      setTimeout(() => { setCartState(null); setCartMsg('') }, 2000)
      if (buyNow) navigate('/checkout')
    } else {
      setCartState('error')
      setCartMsg(result.message || 'Failed to add to cart.')
      setTimeout(() => { setCartState(null); setCartMsg('') }, 3000)
    }
  }

  if (loading) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Loading…</p></div></section>
  if (!product) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Product not found.</p></div></section>

  const maxQty = product.stock > 0 ? Math.min(product.stock, 99) : 0
  const outOfStock = product.stock <= 0
  const displayRating = product.reviews_count > 0 ? Number(product.rating || 0) : 5

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/shop">Shop</Link>
          <span>/</span>
          <span>{getLocalizedField(product, 'name', i18n.language)}</span>
        </div>

        <section className="lumina-block product-details-layout">
          <img
            className="product-details-image"
            src={resolveImageUrl(product.image_url) || FALLBACK_PRODUCT}
            alt={getLocalizedField(product, 'name', i18n.language)}
            onError={e => { e.target.src = FALLBACK_PRODUCT }}
          />
          <div className="product-details-content">
            <p className="shop-item-brand">{getLocalizedField(product.vendor, 'name', i18n.language, product.vendor?.name || '')}</p>
            <h2>{getLocalizedField(product, 'name', i18n.language)}</h2>
            <p className="muted">
              {getLocalizedField(product, 'description', i18n.language, 'Premium quality formula designed for daily beauty routine and skin health support.')}
            </p>
            <p className="price" style={{ fontSize: 26, fontWeight: 800, color: '#2f2a42', margin: '8px 0' }}>
              €{parseFloat(product.price).toFixed(2)}
            </p>
            <p style={{ margin: '4px 0 12px', fontSize: 14, color: '#475569', fontWeight: 600 }}>
              {'★'.repeat(Math.round(displayRating)).padEnd(5, '☆')} {displayRating.toFixed(1)}
              <span style={{ color: '#94a3b8', fontWeight: 500 }}> ({product.reviews_count || 0} review{(product.reviews_count || 0) === 1 ? '' : 's'})</span>
            </p>

            {outOfStock ? (
              <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 12 }}>Out of stock</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Qty:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ width: 32, height: 34, background: '#f9fafb', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                  >−</button>
                  <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: 15, padding: '0 4px' }}>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                    style={{ width: 32, height: 34, background: '#f9fafb', border: 'none', fontSize: 18, fontWeight: 700, cursor: 'pointer', color: '#374151' }}
                  >+</button>
                </div>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{product.stock} in stock</span>
              </div>
            )}

            {cartMsg && (
              <p style={{ fontSize: 13, color: cartState === 'error' ? '#dc2626' : '#10b981', fontWeight: 600, marginBottom: 8 }}>{cartMsg}</p>
            )}

            <div className="row-actions" style={{ flexWrap: 'wrap', gap: 10 }}>
              <button
                className="btn-primary"
                type="button"
                disabled={outOfStock || cartState === 'adding'}
                onClick={() => handleAddToCart(false)}
                style={{ minWidth: 140, background: cartState === 'added' ? '#10b981' : undefined, transition: 'background 0.2s' }}
              >
                {cartState === 'adding' ? 'Adding…' : cartState === 'added' ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>
              <button
                className="btn-primary"
                type="button"
                disabled={outOfStock || cartState === 'adding'}
                onClick={() => handleAddToCart(true)}
                style={{ minWidth: 120, background: '#f59e0b', border: 'none' }}
              >
                ⚡ Buy Now
              </button>
              <Link className="btn-secondary" to={`/vendor/${product.vendor_id}`}>
                View Vendor
              </Link>
            </div>

            <div className="vendor-side-box" style={{ marginTop: 20 }}>
              <strong>Product details</strong>
              <p>Stock: <strong style={{ color: product.stock > 5 ? '#10b981' : '#f59e0b' }}>{product.stock}</strong></p>
              <p>Category: {product.product_category?.name || 'Uncategorized'}</p>
              <p>Delivery: 2–3 business days</p>
              <p>Total: <strong>€{(parseFloat(product.price) * quantity).toFixed(2)}</strong></p>
            </div>

            <div className="vendor-side-box" style={{ marginTop: 16 }}>
              <strong>Customer Reviews</strong>
              {reviewsLoading ? (
                <p className="muted" style={{ marginTop: 8 }}>Loading reviews…</p>
              ) : reviews.length === 0 ? (
                <p className="muted" style={{ marginTop: 8 }}>No reviews yet. This product displays a 5.0 visual rating until first review.</p>
              ) : (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', background: '#fff' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#334155' }}>
                        {'★'.repeat(review.rating).padEnd(5, '☆')} · {review.user?.name || 'Customer'}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{review.comment || 'Great product.'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ProductDetailsPage
