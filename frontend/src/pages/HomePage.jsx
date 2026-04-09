import { Link } from 'react-router-dom'
import { categories, products, services, vendors } from '../data/mockData'

function HomePage() {
  const featuredVendors = vendors.slice(0, 3)
  const featuredCatalog = [
    {
      id: 'f1',
      type: 'Product',
      label: 'Best Seller',
      name: 'Turmeric Clarifying Face Wash',
      price: 34,
      brand: 'VYA NATURALS',
      image:
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f2',
      type: 'Service',
      label: '60 MIN',
      name: 'Signature Hydrating Facial',
      price: 120,
      brand: 'GLOW STUDIO',
      image:
        'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f3',
      type: 'Product',
      label: 'Award Winning',
      name: 'Foamy Soap Free Cream',
      price: 24,
      brand: 'SESDERMA',
      image:
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    },
    {
      id: 'f4',
      type: 'Product',
      label: 'Product',
      name: 'Squalane Cleanser',
      price: 36,
      brand: 'THE ORDINARY',
      image:
        'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
    },
  ]

  return (
    <section className="lumina-home">
      <div className="lumina-top-strip">Free domestic shipping on orders over $100</div>

      <div className="section-wrap">
        <section className="lumina-hero">
          <div className="lumina-hero-overlay">
            <h1>Discover Premium Beauty Services &amp; Products</h1>
            <p>
              Connect with top-rated vendors, book appointments, and shop curated
              collections all in one marketplace.
            </p>
            <div className="lumina-search">
              <input placeholder="Search services or products" />
              <input placeholder="Location" />
              <input placeholder="Date & Time" />
              <button type="button">Search</button>
            </div>
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Shop &amp; Book by Category</h2>
              <p>Explore our curated selection of beauty essentials and professional services.</p>
            </div>
            <div className="lumina-tabs">
              <button type="button" className="active">
                Products
              </button>
              <button type="button">Services</button>
              <button type="button">View All</button>
            </div>
          </div>
          <div className="lumina-category-row">
            {categories.map((category, idx) => (
              <article key={category} className="lumina-category-item">
                <div className="lumina-category-icon">{idx + 1}</div>
                <h3>{category}</h3>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Featured Products &amp; Services</h2>
            </div>
          </div>
          <div className="lumina-cards">
            {featuredCatalog.map((item) => (
              <article key={item.id} className="lumina-card">
                <img src={item.image} alt={item.name} />
                <div className="lumina-card-body">
                  <div className="lumina-pill-row">
                    <span>{item.type}</span>
                    <span>{item.label}</span>
                  </div>
                  <p className="lumina-brand">{item.brand}</p>
                  <h3>{item.name}</h3>
                  <div className="lumina-price-row">
                    <strong>${item.price.toFixed(2)}</strong>
                    <button type="button">{item.type === 'Service' ? 'Book' : 'Add to Bag'}</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-promo">
          <div className="lumina-promo-content">
            <p className="kicker">Summer Collection &amp; Services</p>
            <h2>Glow With Confidence This Season</h2>
            <p>
              Discover our curated selection of SPF essentials and book
              revitalizing summer skin treatments.
            </p>
            <div className="lumina-promo-actions">
              <button type="button" className="primary">
                Shop Products
              </button>
              <button type="button">Book Treatments</button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1600&q=80"
            alt="Seasonal collection"
          />
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Top Salons</h2>
              <p>Trusted salons and beauty centers with verified customer reviews.</p>
            </div>
          </div>
          <div className="lumina-salon-grid">
            {featuredVendors.map((vendor) => (
              <article key={vendor.id} className="lumina-salon-card">
                <img
                  src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1000&q=80"
                  alt={vendor.name}
                />
                <div>
                  <h3>{vendor.name}</h3>
                  <p>
                    {vendor.category} - {vendor.city}
                  </p>
                  <Link to={`/vendor/${vendor.id}`}>View Profile</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Popular Services</h2>
              <p>Book top demand services from verified professionals.</p>
            </div>
          </div>
          <div className="lumina-service-list">
            {services.map((service) => (
              <article key={service.id} className="lumina-service-item">
                <div className="lumina-service-main">
                  <p className="lumina-service-label">Service</p>
                  <h3>{service.name}</h3>
                  <p>{service.duration} min session</p>
                </div>
                <div className="lumina-service-side">
                  <strong>${service.price.toFixed(2)}</strong>
                  <button type="button">Book Appointment</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="section-wrap">
        <section className="lumina-footer-preview">
          <div>
            <h3>Lumina</h3>
            <p>Your premier destination for curated beauty products and top-tier professional services.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <p>Skincare</p>
            <p>Makeup</p>
            <p>Haircare</p>
          </div>
          <div>
            <h4>Services</h4>
            <p>Book an Appointment</p>
            <p>Find a Vendor</p>
            <p>Become a Vendor</p>
          </div>
          <div>
            <h4>Support</h4>
            <p>Contact Us</p>
            <p>FAQs</p>
            <p>Shipping & Returns</p>
          </div>
        </section>
      </div>
    </section>
  )
}

export default HomePage
