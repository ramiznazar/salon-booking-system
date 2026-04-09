import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import CartPage from './pages/CartPage'
import HomePage from './pages/HomePage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import ServiceDetailsPage from './pages/ServiceDetailsPage'
import ShopPage from './pages/ShopPage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import VendorPage from './pages/VendorPage'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vendor/:vendorId" element={<VendorPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
        <Route path="/booking/:serviceId" element={<BookingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
