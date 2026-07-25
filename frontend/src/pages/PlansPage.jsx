import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { getLocalizedArray, getLocalizedField } from '../utils/localize'

function PlansPage() {
  const { t, i18n } = useTranslation()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/plans')
      .then(r => setPlans(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const colors = ['#4f46e5', '#059669', '#d97706']

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <p style={{ color: '#4f46e5', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: 13, marginBottom: 8 }}>{t('plans2.forBarbers')}</p>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('plans2.choosePlan')}</h2>
          <p className="muted" style={{ maxWidth: 540, margin: '0 auto 2.5rem' }}>
            {t('plans2.choosePlanDesc')}
          </p>

          {loading ? (
            <p className="muted">{t('plans2.loadingPlans')}</p>
          ) : plans.length === 0 ? (
            <p className="muted">{t('plans2.noPlans')}</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
              {plans.map((plan, i) => {
                const accent = colors[i % colors.length]
                const features = getLocalizedArray(plan, 'features', i18n.language)
                return (
                  <div key={plan.id} style={{ background: '#fff', border: `2px solid ${i === 1 ? accent : '#e5e7eb'}`, borderRadius: 16, padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', position: 'relative', boxShadow: i === 1 ? `0 8px 32px ${accent}22` : '0 2px 8px rgba(0,0,0,0.06)' }}>
                    {i === 1 && (
                      <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: accent, color: '#fff', fontSize: 12, fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: 999 }}>{t('plans2.mostPopular')}</span>
                    )}
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: accent, marginBottom: 4 }}>{getLocalizedField(plan, 'name', i18n.language)}</h3>
                      <p style={{ fontSize: 13, color: '#6b7280' }}>{getLocalizedField(plan, 'description', i18n.language, '')}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827' }}>€{parseFloat(plan.price).toFixed(0)}</span>
                      <span style={{ color: '#9ca3af', fontSize: 14 }}>/{plan.duration_days}d</span>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {features.map((f, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                          <span style={{ color: accent, fontWeight: 700 }}>✓</span> {f}
                        </li>
                      ))}
                      {plan.max_services && (
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                          <span style={{ color: accent, fontWeight: 700 }}>✓</span> {t('plans2.upToServices', { count: plan.max_services })}
                        </li>
                      )}
                      {plan.max_products && (
                        <li style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#374151' }}>
                          <span style={{ color: accent, fontWeight: 700 }}>✓</span> {t('plans2.upToProducts', { count: plan.max_products })}
                        </li>
                      )}
                    </ul>
                    <button
                      onClick={() => navigate(`/vendor/register?plan=${plan.id}`)}
                      style={{ marginTop: 'auto', background: accent, color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}
                    >
                      {t('plans2.getStarted')}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          <p style={{ marginTop: '2.5rem', fontSize: 14, color: '#9ca3af' }}>
            {t('plans2.alreadyAccount')}{' '}
            <a href="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>{t('plans2.signInVendor')}</a>
          </p>
        </section>
      </div>
    </section>
  )
}

export default PlansPage
