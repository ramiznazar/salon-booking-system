import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

export default function VendorLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const { user, token } = res.data.data
      if (user.role !== 'vendor') {
        setError('This login is for vendors only. Use the main login page for customers.')
        return
      }
      localStorage.setItem('app_token', token)
      localStorage.setItem('app_user', JSON.stringify(user))
      navigate('/vendor')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '2.5rem 2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 24 }}>✂</div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{t('auth.vendorLogin')}</h2>
          <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: 14 }}>{t('vendorLogin.subtitle', 'Access your barber panel')}</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: 14 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
            {t('auth.emailLabel')}
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
              style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
            {t('auth.passwordLabel')}
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
              style={{ padding: '0.65rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
          </label>
          <button type="submit" disabled={loading}
            style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '0.75rem', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: '0.5rem' }}>
            {loading ? t('common.loading') : t('vendorLogin.signInBtn', 'Sign In to Vendor Panel')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: '#9ca3af' }}>
          <p style={{ margin: 0 }}>{t('vendorLogin.noAccount', "Don't have a vendor account?")}{' '}
            <Link to="/plans" style={{ color: '#4f46e5', fontWeight: 600 }}>{t('vendorLogin.getPlan', 'Get a plan →')}</Link>
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>{t('vendorLogin.areCustomer', 'Are you a customer?')}{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 600 }}>{t('vendorLogin.loginHere', 'Login here')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
