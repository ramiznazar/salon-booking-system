import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { products, services, vendors } from '../data/mockData'

function VendorPage() {
  const { vendorId } = useParams()
  const vendor = vendors.find((entry) => String(entry.id) === vendorId) || vendors[0]
  const vendorServices = services.filter((entry) => entry.vendorId === vendor.id)
  const vendorProducts = products.filter((entry) => entry.vendorId === vendor.id)
  const [activeTab, setActiveTab] = useState('services')

  const tabItems = useMemo(
    () => [
      { id: 'services', label: `Services (${vendorServices.length})` },
      { id: 'products', label: `Products (${vendorProducts.length})` },
      { id: 'reviews', label: 'Reviews & Photos' },
      { id: 'about', label: 'About & Policies' },
    ],
    [vendorProducts.length, vendorServices.length],
  )

  return (
    <section className="lumina-vendor-page">
      <div className="section-wrap">
        <div className="vendor-cover" />
        <div className="vendor-header">
          <div className="vendor-avatar">MB</div>
          <div className="vendor-header-main">
            <h1>{vendor.name}</h1>
            <p>
              4.9 (128 Reviews) • {vendor.address}, {vendor.city} • Open now
            </p>
            <p className="muted">
              Specializing in holistic skincare, advanced facial treatments, and
              premium botanical products.
            </p>
          </div>
          <div className="vendor-header-actions">
            <button className="btn-secondary" type="button">
              Contact
            </button>
            <button className="btn-primary" type="button">
              + Follow
            </button>
          </div>
        </div>
      </div>

      <div className="section-wrap">
        <div className="vendor-tabs">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-wrap">
        <div className="vendor-content-layout">
          <div>
            {activeTab === 'services' && (
              <div className="vendor-panel">
                <div className="vendor-panel-head">
                  <h2>Featured Services</h2>
                  <button type="button">Filter</button>
                </div>
                {vendorServices.length === 0 ? (
                  <EmptyState
                    title="No services available"
                    description="This vendor has not published services yet."
                  />
                ) : (
                  <div className="vendor-service-list">
                    {vendorServices.map((service) => (
                      <article key={service.id} className="vendor-service-card">
                        <img
                          src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80"
                          alt={service.name}
                        />
                        <div>
                          <h3>{service.name}</h3>
                          <p>
                            {service.duration} mins • 4.9 (45) • Customized treatment
                          </p>
                          <small>Next available: Today, 2:00 PM</small>
                        </div>
                        <div className="vendor-service-price">
                          <strong>${service.price}</strong>
                          <Link className="btn-secondary" to={`/booking/${service.id}`}>
                            Book Slot
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <div className="vendor-panel">
                <h2>Products</h2>
                {vendorProducts.length === 0 ? (
                  <EmptyState
                    title="No products available"
                    description="This vendor has not published products yet."
                  />
                ) : (
                  <div className="vendor-product-grid">
                    {vendorProducts.map((product) => (
                      <article key={product.id} className="vendor-product-card">
                        <img
                          src="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80"
                          alt={product.name}
                        />
                        <h3>{product.name}</h3>
                        <p>Stock {product.stock}</p>
                        <div>
                          <strong>${product.price}</strong>
                          <Link className="btn-secondary" to={`/products/${product.id}`}>
                            Details
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="vendor-panel">
                <h2>Reviews & Photos</h2>
                <div className="vendor-review-card">
                  <p>"Great service and very professional staff."</p>
                  <small>- Samantha R., 5.0</small>
                </div>
                <div className="vendor-review-card">
                  <p>"Booking flow is smooth and treatment quality is top-notch."</p>
                  <small>- Elena M., 4.9</small>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="vendor-panel">
                <h2>About & Policies</h2>
                <ul className="vendor-policy-list">
                  <li>Deposit required for services over $100</li>
                  <li>24-hour cancellation policy applies</li>
                  <li>Please arrive 10 minutes before appointment</li>
                  <li>Shipping for products: 2-3 business days</li>
                </ul>
              </div>
            )}
          </div>

          <aside className="vendor-side-panel">
            <h3>Booking Summary</h3>
            <p>Select a service to begin booking</p>
            <div className="vendor-side-box">
              <strong>Next Available Slot</strong>
              <p>Today at 2:00 PM with Sarah</p>
            </div>
            <div className="vendor-side-box">
              <strong>Studio Policies</strong>
              <ul>
                <li>Deposit required over $100</li>
                <li>24-hour cancellation policy</li>
                <li>Arrive 10 mins early</li>
              </ul>
            </div>
            <div className="vendor-side-box">
              <strong>Location</strong>
              <p>{vendor.address}</p>
              <p>{vendor.city}</p>
            </div>
          </aside>
        </div>
      </div>

      <div className="section-wrap">
        <div className="row-actions">
          <Link className="btn-secondary" to="/">
            Back to home
          </Link>
          <Link className="btn-secondary" to="/cart">
            Go to cart
          </Link>
        </div>
      </div>
    </section>
  )
}

export default VendorPage
