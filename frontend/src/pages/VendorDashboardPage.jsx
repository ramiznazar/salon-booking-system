function VendorDashboardPage() {
  const metrics = [
    { label: 'Today earnings', value: 'EUR 420' },
    { label: 'Open orders', value: '12' },
    { label: 'Bookings', value: '8' },
    { label: 'Products', value: '26' },
  ]

  return (
    <section className="lumina-page">
      <div className="section-wrap">
        <section className="lumina-block">
          <div className="lumina-section-head">
            <div>
              <h2>Vendor Dashboard</h2>
              <p>Manage products, services, bookings, and orders in one place.</p>
            </div>
          </div>

          <div className="shop-grid" style={{ marginTop: '16px' }}>
            {metrics.map((metric) => (
              <article key={metric.label} className="shop-item-card">
                <div className="shop-item-content">
                  <p className="shop-item-brand">Metric</p>
                  <h3>{metric.value}</h3>
                  <div className="shop-item-meta">
                    <span>{metric.label}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="shop-grid" style={{ marginTop: '14px' }}>
            <article className="shop-item-card">
              <div className="shop-item-content">
                <h3>Add product</h3>
                <p>Name, price, stock, image upload.</p>
              </div>
            </article>
            <article className="shop-item-card">
              <div className="shop-item-content">
                <h3>Add service</h3>
                <p>Name, duration, price, availability.</p>
              </div>
            </article>
            <article className="shop-item-card">
              <div className="shop-item-content">
                <h3>Manage orders</h3>
                <p>Track paid, shipped, delivered status.</p>
              </div>
            </article>
            <article className="shop-item-card">
              <div className="shop-item-content">
                <h3>Manage bookings</h3>
                <p>Accept, reject, complete appointments.</p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  )
}

export default VendorDashboardPage
