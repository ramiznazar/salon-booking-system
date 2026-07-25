import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppAuth } from '../context/AppAuthContext'

function RegisterPage() {
  const { t } = useTranslation()
  const { register, loading } = useAppAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await register(form.name, form.email, form.password, form.phone)
    if (result.success) {
      navigate('/bookings')
    } else {
      setError(result.message)
    }
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="max-w-md mx-auto my-16">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t('auth.registerTitle')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('auth.registerSubtitle', "Join Lumina as a customer — it's free")}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.nameLabel')}
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.emailLabel')}
                <input
                  type="email"
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.phoneLabel', 'Phone')} <span className="font-normal text-slate-400 normal-case">({t('auth.optional', 'optional')})</span>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 234 567 890"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.passwordLabel')}
                <input
                  type="password"
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl border-0 cursor-pointer transition-colors"
              >
                {loading ? t('common.loading') : t('auth.registerBtn')}
              </button>
            </form>

            <div className="mt-5 flex flex-col gap-1.5 text-center text-sm text-slate-500">
              <p>
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-indigo-600 font-semibold hover:underline">{t('auth.loginBtn')}</Link>
              </p>
              <p>
                {t('auth.areYouBarber', 'Are you a barber?')}{' '}
                <Link to="/plans" className="text-indigo-600 font-semibold hover:underline">{t('auth.seePlans', 'See our plans →')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
