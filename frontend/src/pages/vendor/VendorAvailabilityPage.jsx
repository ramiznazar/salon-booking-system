import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const DEFAULT_HOURS = { open: '09:00', close: '18:00' }

export default function VendorAvailabilityPage() {
  const { t } = useTranslation()
  const [hours, setHours] = useState({})
  const [slotDuration, setSlotDuration] = useState(30)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/vendor/me').then(r => {
      const v = r.data.data?.vendor
      setHours(v?.working_hours || {})
      setSlotDuration(v?.slot_duration_minutes || 30)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleDay = (key) => {
    setHours(h => {
      const next = { ...h }
      if (next[key]) delete next[key]
      else next[key] = { ...DEFAULT_HOURS }
      return next
    })
  }

  const setTime = (key, field, val) => {
    setHours(h => ({ ...h, [key]: { ...h[key], [field]: val } }))
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false)
    try {
      await api.put('/vendor/me', { working_hours: hours, slot_duration_minutes: slotDuration })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="py-20 text-center text-slate-400 text-sm">{t('common.loading')}</div>

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('vendor.availability')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('vendorAvail.subtitle', 'Set your working hours — customers will only see slots within these times')}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Slot duration row */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <label className="text-sm font-semibold text-slate-700 w-36 flex-shrink-0">{t('vendorAvail.slotDuration', 'Slot Duration')}</label>
          <select
            value={slotDuration}
            onChange={e => setSlotDuration(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            {[15, 20, 30, 45, 60, 90, 120].map(m => (
              <option key={m} value={m}>{m} {t('vendorAvail.minutes', 'minutes')}</option>
            ))}
          </select>
        </div>

        {/* Day rows */}
        {DAYS.map(({ key, label }) => {
          const enabled = !!hours[key]
          return (
            <div key={key} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 last:border-b-0">
              {/* Toggle */}
              <button
                onClick={() => toggleDay(key)}
                className={`relative w-10 h-[22px] rounded-full border-0 cursor-pointer transition-colors flex-shrink-0 ${enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-[3px] w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-[22px]' : 'left-[3px]'}`} />
              </button>

              <span className={`text-sm font-semibold w-28 flex-shrink-0 ${enabled ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>

              {enabled ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 text-xs">{t('vendorAvail.open', 'Open')}</span>
                  <input
                    type="time"
                    value={hours[key]?.open || '09:00'}
                    onChange={e => setTime(key, 'open', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  <span className="text-slate-300">→</span>
                  <input
                    type="time"
                    value={hours[key]?.close || '18:00'}
                    onChange={e => setTime(key, 'close', e.target.value)}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              ) : (
                <span className="text-xs text-slate-300">{t('vendorAvail.closed', 'Closed')}</span>
              )}
            </div>
          )
        })}
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl border border-emerald-200">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {t('vendorAvail.savedSuccess', 'Availability saved successfully!')}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl border-0 cursor-pointer transition-colors text-sm"
      >
        {saving ? t('common.saving', 'Saving…') : t('vendorAvail.saveBtn', 'Save Availability')}
      </button>
    </div>
  )
}
