import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'
import { useTranslation } from 'react-i18next'
import { getLocalizedField } from '../utils/localize'

const ITEMS_PER_PAGE = 6
const FALLBACK_SERVICE = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=80'
const FALLBACK_PRODUCT = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1000&q=80'
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

function ShopPage() {
  const { i18n } = useTranslation()
  const { addToCart } = useCart()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartFeedback, setCartFeedback] = useState({})
  const [typeFilter, setTypeFilter] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([
      api.get('/services'),
      api.get('/products'),
    ]).then(([sRes, pRes]) => {
      const serviceList = (sRes.data.data?.data || sRes.data.data || []).map(s => ({ ...s, _type: 'service' }))
      const productList = (pRes.data.data?.data || pRes.data.data || []).map(p => ({ ...p, _type: 'product' }))
      setServices(serviceList)
      setProducts(productList)
    }).catch(() => {
      setError('Unable to load shop catalog right now.')
    }).finally(() => setLoading(false))
  }, [])

  const catalogItems = useMemo(() => {
    const merged = [...services, ...products]
    const typeFiltered = typeFilter === 'all'
      ? merged
      : merged.filter(i => i._type === typeFilter)

    const filtered = typeFiltered.filter((item) => {
      const price = Number(item.price)
      if (priceRange === '0_49') return price >= 0 && price <= 49
      if (priceRange === '50_99') return price >= 50 && price <= 99
      if (priceRange === '100_plus') return price >= 100
      return true
    })

    const sorted = [...filtered]
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => Number(a.price) - Number(b.price))
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => Number(b.price) - Number(a.price))
    } else if (sortBy === 'latest') {
      sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    }

    return sorted
  }, [services, products, typeFilter, priceRange, sortBy])

  const allCount = services.length + products.length
  const productCount = products.length
  const serviceCount = services.length

  const totalCount = catalogItems.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, priceRange, sortBy, totalCount])

  const safePage = Math.min(currentPage, totalPages)
  const startIdx = (safePage - 1) * ITEMS_PER_PAGE
  const endIdx = startIdx + ITEMS_PER_PAGE
  const paginatedItems = catalogItems.slice(startIdx, endIdx)

  const clearFilters = () => {
    setTypeFilter('all')
    setPriceRange('all')
    setSortBy('relevance')
    setCurrentPage(1)
  }

  const handleAddToCart = async (item, buyNow = false) => {
    if (!isAuthenticated || !isCustomer) { navigate('/login'); return }
    setCartFeedback(prev => ({ ...prev, [item.id]: 'adding' }))
    const result = await addToCart(item, 1)
    if (result.success) {
      setCartFeedback(prev => ({ ...prev, [item.id]: 'added' }))
      setTimeout(() => setCartFeedback(prev => ({ ...prev, [item.id]: null })), 1800)
      if (buyNow) navigate('/checkout')
    } else {
      setCartFeedback(prev => ({ ...prev, [item.id]: 'error' }))
      setTimeout(() => setCartFeedback(prev => ({ ...prev, [item.id]: null })), 2000)
    }
  }

  return (
    <section className="shop-reference-page">
      <div className="section-wrap shop-shell">
        <header className="shop-header">
          <h1>Shop & Book Services</h1>
          <p>
            Discover our complete collection of premium beauty products and book
            professional services from top-rated vendors.
          </p>
        </header>

        <div className="shop-toolbar">
          <div className="shop-toolbar-left">
            <strong>Filters</strong>
            <button type="button" onClick={clearFilters}>Clear all</button>
            <span>
              Showing {totalCount === 0 ? 0 : startIdx + 1}-{Math.min(endIdx, totalCount)} of {totalCount} results
            </span>
          </div>
          <div className="shop-toolbar-right">
            <label htmlFor="typeFilter">Type</label>
            <select id="typeFilter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="product">Products</option>
              <option value="service">Services</option>
            </select>
            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="relevance">Relevance</option>
              <option value="latest">Newest</option>
              <option value="price_asc">Price low-high</option>
              <option value="price_desc">Price high-low</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">
          <aside className="shop-sidebar">
            <div className="filter-block">
              <h4>Category</h4>
              <ul>
                <li>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('all')}
                    style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: typeFilter === 'all' ? '#2f2a42' : '#5f5873', fontWeight: typeFilter === 'all' ? 700 : 400 }}
                  >
                    All ({allCount})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('product')}
                    style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: typeFilter === 'product' ? '#2f2a42' : '#5f5873', fontWeight: typeFilter === 'product' ? 700 : 400 }}
                  >
                    Products ({productCount})
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setTypeFilter('service')}
                    style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: typeFilter === 'service' ? '#2f2a42' : '#5f5873', fontWeight: typeFilter === 'service' ? 700 : 400 }}
                  >
                    Services ({serviceCount})
                  </button>
                </li>
                <li>Skincare (45)</li>
                <li>Makeup (32)</li>
              </ul>
            </div>
            <div className="filter-block">
              <h4>Price range</h4>
              <div className="range-row">
                <button
                  type="button"
                  onClick={() => setPriceRange('0_49')}
                  style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: priceRange === '0_49' ? '#2f2a42' : '#5f5873', fontWeight: priceRange === '0_49' ? 700 : 400 }}
                >
                  €0-49
                </button>
                <button
                  type="button"
                  onClick={() => setPriceRange('50_99')}
                  style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: priceRange === '50_99' ? '#2f2a42' : '#5f5873', fontWeight: priceRange === '50_99' ? 700 : 400 }}
                >
                  €50-99
                </button>
                <button
                  type="button"
                  onClick={() => setPriceRange('100_plus')}
                  style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer', color: priceRange === '100_plus' ? '#2f2a42' : '#5f5873', fontWeight: priceRange === '100_plus' ? 700 : 400 }}
                >
                  €100+
                </button>
              </div>
              <button
                type="button"
                onClick={() => setPriceRange('all')}
                style={{ marginTop: 8, border: 0, background: 'none', padding: 0, cursor: 'pointer', color: priceRange === 'all' ? '#2f2a42' : '#5f5873', fontWeight: priceRange === 'all' ? 700 : 400, fontSize: 12 }}
              >
                Show all prices
              </button>
            </div>
            <div className="filter-block">
              <h4>Rating</h4>
              <ul>
                <li>★★★★★ & up</li>
                <li>★★★★☆ & up</li>
              </ul>
            </div>
            <div className="filter-block">
              <h4>Service booking filters</h4>
              <ul>
                <li>Within 5 miles</li>
                <li>Date</li>
                <li>Any Time</li>
                <li>Any Duration</li>
              </ul>
            </div>
          </aside>

          <div>
            <div className="shop-grid">
              {loading ? (
                <p className="muted">Loading catalog…</p>
              ) : error ? (
                <p className="muted">{error}</p>
              ) : paginatedItems.length === 0 ? (
                <p className="muted">No items found for current filters.</p>
              ) : paginatedItems.map((item) => (
                <article key={item.id} className="shop-item-card">
                  {item._type === 'product' ? (
                    <Link to={`/products/${item.id}`} style={{ display: 'block', lineHeight: 0 }}>
                      <img
                        src={resolveImageUrl(item.image_url) || FALLBACK_PRODUCT}
                        alt={getLocalizedField(item, 'name', i18n.language)}
                        onError={e => { e.target.src = FALLBACK_PRODUCT }}
                      />
                    </Link>
                  ) : (
                    <img
                      src={resolveImageUrl(item.image_url) || FALLBACK_SERVICE}
                      alt={getLocalizedField(item, 'name', i18n.language)}
                      onError={e => { e.target.src = FALLBACK_SERVICE }}
                    />
                  )}
                  <div className="shop-item-content">
                    <p className="shop-item-brand">{getLocalizedField(item.vendor, 'name', i18n.language, item.vendor?.name || 'Vendor')}</p>
                    {item._type === 'product' ? (
                      <h3>
                        <Link to={`/products/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{getLocalizedField(item, 'name', i18n.language)}</Link>
                      </h3>
                    ) : (
                      <h3>{getLocalizedField(item, 'name', i18n.language)}</h3>
                    )}
                    <p className="muted" style={{ marginTop: -6, marginBottom: 10, fontSize: 12 }}>
                      {(item._type === 'service' ? item.service_category?.name : item.product_category?.name) || 'Uncategorized'}
                    </p>
                    <div className="shop-item-meta">
                      <strong>€{Number(item.price).toFixed(2)}</strong>
                      {item._type === 'service' ? (
                        <Link to={`/services/${item.id}`}>View service</Link>
                      ) : null}
                    </div>
                    {item._type === 'product' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item, false)}
                          disabled={cartFeedback[item.id] === 'adding'}
                          style={{ flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, background: cartFeedback[item.id] === 'added' ? '#10b981' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          {cartFeedback[item.id] === 'adding' ? '…' : cartFeedback[item.id] === 'added' ? '✓ Added' : '🛒 Cart'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item, true)}
                          style={{ flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 7, cursor: 'pointer' }}
                        >
                          ⚡ Buy Now
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {!loading && totalPages > 1 && (
              <div className="shop-pagination">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1
                  return (
                    <button
                      key={page}
                      type="button"
                      className={page === safePage ? 'active' : ''}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ShopPage
