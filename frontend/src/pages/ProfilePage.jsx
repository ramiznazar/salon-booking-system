import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAppAuth } from '../context/AppAuthContext'

function ProfilePage() {
  const { t } = useTranslation()
  const { isAuthenticated, isCustomer, user: ctxUser, updateUser, logout } = useAppAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', phone: '' })
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) { navigate('/login?redirect=/profile'); return }
    api.get('/auth/me')
      .then(r => {
        const u = r.data.data
        setForm({ name: u.name || '', phone: u.phone || '' })
        setEmail(u.email || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setSaved(false); setError('')
    try {
      const res = await api.put('/my/profile', form)
      const updated = res.data.data
      updateUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleLogout = () => { logout(); navigate('/') }

  const initials = form.name ? form.name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'

  if (loading) return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="py-20 text-center text-slate-400 text-sm">Loading…</div>
      </div>
    </section>
  )

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="max-w-2xl mx-auto py-8 space-y-6">

          {/* Profile hero */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 truncate">{form.name || 'Customer'}</h2>
              <p className="text-sm text-slate-500 truncate">{email}</p>
              <span className="inline-block mt-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">{t('profile2.customerAccount')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-600 font-medium border-0 bg-transparent cursor-pointer transition-colors flex-shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              {t('profile2.signOut')}
            </button>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/bookings" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 no-underline hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('profile2.myBookingsLink')}</p>
                <p className="text-xs text-slate-500">{t('profile2.viewAppointments')}</p>
              </div>
            </Link>
            <Link to="/search" className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 no-underline hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center flex-shrink-0 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{t('profile2.findServices')}</p>
                <p className="text-xs text-slate-500">{t('profile2.browseBook')}</p>
              </div>
            </Link>
          </div>

          {/* Edit profile form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {t('profile2.editProfile')}
            </h3>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl border border-emerald-200 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t('profile2.profileUpdated')}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.nameLabel')}
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.emailLabel')} <span className="font-normal text-slate-400 normal-case">{t('profile2.emailCannotChange')}</span>
                <input
                  className="border border-slate-100 rounded-lg px-3 py-2.5 text-sm text-slate-400 font-normal normal-case bg-slate-50 cursor-not-allowed"
                  value={email}
                  readOnly
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wide">
                {t('auth.phoneLabel')} <span className="font-normal text-slate-400 normal-case">{t('profile2.phoneOptional')}</span>
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-900 font-normal normal-case focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 234 567 890"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="mt-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl border-0 cursor-pointer transition-colors"
              >
                {saving ? t('profile2.saving') : t('profile2.saveChanges')}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ProfilePage
