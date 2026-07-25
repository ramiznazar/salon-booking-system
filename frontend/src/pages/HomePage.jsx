import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { categories } from '../data/mockData'
import { useCart } from '../context/CartContext'
import { useAppAuth } from '../context/AppAuthContext'

const FALLBACK_SERVICE = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80'
const FALLBACK_PRODUCT = 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80'
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

function isBoosted(item) {
  return !!item.is_boosted
}

function CatalogCard({ item }) {
  const { t } = useTranslation()
  const boosted = isBoosted(item)
  const isService = item._type === 'service'
  const img = resolveImageUrl(item.image_url) || (isService ? FALLBACK_SERVICE : FALLBACK_PRODUCT)
  const vendorName = item.vendor?.name ? item.vendor.name.toUpperCase() : ''
  const categoryName = isService ? item.service_category?.name : item.product_category?.name
  const price = parseFloat(item.price).toFixed(2)
  const productUrl = `/products/${item.id}`
  const { addToCart } = useCart()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const navigate = useNavigate()
  const [cartState, setCartState] = useState(null)

  const handleCartAction = async (buyNow = false) => {
    if (!isAuthenticated || !isCustomer) { navigate('/login'); return }
    setCartState('adding')
    const result = await addToCart(item, 1)
    if (result.success) {
      setCartState('added')
      setTimeout(() => setCartState(null), 1800)
      if (buyNow) navigate('/checkout')
    } else {
      setCartState('error')
      setTimeout(() => setCartState(null), 2000)
    }
  }

  return (
    <article className="lumina-card">
      <div style={{ position: 'relative' }}>
        {isService ? (
          <Link to={`/booking/${item.id}`} style={{ display: 'block', lineHeight: 0 }}>
            <img src={img} alt={item.name} onError={e => { e.target.src = FALLBACK_SERVICE }} />
          </Link>
        ) : (
          <Link to={productUrl} style={{ display: 'block', lineHeight: 0 }}>
            <img src={img} alt={item.name} onError={e => { e.target.src = FALLBACK_PRODUCT }} />
          </Link>
        )}
        {boosted && (
          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(245,158,11,0.92)', color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '2px 8px',
            borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            {t('homePage.boosted', 'Boosted')}
          </span>
        )}
      </div>
      <div className="lumina-card-body">
        <div className="lumina-pill-row">
          <span>{isService ? t('homePage.service', 'Service') : t('homePage.product', 'Product')}</span>
          {isService && <span>{item.duration_minutes} min</span>}
          {categoryName && <span>{categoryName}</span>}
        </div>
        {vendorName && <p className="lumina-brand">{vendorName}</p>}
        {isService ? (
          <h3><Link to={`/booking/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link></h3>
        ) : (
          <h3>
            <Link to={productUrl} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link>
          </h3>
        )}
        <div className="lumina-price-row">
          <strong>€{price}</strong>
          {isService && <Link to={`/booking/${item.id}`} style={{ textDecoration: 'none' }}><button type="button">Book</button></Link>}
        </div>
        {!isService && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => handleCartAction(false)}
              disabled={cartState === 'adding'}
              style={{ flex: 1, padding: '5px 8px', fontSize: 11, fontWeight: 600, background: cartState === 'added' ? '#10b981' : '#4f46e5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              {cartState === 'adding' ? '…' : cartState === 'added' ? `✓ ${t('homePage.added', 'Added')}` : `🛒 ${t('home.addToCart')}`}
            </button>
            <button
              type="button"
              onClick={() => handleCartAction(true)}
              style={{ flex: 1, padding: '5px 8px', fontSize: 11, fontWeight: 600, background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
            >
              ⚡ Buy Now
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

function cardsPerView() {
  if (typeof window === 'undefined') return 4
  if (window.innerWidth <= 700) return 1
  if (window.innerWidth <= 900) return 2
  return 4
}

function CatalogCarouselSection({ title, subtitle, items, loading, emptyText }) {
  const [current, setCurrent] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [perView, setPerView] = useState(cardsPerView())
  const dragStartX = useRef(0)
  const isPointerDown = useRef(false)

  useEffect(() => {
    const handleResize = () => setPerView(cardsPerView())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const canSlide = items.length > perView
  const loopPoint = canSlide ? items.length : 0
  const displayItems = canSlide ? [...items, ...items] : items

  useEffect(() => {
    if (current > loopPoint) setCurrent(0)
  }, [current, loopPoint])

  useEffect(() => {
    if (paused || loading || !canSlide) return undefined
    const id = setInterval(() => {
      setAnimate(true)
      setCurrent(prev => prev + 1)
    }, 1600)
    return () => clearInterval(id)
  }, [paused, loading, canSlide])

  const handleTrackTransitionEnd = () => {
    if (current !== loopPoint) return
    setAnimate(false)
    setCurrent(0)
  }

  useEffect(() => {
    if (animate) return
    const id = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(id)
  }, [animate])

  const handleDragStart = (e) => {
    if (!canSlide) return
    isPointerDown.current = true
    dragStartX.current = e.clientX
    setIsDragging(true)
    setPaused(true)
  }

  const handleDragEnd = (e) => {
    if (!isPointerDown.current) return
    const deltaX = e.clientX - dragStartX.current
    isPointerDown.current = false
    setIsDragging(false)

    if (Math.abs(deltaX) >= 40) {
      setAnimate(true)
      if (deltaX < 0) {
        setCurrent(prev => prev + 1)
      } else {
        setCurrent(prev => Math.max(0, prev - 1))
      }
    }

    setPaused(false)
  }

  const handleDragCancel = () => {
    if (!isPointerDown.current) return
    isPointerDown.current = false
    setIsDragging(false)
    setPaused(false)
  }

  const handleWrapMouseLeave = () => {
    handleDragCancel()
    setPaused(false)
  }

  return (
    <section className="lumina-block">
      <div className="lumina-section-head lumina-carousel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div
          className={`lumina-carousel-wrap${isDragging ? ' dragging' : ''}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={handleWrapMouseLeave}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        >
          <div
            className="lumina-carousel-track"
            style={{
              transform: `translateX(-${(current * 100) / perView}%)`,
              transition: animate ? 'transform 0.55s ease' : 'none',
            }}
            onTransitionEnd={handleTrackTransitionEnd}
          >
            {displayItems.map((item, idx) => (
              <div key={`${item._type}-${item.id}-${idx}`} className="lumina-carousel-slide" style={{ flex: `0 0 ${100 / perView}%` }}>
                <CatalogCard item={item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function HomePage() {
  const { t } = useTranslation()
  const [featuredVendors, setFeaturedVendors] = useState([])
  const [allServices, setAllServices] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [searchQ, setSearchQ] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/vendors', { params: { sort: 'rating' } })
      .then(r => setFeaturedVendors((r.data.data?.data || r.data.data || []).slice(0, 3)))
      .catch(() => {})
    Promise.all([
      api.get('/services'),
      api.get('/products'),
    ]).then(([sRes, pRes]) => {
      const services = (sRes.data.data?.data || sRes.data.data || []).map(s => ({ ...s, _type: 'service' }))
      const products = (pRes.data.data?.data || pRes.data.data || []).map(p => ({ ...p, _type: 'product' }))
      setAllServices(services)
      setAllProducts(products)
    }).catch(() => {}).finally(() => setLoadingCatalog(false))
  }, [])

  const handleHeroSearch = (e) => {
    e.preventDefault()
    navigate(searchQ ? `/search?q=${encodeURIComponent(searchQ)}` : '/search')
  }

  const handlePromoShopClick = () => {
    navigate('/shop')
  }

  const handlePromoTreatmentsClick = () => {
    navigate('/search')
  }

  const boostedServices = allServices.filter(isBoosted)
  const regularServices = allServices.filter(i => !isBoosted(i))
  const boostedProducts = allProducts.filter(isBoosted)
  const regularProducts = allProducts.filter(i => !isBoosted(i))

  return (
    <section className="lumina-home">
      <div className="lumina-top-strip">{t('homePage.shippingStrip', 'Free domestic shipping on orders over $100')}</div>

      <div className="section-wrap">
        <section className="lumina-hero">
          <div className="lumina-hero-overlay">
            <h1>{t('homePage.heroTitle', 'Discover Premium Beauty Services & Products')}</h1>
            <p>{t('homePage.heroDesc', 'Connect with top-rated vendors, book appointments, and shop curated collections all in one marketplace.')}</p>
            <form className="lumina-search" onSubmit={handleHeroSearch}>
              <input placeholder={t('homePage.searchPlaceholder', 'Search services or products')} value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <input placeholder={t('homePage.locationPlaceholder', 'Location')} />
              <input placeholder={t('homePage.datePlaceholder', 'Date & Time')} />
              <button type="submit">{t('home.searchBtn')}</button>
            </form>
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>{t('homePage.shopByCategory', 'Shop & Book by Category')}</h2>
              <p>{t('homePage.shopByCategoryDesc', 'Explore our curated selection of beauty essentials and professional services.')}</p>
            </div>
            <div className="lumina-tabs">
              <button type="button" className="active">
                {t('vendor.products')}
              </button>
              <button type="button">{t('nav.services')}</button>
              <button type="button">{t('home.viewAll')}</button>
            </div>
          </div>
          <div className="lumina-category-row">
            {categories.map((category, idx) => (
              <article key={category} className="lumina-category-item">
                <div className="lumina-category-icon">{idx + 1}</div>
                <h3>{category}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Boosted Services */}
      {(loadingCatalog || boostedServices.length > 0) && (
        <div className="section-wrap">
          <CatalogCarouselSection
            title={t('homePage.boostedServices', 'Boosted Services')}
            subtitle={t('homePage.boostedServicesDesc', 'Promoted services appear first for maximum visibility.')}
            items={boostedServices}
            loading={loadingCatalog}
            emptyText={t('homePage.noBoostedServices', 'No boosted services right now.')}
          />
        </div>
      )}

      {/* Boosted Products */}
      {(loadingCatalog || boostedProducts.length > 0) && (
        <div className="section-wrap">
          <CatalogCarouselSection
            title={t('homePage.boostedProducts', 'Boosted Products')}
            subtitle={t('homePage.boostedProductsDesc', 'Featured products from top vendors in your area.')}
            items={boostedProducts}
            loading={loadingCatalog}
            emptyText={t('homePage.noBoostedProducts', 'No boosted products right now.')}
          />
        </div>
      )}

      <div className="section-wrap">
        <section className="lumina-promo">
          <div className="lumina-promo-content">
            <p className="kicker">{t('homePage.promoKicker', 'Summer Collection & Services')}</p>
            <h2>{t('homePage.promoTitle', 'Glow With Confidence This Season')}</h2>
            <p>{t('homePage.promoDesc', 'Discover our curated selection of SPF essentials and book revitalizing summer skin treatments.')}</p>
            <div className="lumina-promo-actions">
              <button type="button" className="primary" onClick={handlePromoShopClick}>
                {t('homePage.shopProducts', 'Shop Products')}
              </button>
              <button type="button" onClick={handlePromoTreatmentsClick}>{t('homePage.bookTreatments', 'Book Treatments')}</button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80"
            alt="Seasonal collection"
          />
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>{t('homePage.topSalons', 'Top Salons')}</h2>
              <p>{t('homePage.topSalonsDesc', 'Trusted salons and beauty centers with verified customer reviews.')}</p>
            </div>
          </div>
          <div className="lumina-salon-grid">
            {featuredVendors.length === 0 ? (
              <p className="muted">{t('homePage.noVendors', 'No vendors yet.')}</p>
            ) : featuredVendors.map((vendor) => (
              <article key={vendor.id} className="lumina-salon-card">
                <img
                  src={vendor.logo_url || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80'}
                  alt={vendor.name}
                />
                <div>
                  <h3>{vendor.name}</h3>
                  <p>{vendor.city}{vendor.rating > 0 ? ` · ★ ${vendor.rating}` : ''}</p>
                  <Link to={`/vendor/${vendor.id}`}>{t('search2.openProfile')}</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Regular Services */}
      <div className="section-wrap">
        <CatalogCarouselSection
          title={t('homePage.allServices', 'All Services')}
          subtitle={t('homePage.allServicesDesc', 'Browse available non-boosted services.')}
          items={regularServices}
          loading={loadingCatalog}
          emptyText={t('homePage.noServices', 'No regular services yet.')}
        />
      </div>

      {/* Regular Products */}
      <div className="section-wrap">
        <CatalogCarouselSection
          title={t('homePage.allProducts', 'All Products')}
          subtitle={t('homePage.allProductsDesc', 'Discover products from verified beauty vendors.')}
          items={regularProducts}
          loading={loadingCatalog}
          emptyText={t('homePage.noProducts', 'No regular products yet.')}
        />
        <div className="row-actions" style={{ marginTop: 12 }}>
          <Link to="/search" style={{ textDecoration: 'none' }}>
            <button type="button">{t('homePage.viewAllListings', 'View All Listings →')}</button>
          </Link>
        </div>
      </div>

      <div className="section-wrap">
        <section className="lumina-footer-preview">
          <div>
            <h3>Lumina</h3>
            <p>Your premier destination for curated beauty products and top-tier professional services.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <p>Skincare</p>
            <p>Makeup</p>
            <p>Haircare</p>
          </div>
          <div>
            <h4>Services</h4>
            <p>Book an Appointment</p>
            <p>Find a Vendor</p>
            <p>Become a Vendor</p>
          </div>
          <div>
            <h4>Support</h4>
            <p>Contact Us</p>
            <p>FAQs</p>
            <p>Shipping & Returns</p>
          </div>
        </section>
      </div>
    </section>
  )
}

export default HomePage
