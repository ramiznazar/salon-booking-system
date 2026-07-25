import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAppAuth } from '../context/AppAuthContext'


const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#fef3c7', color: '#d97706' },
  paid:       { label: 'Paid',       bg: '#d1fae5', color: '#059669' },
  processing: { label: 'Processing', bg: '#dbeafe', color: '#2563eb' },
  shipped:    { label: 'Shipped',    bg: '#ede9fe', color: '#7c3aed' },
  delivered:  { label: 'Delivered',  bg: '#d1fae5', color: '#059669' },
  cancelled:  { label: 'Cancelled',  bg: '#fee2e2', color: '#dc2626' },
}

const FALLBACK = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=200&q=80'
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

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f3f4f6', color: '#6b7280' }
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, textTransform: 'capitalize' }}>
      {cfg.label}
    </span>
  )
}

function ProductReviewForm({ order, item, onDone }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api.post('/reviews', {
        vendor_id: order.vendor_id,
        order_id: order.id,
        order_item_id: item.id,
        product_id: item.product_id,
        review_type: 'product',
        rating,
        comment,
      })
      onDone()
    } catch (e) {
      alert(e.response?.data?.message || 'Could not submit review')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ marginTop: 8, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 10, background: '#f8fafc' }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#334155' }}>{t('orders2.rateProduct')}</p>
      <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
              color: s <= rating ? '#f59e0b' : '#cbd5e1',
            }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t('orders2.rateProduct')}
        style={{ marginTop: 8, width: '100%', minHeight: 60, border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 12, resize: 'vertical' }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        style={{ marginTop: 8, background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '7px 12px', cursor: 'pointer' }}
      >
        {saving ? t('bookings2.submitting') : t('bookings2.submitReview')}
      </button>
    </div>
  )
}

export default function MyOrdersPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [meta, setMeta] = useState({})
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [reviewedOrderItemIds, setReviewedOrderItemIds] = useState([])

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return
    setLoading(true)
    api.get(`/my/orders?page=${page}`)
      .then(r => {
        setOrders(r.data.data?.data || [])
        setMeta(r.data.data || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, isAuthenticated, isCustomer])

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return
    api.get('/reviews', { params: { my: 1, review_type: 'product', per_page: 100 } })
      .then((r) => {
        const list = r.data.data?.data || []
        const ids = list.map(x => x.order_item_id).filter(Boolean)
        setReviewedOrderItemIds(ids)
      })
      .catch(() => {})
  }, [isAuthenticated, isCustomer])

  if (!isAuthenticated || !isCustomer) {
    return (
      <section className="lumina-page">
        <div className="section-wrap">
          <section className="lumina-block" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2>{t('orders2.signInToOrders')}</h2>
            <p className="muted" style={{ marginBottom: 20 }}>{t('orders2.signInToOrdersDesc')}</p>
            <Link className="btn-primary" to="/login">{t('common.login')}</Link>
          </section>
        </div>
      </section>
    )
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head" style={{ marginBottom: 20 }}>
            <div>
              <h2>{t('orders.title')}</h2>
              <p>{t('orders2.trackOrders')}</p>
            </div>
            <Link className="btn-secondary" to="/shop">{t('orders2.shopMore')}</Link>
          </div>

          {loading ? (
            <p className="muted">{t('orders2.loadingOrders')}</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <h3 style={{ color: '#374151', marginBottom: 8 }}>{t('orders2.noOrdersTitle')}</h3>
              <p className="muted" style={{ marginBottom: 20 }}>{t('orders2.noOrdersDesc')}</p>
              <button className="btn-primary" type="button" onClick={() => navigate('/shop')}>{t('checkout2.browseProducts')}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                  {/* Order header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f9fafb', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{t('orders2.orderLabel')}</p>
                        <strong style={{ fontSize: 15, color: '#2f2a42' }}>#{order.id}</strong>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{t('orders2.vendorLabel')}</p>
                        <strong style={{ fontSize: 14, color: '#374151' }}>{order.vendor?.name || `#${order.vendor_id}`}</strong>
                      </div>
                      <div>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{t('orders2.dateLabel')}</p>
                        <strong style={{ fontSize: 13, color: '#374151' }}>{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StatusBadge status={order.status} />
                      <strong style={{ fontSize: 16, color: '#2f2a42' }}>€{parseFloat(order.total).toFixed(2)}</strong>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#374151', fontWeight: 600 }}
                      >
                        {expandedId === order.id ? t('orders2.hide') : t('orders2.details')}
                      </button>
                    </div>
                  </div>

                  {/* Order items (expanded) */}
                  {expandedId === order.id && (
                    <div style={{ padding: '14px 18px', borderTop: '1px solid #f3f4f6' }}>
                      {order.items?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {order.items.map((item) => {
                            const price = parseFloat(item.price)
                            const canReviewProduct = ['delivered', 'completed'].includes(order.status) && !reviewedOrderItemIds.includes(item.id)
                            return (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <img
                                  src={resolveImageUrl(item.product?.image_url) || FALLBACK}
                                  alt={item.product?.name}
                                  onError={e => { e.target.src = FALLBACK }}
                                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0, alignSelf: 'flex-start' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: '#2f2a42' }}>
                                    {item.product?.name || `Product #${item.product_id}`}
                                  </p>
                                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                                    €{price.toFixed(2)} × {item.quantity}
                                  </p>

                                  {canReviewProduct && (
                                    <ProductReviewForm
                                      order={order}
                                      item={item}
                                      onDone={() => setReviewedOrderItemIds(prev => [...prev, item.id])}
                                    />
                                  )}
                                  {!canReviewProduct && reviewedOrderItemIds.includes(item.id) && (
                                    <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 600, color: '#10b981' }}>{t('orders2.reviewDone')}</p>
                                  )}
                                </div>
                                <strong style={{ fontSize: 14, color: '#2f2a42', alignSelf: 'flex-start' }}>€{(price * item.quantity).toFixed(2)}</strong>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="muted" style={{ fontSize: 13 }}>{t('orders2.noItemDetails')}</p>
                      )}

                      {order.delivery_address && (
                        <div style={{ marginTop: 14, padding: '10px 14px', background: '#f9fafb', borderRadius: 8, fontSize: 13 }}>
                          <strong style={{ color: '#374151' }}>{t('orders2.deliveryAddress')}</strong>
                          <span style={{ color: '#6b7280', marginLeft: 8 }}>{order.delivery_address}</span>
                          {order.notes && <span style={{ display: 'block', color: '#9ca3af', marginTop: 4 }}>{t('orders2.note')} {order.notes}</span>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {meta.last_page > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>{t('orders2.page', { current: meta.current_page, total: meta.last_page })}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{ fontSize: 13 }}
                >{t('orders2.prev')}</button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= meta.last_page}
                  style={{ fontSize: 13 }}
                >{t('orders2.next')}</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
