import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAppAuth } from '../context/AppAuthContext'

function BookingPage() {
  const { serviceId } = useParams()
  const { isAuthenticated, user } = useAppAuth()
  const navigate = useNavigate()

  const [service, setService] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loadingService, setLoadingService] = useState(true)

  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')

  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    api.get(`/services/${serviceId}`)
      .then(r => {
        const svc = r.data.data
        setService(svc)
        return api.get(`/vendors/${svc.vendor_id}`)
      })
      .then(r => setVendor(r.data.data))
      .catch(() => {})
      .finally(() => setLoadingService(false))
  }, [serviceId])

  useEffect(() => {
    if (!selectedDate || !vendor) return
    setLoadingSlots(true); setSelectedSlot(''); setSlots([])
    api.get(`/vendors/${vendor.id}/slots`, { params: { date: selectedDate, service_id: serviceId } })
      .then(r => setSlots(r.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, vendor])

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/booking/${serviceId}`)
      return
    }
    if (!selectedSlot) { setError('Please select a time slot.'); return }
    setSubmitting(true); setError('')
    try {
      const scheduledAt = `${selectedDate} ${selectedSlot}:00`
      await api.post('/bookings', {
        vendor_id: vendor.id,
        service_id: Number(serviceId),
        user_id: user.id,
        scheduled_at: scheduledAt,
        notes,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  const today = new Date().toISOString().split('T')[0]

  if (loadingService) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Loading…</p></div></section>
  if (!service) return <section className="lumina-page"><div className="section-wrap"><p className="muted">Service not found.</p></div></section>

  if (success) return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="max-w-md mx-auto my-16 text-center bg-white rounded-2xl border border-slate-200 shadow-sm p-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Booking Requested!</h2>
          <p className="text-sm text-slate-500">Your booking is pending confirmation from <strong>{vendor?.name}</strong>. Check your bookings page for updates.</p>
          <Link to="/bookings" className="btn-primary inline-block mt-6">View My Bookings</Link>
        </div>
      </div>
    </section>
  )

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link><span>/</span>
          <Link to={`/vendor/${vendor?.id}`}>{vendor?.name}</Link><span>/</span>
          <span>Book</span>
        </div>

        <section className="lumina-block booking-layout">
          <div>
            <h2>Book a Slot</h2>
            <p className="muted">Choose your preferred date and time.</p>

            {error && (
              <div className="flex items-center gap-2 bg-rose-50 text-rose-700 text-sm px-4 py-3 rounded-xl border border-rose-200 mb-4">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-4">
                ⚠️ You need to <Link to={`/login?redirect=/booking/${serviceId}`} className="font-bold text-amber-700 hover:underline">sign in</Link> to confirm a booking.
              </div>
            )}

            <div className="booking-form">
              <label>
                Service
                <input value={service.name} readOnly />
              </label>
              <label>
                Date
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </label>

              {selectedDate && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Available Times</p>
                  {loadingSlots ? (
                    <p className="muted text-sm">Loading slots…</p>
                  ) : slots.length === 0 ? (
                    <p className="muted text-sm">No slots available on this date. Try another day.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold cursor-pointer transition-all border-2 ${
                            selectedSlot === slot
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <label>
                Notes (optional)
                <textarea
                  placeholder="Any special requests…"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="resize-y min-h-[72px]"
                />
              </label>

              <button
                className="btn-primary"
                type="button"
                disabled={submitting || !selectedSlot}
                onClick={handleConfirm}
              >
                {submitting ? 'Confirming…' : isAuthenticated ? 'Confirm Booking' : 'Sign in to Book'}
              </button>
            </div>
          </div>

          <aside className="vendor-side-panel">
            <h3>Booking Summary</h3>
            <p>{vendor?.name}</p>
            <div className="vendor-side-box">
              <strong>{service.name}</strong>
              <p>Duration: {service.duration_minutes} min</p>
              <p>Price: €{parseFloat(service.price).toFixed(2)}</p>
              {selectedDate && <p>Date: {selectedDate}</p>}
              {selectedSlot && <p>Time: {selectedSlot}</p>}
            </div>
            <Link className="btn-secondary" to={`/vendor/${vendor?.id}`}>
              ← Back to {vendor?.name}
            </Link>
          </aside>
        </section>
      </div>
    </section>
  )
}

export default BookingPage
