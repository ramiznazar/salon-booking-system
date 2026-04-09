import { Link } from 'react-router-dom'
import { vendors } from '../data/mockData'

function SearchPage() {
  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Find Top Beauty Vendors</h2>
              <p>Search by service, location, category, and customer rating.</p>
            </div>
          </div>
          <div className="search-box elevated">
            <input type="text" placeholder="Search by service, salon, city..." />
            <button className="btn-primary" type="button">
              Search
            </button>
          </div>
          <div className="chip-row" style={{ marginTop: '12px' }}>
            <span className="chip">Nearby</span>
            <span className="chip">Top rated</span>
            <span className="chip">Open now</span>
            <span className="chip">Low price</span>
          </div>
          <div className="lumina-salon-grid" style={{ marginTop: '16px' }}>
            {vendors.map((vendor) => (
              <article key={vendor.id} className="lumina-salon-card">
                <img
                  src="https://images.unsplash.com/photo-1633681926035-ec1ac984418a?auto=format&fit=crop&w=1200&q=80"
                  alt={vendor.name}
                />
                <div>
                  <h3>{vendor.name}</h3>
                  <p>
                    {vendor.address}, {vendor.city}
                  </p>
                  <Link to={`/vendor/${vendor.id}`}>Open Profile</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default SearchPage
