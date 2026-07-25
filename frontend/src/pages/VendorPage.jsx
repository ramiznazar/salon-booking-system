import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EmptyState from '../components/EmptyState'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'
import { getLocalizedField } from '../utils/localize'

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

function buildGoogleMapEmbedHtml(mapEmbed, height = 200) {
  if (!mapEmbed) return ''

  const raw = String(mapEmbed).trim()
  if (!raw) return ''

  const quotedSrc = raw.match(/src\s*=\s*"([^"]+)"/i)?.[1]
    || raw.match(/src\s*=\s*'([^']+)'/i)?.[1]
  const source = (quotedSrc || (/^https?:\/\//i.test(raw) ? raw : '')).trim()
  if (!source) return ''

  try {
    const parsed = new URL(source)
    const allowedHosts = ['www.google.com', 'google.com', 'maps.google.com']
    if (!allowedHosts.includes(parsed.hostname)) return ''
    if (!parsed.pathname.includes('/maps')) return ''

    return `<iframe src="${parsed.toString()}" width="100%" height="${height}" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
  } catch {
    return ''
  }
}

function VendorPage() {
  const { t, i18n } = useTranslation()
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const [vendor, setVendor] = useState(null)
  const [vendorServices, setVendorServices] = useState([])
  const [vendorProducts, setVendorProducts] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('services')
  const [cartFeedback, setCartFeedback] = useState({})
  const sidebarMapHtml = useMemo(() => buildGoogleMapEmbedHtml(vendor?.map_embed, 200), [vendor?.map_embed])
  const aboutMapHtml = useMemo(() => buildGoogleMapEmbedHtml(vendor?.map_embed, 260), [vendor?.map_embed])

  const handleCartAction = async (product, buyNow = false) => {
    if (!isAuthenticated || !isCustomer) { navigate('/login'); return }
    setCartFeedback(prev => ({ ...prev, [product.id]: 'adding' }))
    const result = await addToCart(product, 1)
    if (result.success) {
      setCartFeedback(prev => ({ ...prev, [product.id]: 'added' }))
      setTimeout(() => setCartFeedback(prev => ({ ...prev, [product.id]: null })), 1800)
      if (buyNow) navigate('/checkout')
    } else {
      setCartFeedback(prev => ({ ...prev, [product.id]: 'error' }))
      setTimeout(() => setCartFeedback(prev => ({ ...prev, [product.id]: null })), 2000)
    }
  }

  useEffect(() => {
    Promise.all([
      api.get(`/vendors/${vendorId}`),
      api.get('/services', { params: { vendor_id: vendorId } }),
      api.get('/products', { params: { vendor_id: vendorId } }),
      api.get('/reviews', { params: { vendor_id: vendorId } }),
    ]).then(([vRes, sRes, pRes, rRes]) => {
      setVendor(vRes.data.data)
      setVendorServices(sRes.data.data?.data || sRes.data.data || [])
      setVendorProducts(pRes.data.data?.data || pRes.data.data || [])
      setReviews(rRes.data.data?.data || rRes.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [vendorId])

  const tabItems = useMemo(
    () => [
      { id: 'services', label: `${t('nav.services')} (${vendorServices.length})` },
      { id: 'products', label: `${t('vendor.products')} (${vendorProducts.length})` },
      { id: 'reviews', label: t('vendorPage.reviewsPhotos', 'Reviews & Photos') },
      { id: 'about', label: t('vendorPage.aboutPolicies', 'About & Policies') },
    ],
    [vendorProducts.length, vendorServices.length],
  )

  if (loading) return <section className="lumina-page"><div className="section-wrap"><p className="muted">{t('common.loading')}</p></div></section>
  if (!vendor) return <section className="lumina-page"><div className="section-wrap"><p className="muted">{t('vendorPage.notFound', 'Vendor not found.')}</p></div></section>

  return (
    <section className="lumina-vendor-page">
      <div className="section-wrap">
        <div className="vendor-cover" />
        <div className="vendor-header">
          <div className="vendor-avatar">{getLocalizedField(vendor, 'name', i18n.language)?.[0]?.toUpperCase() ?? 'V'}</div>
          <div className="vendor-header-main">
            <h1>{getLocalizedField(vendor, 'name', i18n.language)}</h1>
            <p>
              {vendor.rating > 0 ? `★ ${vendor.rating} (${vendor.reviews_count} Reviews) • ` : ''}{getLocalizedField(vendor, 'address', i18n.language, vendor.address || '')}, {getLocalizedField(vendor, 'city', i18n.language, vendor.city || '')}
            </p>
            <p className="muted">{getLocalizedField(vendor, 'description', i18n.language, 'Professional beauty services.')}</p>
          </div>
          <div className="vendor-header-actions">
            <button
              className="btn-secondary"
              type="button"
              onClick={() => {
                if (!isAuthenticated || !isCustomer) {
                  navigate('/register', { state: { from: `/chat?vendorId=${vendor.id}` } })
                } else {
                  navigate(`/chat?vendorId=${vendor.id}`)
                }
              }}
            >
              💬 Chat
            </button>
            <button className="btn-primary" type="button">
              + Follow
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrap">
        <div className="vendor-tabs">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-wrap">
        <div className="vendor-content-layout">
          <div>
            {activeTab === 'services' && (
              <div className="vendor-panel">
                <div className="vendor-panel-head">
                  <h2>Featured Services</h2>
                  <button type="button">Filter</button>
                </div>
                {vendorServices.length === 0 ? (
                  <EmptyState
                    title={t('vendorPage.noServices', 'No services available')}
                    description={t('vendorPage.noServicesDesc', 'This vendor has not published services yet.')}
                  />
                ) : (
                  <div className="vendor-service-list">
                    {vendorServices.map((service) => (
                      <article key={service.id} className="vendor-service-card">
                        <img
                          src={resolveImageUrl(service.image_url) || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80'}
                          alt={getLocalizedField(service, 'name', i18n.language)}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80' }}
                        />
                        <div>
                          <h3>{getLocalizedField(service, 'name', i18n.language)}</h3>
                          <p>{service.duration_minutes} mins</p>
                          {service.service_category?.name && <p>{service.service_category.name}</p>}
                          {getLocalizedField(service, 'description', i18n.language, '') && <small>{getLocalizedField(service, 'description', i18n.language, '')}</small>}
                        </div>
                        <div className="vendor-service-price">
                          <strong>€{parseFloat(service.price).toFixed(2)}</strong>
                          <Link className="btn-secondary" to={`/booking/${service.id}`}>
                            {t('vendorPage.bookSlot', 'Book Slot')}
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="vendor-panel">
                <h2>Products</h2>
                {vendorProducts.length === 0 ? (
                  <EmptyState
                    title={t('vendorPage.noProducts', 'No products available')}
                    description={t('vendorPage.noProductsDesc', 'This vendor has not published products yet.')}
                  />
                ) : (
                  <div className="vendor-product-grid">
                    {vendorProducts.map((product) => (
                      <article key={product.id} className="vendor-product-card">
                        <img
                          src={resolveImageUrl(product.image_url) || 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80'}
                          alt={getLocalizedField(product, 'name', i18n.language)}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80' }}
                        />
                        <h3>{getLocalizedField(product, 'name', i18n.language)}</h3>
                        <p>{product.product_category?.name || 'Uncategorized'}</p>
                        <p>Stock {product.stock}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong>€{parseFloat(product.price).toFixed(2)}</strong>
                            <Link className="btn-secondary" to={`/products/${product.id}`} style={{ fontSize: 12 }}>Details</Link>
                          </div>
                          {product.stock > 0 ? (
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              <button
                                type="button"
                                onClick={() => handleCartAction(product, false)}
                                disabled={cartFeedback[product.id] === 'adding'}
                                style={{ flex: '0 0 calc(50% - 3px)', maxWidth: 'calc(50% - 3px)', padding: '5px 8px', fontSize: 11, fontWeight: 600, background: cartFeedback[product.id] === 'added' ? '#10b981' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, whiteSpace: 'nowrap' }}
                              >
                                {cartFeedback[product.id] === 'adding' ? '…' : cartFeedback[product.id] === 'added' ? '✓ Added' : '🛒 Add to Cart'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCartAction(product, true)}
                                style={{ flex: '0 0 calc(50% - 3px)', maxWidth: 'calc(50% - 3px)', padding: '5px 8px', fontSize: 11, fontWeight: 600, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, whiteSpace: 'nowrap' }}
                              >
                                ⚡ Buy Now
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>{t('vendorPage.outOfStock', 'Out of stock')}</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="vendor-panel">
                <h2>Reviews & Photos</h2>
                {reviews.length === 0 ? (
                  <EmptyState title={t('vendorPage.noReviews', 'No reviews yet')} description={t('vendorPage.noReviewsDesc', 'Be the first to leave a review after booking.')} />
                ) : reviews.map(r => (
                  <div key={r.id} className="vendor-review-card">
                    <p>"{r.comment || 'Great service!'}"</p>
                    <small>- {r.user?.name || 'Customer'}, {r.rating}/5 ★</small>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="vendor-panel">
                <h2>About & Policies</h2>
                <ul className="vendor-policy-list">
                  <li>Deposit required for services over $100</li>
                  <li>24-hour cancellation policy applies</li>
                  <li>Please arrive 10 minutes before appointment</li>
                  <li>Shipping for products: 2-3 business days</li>
                </ul>

                <div className="vendor-side-box" style={{ marginTop: 16 }}>
                  <strong>Salon Location</strong>
                  <p>{getLocalizedField(vendor, 'address', i18n.language, vendor.address || '')}</p>
                  <p>{getLocalizedField(vendor, 'city', i18n.language, vendor.city || '')}</p>
                  {aboutMapHtml && (
                    <div
                      className="mt-2 rounded-lg overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: aboutMapHtml }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="vendor-side-panel">
            <h3>Booking Summary</h3>
            <p>Select a service to begin booking</p>
            <div className="vendor-side-box">
              <strong>Next Available Slot</strong>
              <p>Today at 2:00 PM with Sarah</p>
            </div>
            <div className="vendor-side-box">
              <strong>Studio Policies</strong>
              <ul>
                <li>Deposit required over $100</li>
                <li>24-hour cancellation policy</li>
                <li>Arrive 10 mins early</li>
              </ul>
            </div>
            <div className="vendor-side-box">
              <strong>Location</strong>
              <p>{getLocalizedField(vendor, 'address', i18n.language, vendor.address || '')}</p>
              <p>{getLocalizedField(vendor, 'city', i18n.language, vendor.city || '')}</p>
              {sidebarMapHtml ? (
                <div
                  className="mt-2 rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: sidebarMapHtml }}
                />
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <div className="section-wrap">
        <div className="row-actions">
          <Link className="btn-secondary" to="/">
            {t('vendorPage.backToHome', 'Back to home')}
          </Link>
          <Link className="btn-secondary" to="/cart">
            {t('nav.cart')}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default VendorPage
