import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppAuth } from '../context/AppAuthContext'

function LoginPage() {
  const { t } = useTranslation()
  const { login, loading } = useAppAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      if (result.role === 'vendor') {
        navigate('/vendor')
      } else {
        navigate(redirect)
      }
    } else {
      setError(result.message)
    }
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div style={{ maxWidth: 420, margin: '60px auto' }}>
          <div className="lumina-block" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>{t('auth.loginTitle')}</h2>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>{t('auth.loginSubtitle', 'Sign in to your account')}</p>

            {error && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: 14 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                {t('auth.emailLabel')}
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 500 }}>
                {t('auth.passwordLabel')}
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{ padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? t('common.loading') : t('auth.loginBtn')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: 14, color: '#6b7280' }}>
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>{t('common.register')}</Link>
            </p>
            <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: 14, color: '#6b7280' }}>
              {t('auth.areYouBarber', 'Are you a barber?')}{' '}
              <Link to="/plans" style={{ color: '#4f46e5', fontWeight: 600 }}>{t('auth.getStarted', 'Get started →')}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
