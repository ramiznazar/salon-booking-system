import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { getLocalizedField } from '../utils/localize'

const VENDOR_IMG = 'https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&w=1200&q=80'

function SearchPage() {
  const { t, i18n } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState('')
  const [sort, setSort] = useState('')
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(false)

  const doSearch = (q = query, c = city, s = sort) => {
    setLoading(true)
    const params = {}
    if (q) params.search = q
    if (c) params.city = c
    if (s) params.sort = s
    api.get('/vendors', { params })
      .then(r => setVendors(r.data.data?.data || r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { doSearch() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchParams(query ? { q: query } : {})
    doSearch()
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>{t('search2.title')}</h2>
              <p>{t('search2.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="search-box elevated">
            <input
              type="text"
              placeholder={t('search2.placeholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <button className="btn-primary" type="submit">{t('common.search')}</button>
          </form>

          <div className="chip-row" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              placeholder={t('search2.cityFilter')}
              value={city}
              onChange={e => { setCity(e.target.value); doSearch(query, e.target.value, sort) }}
              style={{ padding: '0.35rem 0.75rem', border: '1px solid #e5e7eb', borderRadius: 999, fontSize: 13, outline: 'none', width: 160 }}
            />
            <button onClick={() => { setSort('rating'); doSearch(query, city, 'rating') }}
              style={{ background: sort === 'rating' ? '#4f46e5' : '#f3f4f6', color: sort === 'rating' ? '#fff' : '#374151', border: 'none', borderRadius: 999, padding: '0.35rem 0.9rem', fontSize: 13, cursor: 'pointer', fontWeight: sort === 'rating' ? 700 : 400 }}>
              {t('search2.topRated')}
            </button>
            <button onClick={() => { setSort(''); doSearch(query, city, '') }}
              style={{ background: sort === '' ? '#f3f4f6' : '#f3f4f6', color: '#374151', border: 'none', borderRadius: 999, padding: '0.35rem 0.9rem', fontSize: 13, cursor: 'pointer' }}>
              {t('search2.latest')}
            </button>
          </div>

          {loading ? (
            <p className="muted" style={{ marginTop: '2rem' }}>{t('search2.searching')}</p>
          ) : vendors.length === 0 ? (
            <p className="muted" style={{ marginTop: '2rem' }}>{t('search2.noVendors')}</p>
          ) : (
            <div className="lumina-salon-grid" style={{ marginTop: '16px' }}>
              {vendors.map((vendor) => (
                <article key={vendor.id} className="lumina-salon-card">
                  <img src={vendor.logo_url || VENDOR_IMG} alt={getLocalizedField(vendor, 'name', i18n.language)} />
                  <div>
                    <h3>{getLocalizedField(vendor, 'name', i18n.language)}</h3>
                    <p>{getLocalizedField(vendor, 'address', i18n.language, vendor.address || '')}, {getLocalizedField(vendor, 'city', i18n.language, vendor.city || '')}</p>
                    {vendor.rating > 0 && <p style={{ margin: '2px 0', fontSize: 13, color: '#f59e0b' }}>★ {vendor.rating} ({vendor.reviews_count} {t('search2.reviews')})</p>}
                    <Link to={`/vendor/${vendor.id}`}>{t('search2.openProfile')}</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default SearchPage
