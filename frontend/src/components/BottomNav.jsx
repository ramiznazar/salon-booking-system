import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Home', icon: 'HM' },
  { to: '/search', label: 'Search', icon: 'SR' },
  { to: '/shop', label: 'Shop', icon: 'SP' },
  { to: '/bookings', label: 'Bookings', icon: 'BK' },
  { to: '/profile', label: 'Profile', icon: 'PF' },
]

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Customer navigation">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon" aria-hidden="true">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
