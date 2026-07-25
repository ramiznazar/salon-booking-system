import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const STATUS_CLS = {
  pending:   'bg-amber-100 text-amber-700',
  accepted:  'bg-emerald-100 text-emerald-700',
  rejected:  'bg-rose-100 text-rose-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

const TABS = ['pending', 'accepted', 'completed', 'cancelled']

export default function VendorBookingsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('pending')
  const [bookings, setBookings] = useState([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchBookings = () => {
    setLoading(true)
    api.get(`/vendor/bookings?status=${tab}&page=${page}`)
      .then(r => { setBookings(r.data.data?.data || []); setMeta(r.data.data?.meta || r.data.data || {}) })
      .catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { setPage(1) }, [tab])
  useEffect(() => { fetchBookings() }, [tab, page])

  const updateStatus = async (id, status) => {
    await api.patch(`/vendor/bookings/${id}/status/${status}`).catch(() => {})
    fetchBookings()
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{t('vendorBookings.title')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('vendorBookings.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer transition-all capitalize ${
              tab === t
                ? 'bg-white text-indigo-600 font-semibold shadow-sm'
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('vendorBookings.loading')}</div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">{t('vendorBookings.noBookings', { tab })}</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{b.user?.name || 'Customer'}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {b.service?.name} · {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                  </p>
                  {b.notes && <p className="text-xs text-slate-400 mt-1">{t('vendorBookings.note')} {b.notes}</p>}
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${STATUS_CLS[b.status] || STATUS_CLS.cancelled}`}>
                  {b.status}
                </span>

                {b.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => updateStatus(b.id, 'accepted')} className="text-xs font-semibold px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg border-0 cursor-pointer transition-colors">{t('vendorBookings.accept')}</button>
                    <button onClick={() => updateStatus(b.id, 'rejected')} className="text-xs font-semibold px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg border-0 cursor-pointer transition-colors">{t('vendorBookings.reject')}</button>
                  </div>
                )}
                {b.status === 'accepted' && (
                  <button onClick={() => updateStatus(b.id, 'completed')} className="text-xs font-semibold px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg border-0 cursor-pointer transition-colors flex-shrink-0">
                    {t('vendorBookings.markComplete')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm">
            <span className="text-slate-500">{t('vendorBookings.page', { current: meta.current_page, total: meta.last_page })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.prev')}</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.last_page} className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-xs">{t('vendorBookings.next')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
