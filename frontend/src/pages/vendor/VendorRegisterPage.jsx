import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { getLocalizedField } from '../../utils/localize'

const STEPS_KEYS = ['vendorReg.step1', 'vendorReg.step2', 'vendorReg.step3']

function VendorRegisterPage() {
  const { t, i18n } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    shop_name: '', shop_name_it: '', description: '', description_it: '', address: '', address_it: '', city: '', city_it: '',
  })

  useEffect(() => {
    api.get('/plans').then(r => {
      const list = r.data.data || []
      setPlans(list)
      const planId = params.get('plan')
      if (planId) {
        const found = list.find(p => String(p.id) === planId)
        if (found) { setSelectedPlan(found); setStep(1) }
      }
    }).catch(() => {})
  }, [])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.post('/auth/vendor-register', {
        ...form,
        plan_id: selectedPlan.id,
      })
      const { user, token } = res.data.data
      localStorage.setItem('app_token', token)
      localStorage.setItem('app_user', JSON.stringify(user))
      navigate('/vendor')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inp = { padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, width: '100%', boxSizing: 'border-box' }
  const lbl = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500, color: '#374151' }
  const colors = ['#4f46e5', '#059669', '#d97706']

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div style={{ maxWidth: 640, margin: '3rem auto' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: 0 }}>
            {STEPS_KEYS.map((sk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS_KEYS.length - 1 ? 1 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= step ? '#4f46e5' : '#e5e7eb', color: i <= step ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 11, color: i === step ? '#4f46e5' : '#9ca3af', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{t(sk)}</span>
                </div>
                {i < STEPS_KEYS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#4f46e5' : '#e5e7eb', margin: '0 8px', marginBottom: 18 }} />}
              </div>
            ))}
          </div>

          <div className="lumina-block" style={{ padding: '2rem' }}>
            {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: 14 }}>{error}</div>}

            {/* Step 0: Choose Plan */}
            {step === 0 && (
              <div>
                <h2 style={{ marginBottom: 4 }}>{t('vendorReg.choosePlan', 'Choose a Plan')}</h2>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>{t('vendorReg.choosePlanDesc', 'Select the plan that fits your business')}</p>
                {plans.length === 0 ? <p className="muted">{t('plans2.loadingPlans')}</p> : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {plans.map((plan, i) => (
                      <div key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        style={{ border: `2px solid ${selectedPlan?.id === plan.id ? colors[i % 3] : '#e5e7eb'}`, borderRadius: 12, padding: '1rem 1.25rem', cursor: 'pointer', background: selectedPlan?.id === plan.id ? `${colors[i % 3]}08` : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontWeight: 700, margin: 0, color: colors[i % 3] }}>{getLocalizedField(plan, 'name', i18n.language)}</p>
                          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>{plan.duration_days} days</p>
                        </div>
                        <p style={{ fontWeight: 800, fontSize: '1.25rem', margin: 0 }}>€{parseFloat(plan.price).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button disabled={!selectedPlan} onClick={() => setStep(1)} className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                  {t('vendorReg.continue', 'Continue →')}
                </button>
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div>
                <h2 style={{ marginBottom: 4 }}>{t('vendorReg.yourDetails', 'Your Details')}</h2>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>{t('vendorReg.yourDetailsDesc', 'Create your account and shop profile')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <label style={lbl}>{t('auth.nameLabel')} <input style={inp} value={form.name} onChange={set('name')} placeholder="John Doe" /></label>
                  <label style={lbl}>{t('auth.emailLabel')} <input style={inp} type="email" value={form.email} onChange={set('email')} placeholder="you@shop.com" /></label>
                  <label style={lbl}>{t('auth.passwordLabel')} <input style={inp} type="password" value={form.password} onChange={set('password')} placeholder="Min 8 chars" /></label>
                  <label style={lbl}>{t('auth.phoneLabel')} <input style={inp} value={form.phone} onChange={set('phone')} placeholder="+1 234 567" /></label>
                  <label style={{ ...lbl, gridColumn: '1/-1' }}>{t('vendorProfile.shopName')} (EN) <input style={inp} value={form.shop_name} onChange={set('shop_name')} placeholder="My Barber Studio" /></label>
                  <label style={{ ...lbl, gridColumn: '1/-1' }}>{t('vendorProfile.shopName')} (IT) <input style={inp} value={form.shop_name_it} onChange={set('shop_name_it')} placeholder="Nome negozio (opzionale)" /></label>
                  <label style={lbl}>{t('checkout2.city')} (EN) <input style={inp} value={form.city} onChange={set('city')} placeholder="Milan" /></label>
                  <label style={lbl}>{t('checkout2.streetAddress')} (EN) <input style={inp} value={form.address} onChange={set('address')} placeholder="Via Roma 1" /></label>
                  <label style={lbl}>{t('checkout2.city')} (IT) <input style={inp} value={form.city_it} onChange={set('city_it')} placeholder="Città (opzionale)" /></label>
                  <label style={lbl}>{t('checkout2.streetAddress')} (IT) <input style={inp} value={form.address_it} onChange={set('address_it')} placeholder="Indirizzo (opzionale)" /></label>
                  <label style={{ ...lbl, gridColumn: '1/-1' }}>{t('vendorProfile.description')} (EN) <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }} value={form.description} onChange={set('description')} /></label>
                  <label style={{ ...lbl, gridColumn: '1/-1' }}>{t('vendorProfile.description')} (IT) <textarea style={{ ...inp, minHeight: 72, resize: 'vertical' }} value={form.description_it} onChange={set('description_it')} /></label>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setStep(0)} className="btn-secondary" style={{ flex: 1 }}>{t('vendorReg.back', '← Back')}</button>
                  <button onClick={() => {
                    if (!form.name || !form.email || !form.password || !form.shop_name || !form.city || !form.address) { setError(t('vendorReg.fillRequired', 'Please fill all required fields.')); return }
                    setError(''); setStep(2)
                  }} className="btn-primary" style={{ flex: 2 }}>
                    {t('vendorReg.reviewConfirm', 'Review & Confirm →')}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <div>
                <h2 style={{ marginBottom: 4 }}>{t('vendorReg.confirmPay', 'Confirm & Pay')}</h2>
                <p className="muted" style={{ marginBottom: '1.5rem' }}>{t('vendorReg.confirmPayDesc', 'Review your details before completing registration')}</p>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h4 style={{ margin: 0, color: '#4f46e5' }}>📋 {t('vendorReg.selectedPlan', 'Selected Plan')}: {getLocalizedField(selectedPlan, 'name', i18n.language)}</h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>€{parseFloat(selectedPlan?.price).toFixed(2)} {t('vendorReg.for', 'for')} {selectedPlan?.duration_days} {t('vendorReg.days', 'days')}</p>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: 14, color: '#374151' }}>
                  <div><span style={{ color: '#9ca3af' }}>Name:</span> {form.name}</div>
                  <div><span style={{ color: '#9ca3af' }}>Email:</span> {form.email}</div>
                  <div><span style={{ color: '#9ca3af' }}>Shop:</span> {form.shop_name}</div>
                  <div><span style={{ color: '#9ca3af' }}>City:</span> {form.city}</div>
                  <div style={{ gridColumn: '1/-1' }}><span style={{ color: '#9ca3af' }}>Address:</span> {form.address}</div>
                </div>

                <p style={{ fontSize: 13, color: '#9ca3af', background: '#fffbeb', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem' }}>
                  💳 Payment is simulated for now. No real charge will occur.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>{t('vendorReg.back', '← Back')}</button>
                  <button onClick={handleRegister} disabled={loading} className="btn-primary" style={{ flex: 2 }}>
                    {loading ? t('common.loading') : t('vendorReg.completeReg', '✓ Complete Registration')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default VendorRegisterPage
