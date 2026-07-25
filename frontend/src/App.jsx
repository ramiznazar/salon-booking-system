import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import VendorLayout from './layouts/VendorLayout'
import { AuthProvider } from './context/AuthContext'
import { AppAuthProvider } from './context/AppAuthContext'
import { CartProvider } from './context/CartContext'

import BookingPage from './pages/BookingPage'
import BookingsPage from './pages/BookingsPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import MyOrdersPage from './pages/MyOrdersPage'
import PlansPage from './pages/PlansPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SearchPage from './pages/SearchPage'
import ServiceDetailsPage from './pages/ServiceDetailsPage'
import ShopPage from './pages/ShopPage'
import VendorPage from './pages/VendorPage'

import AdminLoginPage from './pages/admin/LoginPage'
import AdminDashboardPage from './pages/admin/DashboardPage'
import AdminVendorsPage from './pages/admin/VendorsPage'
import AdminUsersPage from './pages/admin/UsersPage'
import AdminBookingsPage from './pages/admin/BookingsPage'
import AdminOrdersPage from './pages/admin/OrdersPage'
import AdminProductsPage from './pages/admin/ProductsPage'
import AdminServicesPage from './pages/admin/ServicesPage'
import AdminReviewsPage from './pages/admin/ReviewsPage'
import AdminCommissionsPage from './pages/admin/CommissionsPage'
import AdminAuditLogsPage from './pages/admin/AuditLogsPage'
import AdminPlansPage from './pages/admin/PlansPage'
import AdminBoostTiersPage from './pages/admin/BoostTiersPage'
import ProductCategoriesPage from './pages/admin/ProductCategoriesPage'
import ServiceCategoriesPage from './pages/admin/ServiceCategoriesPage'
import AdminNotificationsPage from './pages/admin/NotificationsPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'

import VendorLoginPage from './pages/vendor/VendorLoginPage'
import VendorRegisterPage from './pages/vendor/VendorRegisterPage'
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorServicesPage from './pages/vendor/VendorServicesPage'
import VendorProductsPage from './pages/vendor/VendorProductsPage'
import VendorBookingsPage from './pages/vendor/VendorBookingsPage'
import VendorOrdersPage from './pages/vendor/VendorOrdersPage'
import VendorOrderDetailsPage from './pages/vendor/VendorOrderDetailsPage'
import VendorAvailabilityPage from './pages/vendor/VendorAvailabilityPage'
import VendorProfilePage from './pages/vendor/VendorProfilePage'
import VendorPlanPage from './pages/vendor/VendorPlanPage'
import VendorChatPage from './pages/vendor/VendorChatPage'
import VendorNotificationsPage from './pages/vendor/VendorNotificationsPage'

function App() {
  return (
    <AppAuthProvider>
      <CartProvider>
      <AuthProvider>
        <Routes>
          {/* Public vendor auth (no layout) */}
          <Route path="/vendor/login" element={<VendorLoginPage />} />
          <Route path="/vendor/register" element={<VendorRegisterPage />} />

          {/* Customer-facing routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/vendor/:vendorId" element={<VendorPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/products/:productId" element={<ProductDetailsPage />} />
            <Route path="/services/:serviceId" element={<ServiceDetailsPage />} />
            <Route path="/booking/:serviceId" element={<BookingPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Route>

          {/* Vendor panel routes */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="services" element={<VendorServicesPage />} />
            <Route path="products" element={<VendorProductsPage />} />
            <Route path="bookings" element={<VendorBookingsPage />} />
            <Route path="orders" element={<VendorOrdersPage />} />
            <Route path="orders/:orderId" element={<VendorOrderDetailsPage />} />
            <Route path="availability" element={<VendorAvailabilityPage />} />
            <Route path="plan" element={<VendorPlanPage />} />
            <Route path="profile" element={<VendorProfilePage />} />
            <Route path="chat" element={<VendorChatPage />} />
            <Route path="chat/:conversationId" element={<VendorChatPage />} />
            <Route path="notifications" element={<VendorNotificationsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="vendors" element={<AdminVendorsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="commissions" element={<AdminCommissionsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="boost-tiers" element={<AdminBoostTiersPage />} />
            <Route path="product-categories" element={<ProductCategoriesPage />} />
            <Route path="service-categories" element={<ServiceCategoriesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </CartProvider>
    </AppAuthProvider>
  )
}

export default App
