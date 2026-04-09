import { bookings, services, vendors } from '../data/mockData'
import EmptyState from '../components/EmptyState'

function BookingsPage() {
  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>My Bookings</h2>
              <p>Manage upcoming appointments across all vendors.</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Book a service to see your upcoming appointments here."
            />
          ) : (
            <div className="lumina-service-list" style={{ marginTop: '14px' }}>
              {bookings.map((booking) => {
                const vendor = vendors.find((entry) => entry.id === booking.vendorId)
                const service = services.find((entry) => entry.id === booking.serviceId)
                return (
                  <article key={booking.id} className="lumina-service-item">
                    <div>
                      <h3>{service?.name}</h3>
                      <p>
                        {vendor?.name} - {booking.dateTime}
                      </p>
                    </div>
                    <div>
                      <strong>{booking.status}</strong>
                      <button type="button">Manage</button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  )
}

export default BookingsPage
