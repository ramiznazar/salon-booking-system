import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import { getLocalizedField } from '../utils/localize'
import { useTranslation } from 'react-i18next'

const FALLBACK_SERVICE = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80'
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

function ServiceDetailsPage() {
  const { i18n } = useTranslation()
  const { serviceId } = useParams()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/services/${serviceId}`)
      .then((res) => {
        const s = res.data.data
        setService(s)
        if (s?.is_boosted) {
          api.post(`/services/${s.id}/click`).catch(() => {})
        }
      })
      .catch(() => setService(null))
      .finally(() => setLoading(false))
  }, [serviceId])

  if (loading) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Loading…</p></div></section>
  if (!service) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Service not found.</p></div></section>

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/vendor/${service.vendor_id}`}>Vendor</Link>
          <span>/</span>
          <span>{getLocalizedField(service, 'name', i18n.language)}</span>
        </div>

        <section className="lumina-block product-details-layout">
          <img
            className="product-details-image"
            src={resolveImageUrl(service.image_url) || FALLBACK_SERVICE}
            alt={getLocalizedField(service, 'name', i18n.language)}
            onError={e => { e.target.src = FALLBACK_SERVICE }}
          />
          <div className="product-details-content">
            <p className="shop-item-brand">{getLocalizedField(service.vendor, 'name', i18n.language, service.vendor?.name || '')}</p>
            <h2>{getLocalizedField(service, 'name', i18n.language)}</h2>
            <p className="muted">
              {getLocalizedField(service, 'description', i18n.language, 'Personalized treatment by skilled professionals with premium products and modern techniques.')}
            </p>
            <p className="price">EUR {service.price}</p>
            <div className="vendor-side-box">
              <strong>Service details</strong>
              <p>Duration: {service.duration_minutes} minutes</p>
              <p>Category: {service.service_category?.name || 'Uncategorized'}</p>
              <p>Rating: 4.9</p>
              <p>Next available: Today at 2:00 PM</p>
            </div>
            <div className="row-actions">
              <Link className="btn-primary" to={`/booking/${service.id}`}>
                Book Appointment
              </Link>
              <Link className="btn-secondary" to={`/vendor/${service.vendor_id}`}>
                View Vendor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ServiceDetailsPage
