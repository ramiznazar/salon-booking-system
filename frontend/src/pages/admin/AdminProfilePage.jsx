import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import ImageUpload from '../../components/ImageUpload'
import { useAuth } from '../../context/AuthContext'

export default function AdminProfilePage() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', logo_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/me').then((r) => {
      const u = r.data?.data
      setForm({ name: u?.name || '', phone: u?.phone || '', logo_url: u?.logo_url || '' })
      if (u) updateUser(u)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const res = await api.put('/admin/me', form)
      const updated = res.data?.data
      if (updated) updateUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-16 text-center text-slate-400 text-sm">{t('common.loading')}</div>

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('common.profile')}</h1>
            <p className="text-slate-300 text-lg">{t('adminProfile.subtitle', 'Update your profile details')}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {saved && (
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="font-medium">{t('adminProfile.savedSuccess', 'Profile updated successfully!')}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('adminProfile.personalInfo', 'Personal Information')}</h3>
              
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">{t('auth.nameLabel', 'Name')}</span>
                <input
                  className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">{t('auth.phoneLabel')}</span>
                <input
                  className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 234 567 890"
                />
              </label>
            </div>

            {/* Profile Picture Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('adminProfile.profilePicture', 'Profile Picture')}</h3>
              
              <ImageUpload
                label={t('adminProfile.logo', 'Profile Picture')}
                value={form.logo_url}
                onChange={(url) => setForm((f) => ({ ...f, logo_url: url }))}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black disabled:opacity-60 text-white font-semibold rounded-xl border-0 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    {t('common.saving', 'Saving…')}
                  </span>
                ) : (
                  t('profile2.saveChanges')
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('adminProfile.preview', 'Profile Preview')}</h3>
            <div className="space-y-4">
              {form.logo_url && (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center mx-auto">
                  <img src={form.logo_url} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-center">
                <h4 className="font-semibold text-slate-900 text-lg">{form.name || 'Admin Name'}</h4>
                <p className="text-sm text-slate-600 mt-1">{form.phone || 'Phone Number'}</p>
                {user?.email && (
                  <p className="text-sm text-slate-500 mt-2">{user.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Info Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('adminProfile.adminInfo', 'Admin Information')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{t('adminProfile.role', 'System Administrator')}</p>
                  <p className="text-xs text-slate-600">{t('adminProfile.accessLevel', 'Full system access')}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 mb-2">{t('adminProfile.lastLogin', 'Last login')}</p>
                <p className="text-sm text-slate-700">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('adminProfile.quickActions', 'Quick Actions')}</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-slate-700">{t('adminProfile.settings', 'Account Settings')}</span>
              </button>
              
              <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-slate-700">{t('adminProfile.activity', 'Activity Log')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
