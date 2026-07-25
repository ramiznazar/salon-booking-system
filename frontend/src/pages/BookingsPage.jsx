import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../api/axios'
import { useAppAuth } from '../context/AppAuthContext'

const STATUS_CLS = {
  pending:   'bg-amber-100 text-amber-700',
  accepted:  'bg-emerald-100 text-emerald-700',
  rejected:  'bg-rose-100 text-rose-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-slate-100 text-slate-500',
}

function ReviewForm({ booking, onDone }) {
  const { t } = useTranslation()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    try {
      await api.post('/reviews', { vendor_id: booking.vendor_id, booking_id: booking.id, rating, comment })
      onDone()
    } catch (e) {
      alert(e.response?.data?.message || 'Could not submit review')
    } finally { setSaving(false) }
  }

  return (
    <div className="mt-4 bg-slate-50/90 rounded-2xl p-4 md:p-5 border border-slate-200">
      <p className="text-sm font-semibold text-slate-800">{t('bookings2.howWasAppointment')}</p>
      <p className="text-xs text-slate-500 mt-0.5">{t('bookings2.reviewFeedback')}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            onClick={() => setRating(s)}
            className={`text-2xl bg-transparent border-0 cursor-pointer p-0 leading-none transition-colors ${s <= rating ? 'text-amber-500' : 'text-slate-300 hover:text-amber-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t('bookings2.howWasAppointment')}
        className="mt-2 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y min-h-[80px] w-full"
      />
      <button
        onClick={submit}
        disabled={saving}
        className="mt-3 self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl border-0 cursor-pointer transition-colors"
      >
        {saving ? t('bookings2.submitting') : t('bookings2.submitReview')}
      </button>
    </div>
  )
}

function BookingsPage() {
  const { t } = useTranslation()
  const { isAuthenticated, isCustomer } = useAppAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('upcoming')
  const [reviewedIds, setReviewedIds] = useState([])

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) { navigate('/login?redirect=/bookings'); return }
    api.get('/my/bookings')
      .then(r => setBookings(r.data.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    await api.post(`/my/bookings/${id}/cancel`).catch(() => {})
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
  }

  const upcoming = bookings.filter(b => ['pending', 'accepted'].includes(b.status))
  const past = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status))
  const displayed = tab === 'upcoming' ? upcoming : past
  const upcomingSummary = upcoming.length === 0
    ? 'No upcoming appointments'
    : `${upcoming.length} upcoming appointment${upcoming.length > 1 ? 's' : ''}`

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="max-w-4xl mx-auto py-8 space-y-6">

          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">Appointments</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">{t('bookings.title')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('bookings2.allAppointments')}</p>
            </div>
            <Link
              to="/search"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors no-underline"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {t('bookings2.bookNew')}
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 bg-slate-100 rounded-full p-1 w-fit">
              {[
                { key: 'upcoming', label: `${t('bookings2.upcoming')} (${upcoming.length})` },
                { key: 'past',     label: `${t('bookings2.past')} (${past.length})` },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-1.5 rounded-full text-sm border-0 cursor-pointer transition-all ${
                    tab === t.key
                      ? 'bg-white text-slate-900 font-semibold shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 bg-transparent font-medium'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500">{tab === 'upcoming' ? upcomingSummary : `${past.length} past appointment${past.length > 1 ? 's' : ''}`}</p>
          </div>

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center text-slate-400 text-sm">{t('bookings2.loading')}</div>
            ) : displayed.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 text-center px-6">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <p className="font-semibold text-slate-700 mt-4">{t('bookings.noBookings')}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {tab === 'upcoming' ? t('bookings2.noUpcomingDesc') : t('bookings2.noPastDesc')}
                </p>
                {tab === 'upcoming' && (
                  <Link to="/search" className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:underline">{t('bookings2.browseServices')}</Link>
                )}
              </div>
            ) : (
              displayed.map(b => {
                const canReview = b.status === 'completed' && !reviewedIds.includes(b.id)
                return (
                  <article key={b.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
                    <span className="absolute left-0 top-6 h-10 w-1 rounded-r-full bg-indigo-200" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-700 font-bold text-sm">
                          {b.vendor?.name?.[0]?.toUpperCase() ?? 'V'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-semibold text-slate-900 truncate">{b.service?.name || 'Service'}</p>
                          <p className="text-sm text-slate-500 mt-0.5 truncate">{b.vendor?.name}</p>
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {b.scheduled_at
                              ? new Date(b.scheduled_at).toLocaleString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize text-center ${STATUS_CLS[b.status] || STATUS_CLS.cancelled}`}>
                          {b.status}
                        </span>
                        {['pending', 'accepted'].includes(b.status) && (
                          <button
                            onClick={() => cancel(b.id)}
                            className="text-xs font-semibold px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg border-0 cursor-pointer transition-colors"
                          >
                            {t('bookings2.cancel')}
                          </button>
                        )}
                      </div>
                    </div>

                    {canReview && (
                      <ReviewForm booking={b} onDone={() => setReviewedIds(ids => [...ids, b.id])} />
                    )}
                    {reviewedIds.includes(b.id) && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {t('bookings2.reviewSubmitted')}
                      </div>
                    )}
                  </article>
                )
              })
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default BookingsPage
