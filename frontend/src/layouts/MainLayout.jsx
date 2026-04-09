import { Link, Outlet } from 'react-router-dom'

function MainLayout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <span className="brand-wordmark">Lumina</span>
          </Link>
          <nav className="desktop-links" aria-label="Top navigation">
            <Link to="/">Home Page</Link>
            <Link to="/shop">Shop</Link>
            <Link to="/vendor/1">Vendor Profile</Link>
            <Link to="/bookings">Bookings/Appointments</Link>
          </nav>
          <div className="top-actions">
            <Link className="btn-light checkout-pill" to="/cart">
              Checkout
            </Link>
          </div>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
