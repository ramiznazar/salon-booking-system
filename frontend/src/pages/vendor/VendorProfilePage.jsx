import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import ImageUpload from '../../components/ImageUpload'

export default function VendorProfilePage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', name_it: '', phone: '', logo_url: '', description: '', description_it: '', address: '', address_it: '', city: '', city_it: '', map_embed: '' })
  const [guideOpen, setGuideOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/vendor/me').then(r => {
      const v = r.data.data?.vendor
      if (v) setForm({ name: v.name || '', name_it: v.name_it || '', phone: v.phone || '', logo_url: v.logo_url || '', description: v.description || '', description_it: v.description_it || '', address: v.address || '', address_it: v.address_it || '', city: v.city || '', city_it: v.city_it || '', map_embed: v.map_embed || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setSaved(false); setError('')
    try {
      await api.put('/vendor/me', form)
      window.dispatchEvent(new Event('vendor-profile-updated'))
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (err) { setError(err.response?.data?.message || 'Failed to save') } finally { setSaving(false) }
  }

  if (loading) return <div className="py-20 text-center text-slate-400 text-sm">{t('common.loading')}</div>

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('vendorProfile.title', 'Shop Profile')}</h1>
            <p className="text-indigo-100 text-lg">{t('vendorProfile.subtitle', 'Update your public shop details')}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
              <span className="font-medium">{t('vendorProfile.savedSuccess', 'Profile updated successfully!')}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('vendorProfile.basicInfo', 'Basic Information')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('vendorProfile.shopName', 'Shop / Studio Name')} (EN)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('vendorProfile.shopName', 'Shop / Studio Name')} (IT)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.name_it} onChange={e => setForm(f => ({ ...f, name_it: e.target.value }))}
                    placeholder="Nome negozio (opzionale)"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">{t('auth.phoneLabel')}</span>
                <input
                  className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890"
                />
              </label>
            </div>

            {/* Branding Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('vendorProfile.branding', 'Branding')}</h3>
              
              <ImageUpload
                label={t('vendorProfile.logoUrl', 'Logo')}
                value={form.logo_url}
                onChange={(url) => setForm((f) => ({ ...f, logo_url: url }))}
              />
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('vendorProfile.location', 'Location')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('checkout2.city')} (EN)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('checkout2.city')} (IT)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.city_it} onChange={e => setForm(f => ({ ...f, city_it: e.target.value }))}
                    placeholder="Città (opzionale)"
                  />
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('checkout2.streetAddress')} (EN)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('checkout2.streetAddress')} (IT)</span>
                  <input
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={form.address_it} onChange={e => setForm(f => ({ ...f, address_it: e.target.value }))}
                    placeholder="Indirizzo (opzionale)"
                  />
                </label>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">{t('vendorProfile.description', 'Description')}</h3>
              
              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('vendorProfile.description', 'Description')} (EN)</span>
                  <textarea
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px] transition-all"
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Tell customers about your shop…"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-slate-700">{t('vendorProfile.description', 'Description')} (IT)</span>
                  <textarea
                    className="border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px] transition-all"
                    value={form.description_it} onChange={e => setForm(f => ({ ...f, description_it: e.target.value }))}
                    placeholder="Descrizione in italiano (opzionale)"
                  />
                </label>
              </div>
            </div>

            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 flex-1">{t('vendorProfile.mapLabel', 'Salon Location (Google Maps)')}</h3>
                <button
                  type="button"
                  onClick={() => setGuideOpen(o => !o)}
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-transparent border-0 cursor-pointer p-0"
                >
                  {guideOpen ? t('vendorProfile.hideGuide', 'Hide guide ▲') : t('vendorProfile.showGuide', 'How to get embed code? ▼')}
                </button>
              </div>

              {guideOpen && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <p className="font-semibold text-indigo-900 mb-3">How to embed your salon location from Google Maps:</p>
                  <ol className="space-y-2 text-sm text-slate-700">
                    <li>1. Open <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-medium hover:underline">Google Maps</a> and search for your salon address.</li>
                    <li>2. Click the <strong>Share</strong> button (📤) on the left-side panel.</li>
                    <li>3. In the share dialog, click the <strong>Embed a map</strong> tab.</li>
                    <li>4. Click <strong>Copy HTML</strong> — you'll get code that looks like this:</li>
                  </ol>
                  <code className="block mt-3 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-600 break-all leading-relaxed">
                    {'<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'}
                  </code>
                  <p className="mt-3 text-sm text-slate-600">Paste the entire <code className="bg-white border border-slate-200 rounded px-1">&lt;iframe&gt;</code> tag into the field below.</p>
                </div>
              )}

              <textarea
                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm text-slate-700 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[100px] transition-all"
                value={form.map_embed}
                onChange={e => setForm(f => ({ ...f, map_embed: e.target.value }))}
                placeholder='<iframe src="https://www.google.com/maps/embed?..." width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
              />

              {form.map_embed && form.map_embed.includes('<iframe') && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: form.map_embed
                        .replace(/width="[^"]*"/, 'width="100%"')
                        .replace(/height="[^"]*"/, 'height="300"'),
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 text-white font-semibold rounded-xl border-0 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
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
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('vendorProfile.preview', 'Profile Preview')}</h3>
            <div className="space-y-4">
              {form.logo_url && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img src={form.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-slate-900">{form.name || 'Shop Name'}</h4>
                <p className="text-sm text-slate-600 mt-1">{form.phone || 'Phone Number'}</p>
                <p className="text-sm text-slate-600 mt-1">{form.city || 'City'}, {form.address || 'Address'}</p>
              </div>
              <p className="text-sm text-slate-700 line-clamp-3">{form.description || 'Shop description will appear here...'}</p>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">{t('vendorProfile.tips', 'Profile Tips')}</h3>
            <ul className="space-y-2 text-sm text-indigo-700">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('vendorProfile.tip1', 'Add a professional logo to build trust')}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('vendorProfile.tip2', 'Provide both English and Italian content')}</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{t('vendorProfile.tip3', 'Embed a map to help customers find you')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
