import { Link, useParams } from 'react-router-dom'
import { services, vendors } from '../data/mockData'

function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const service = services.find((item) => String(item.id) === serviceId) || services[0]
  const vendor = vendors.find((item) => item.id === service.vendorId)

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <div className="breadcrumb-row">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/vendor/${service.vendorId}`}>Vendor</Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        <section className="lumina-block product-details-layout">
          <img
            className="product-details-image"
            src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80"
            alt={service.name}
          />
          <div className="product-details-content">
            <p className="shop-item-brand">{vendor?.name}</p>
            <h2>{service.name}</h2>
            <p className="muted">
              Personalized treatment by skilled professionals with premium
              products and modern techniques.
            </p>
            <p className="price">EUR {service.price}</p>
            <div className="vendor-side-box">
              <strong>Service details</strong>
              <p>Duration: {service.duration} minutes</p>
              <p>Rating: 4.9</p>
              <p>Next available: Today at 2:00 PM</p>
            </div>
            <div className="row-actions">
              <Link className="btn-primary" to={`/booking/${service.id}`}>
                Book Appointment
              </Link>
              <Link className="btn-secondary" to={`/vendor/${service.vendorId}`}>
                View Vendor
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}

export default ServiceDetailsPage
