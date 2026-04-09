import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { services, vendors } from '../data/mockData'

function BookingPage() {
  const { serviceId } = useParams()
  const service = services.find((item) => String(item.id) === serviceId) || services[0]
  const vendor = vendors.find((item) => item.id === service.vendorId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = () => {
    setIsSubmitting(true)
    window.setTimeout(() => setIsSubmitting(false), 1200)
  }

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/services/${service.id}`}>Service</Link>
          <span>/</span>
          <span>Booking</span>
        </div>

        <section className="lumina-block booking-layout">
          <div>
            <h2>Booking</h2>
            <p className="muted">Choose date, time, and provide your details.</p>

            <div className="booking-form">
              <label>
                Service
                <input value={service.name} readOnly />
              </label>
              <label>
                Date
                <input placeholder="dd/mm/yyyy" />
              </label>
              <label>
                Time
                <input placeholder="e.g. 15:00" />
              </label>
              <label>
                Full Name
                <input placeholder="Your full name" />
              </label>
              <label>
                Phone
                <input placeholder="+39 ..." />
              </label>
              <button
                className={`btn-primary ${isSubmitting ? 'btn-loading' : ''}`}
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirm}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>

          <aside className="vendor-side-panel">
            <h3>Booking Summary</h3>
            <p>{vendor?.name}</p>
            <div className="vendor-side-box">
              <strong>{service.name}</strong>
              <p>Duration: {service.duration} min</p>
              <p>Price: EUR {service.price}</p>
            </div>
            <Link className="btn-secondary" to={`/services/${service.id}`}>
              Back to service details
            </Link>
          </aside>
        </section>
      </div>
    </section>
  )
}

export default BookingPage
