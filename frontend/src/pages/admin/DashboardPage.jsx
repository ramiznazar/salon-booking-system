import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

function formatCurrency(value) {
  return `€${Number(value || 0).toFixed(2)}`
}

const kpiIconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

function UsersIcon() {
  return (
    <svg {...kpiIconProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  )
}

function VendorIcon() {
  return (
    <svg {...kpiIconProps}>
      <path d="M3 10h18" />
      <path d="M5 10v9h14v-9" />
      <path d="M7 10V6h10v4" />
      <path d="M12 14v5" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg {...kpiIconProps}>
      <path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" />
      <path d="m3 8 9 6 9-6" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg {...kpiIconProps}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </svg>
  )
}

function RevenueIcon() {
  return (
    <svg {...kpiIconProps}>
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function CardPaymentIcon() {
  return (
    <svg {...kpiIconProps}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  )
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function CardIcon({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    rose: 'bg-rose-100 text-rose-700',
  }

  return (
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tones[tone] || tones.slate}`}>
      {children}
    </div>
  )
}

function StatCard({ label, value, hint, icon, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">{hint}</p>
        </div>
        <CardIcon tone={tone}>{icon}</CardIcon>
      </div>
    </div>
  )
}

function BarsChart({ title, subtitle, values = [], colorClass = 'bg-blue-500' }) {
  const max = Math.max(...values, 1)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      </div>
      <div className="flex items-end gap-2 h-36 sm:h-40">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex-1 flex flex-col items-center gap-2">
            <div className="h-28 sm:h-32 w-full bg-slate-100 rounded-md flex items-end">
              <div
                className={`w-full rounded-md ${colorClass}`}
                style={{ height: `${Math.max((value / max) * 100, 6)}%` }}
                title={`${value}`}
              />
            </div>
            <span className="text-[10px] text-slate-500">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutChart({ title, leftLabel, leftValue, rightLabel, rightValue }) {
  const total = leftValue + rightValue || 1
  const leftPercent = Math.round((leftValue / total) * 100)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 flex items-center gap-4 sm:gap-5">
        <div
          className="h-24 w-24 sm:h-28 sm:w-28 rounded-full"
          style={{
            background: `conic-gradient(#0ea5e9 ${leftPercent}%, #f59e0b ${leftPercent}% 100%)`,
          }}
        >
          <div className="h-full w-full rounded-full scale-75 bg-white flex items-center justify-center">
            <span className="text-xs font-semibold text-slate-700">{leftPercent}%</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-600">{leftLabel}:</span>
            <span className="font-semibold text-slate-900">{leftValue}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">{rightLabel}:</span>
            <span className="font-semibold text-slate-900">{rightValue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((res) => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-500">{t('common.loading')}</div>
  if (!data) return <div className="text-center py-20 text-red-500">{t('adminDash.loadFailed', 'Failed to load dashboard data.')}</div>

  const kpis = [
    {
      label: t('adminDash.totalUsers', 'Total Users'),
      value: formatNumber(data.total_users),
      hint: `${formatNumber(data.total_customers)} ${t('adminDash.customers', 'customers')}`,
      tone: 'blue',
      icon: <UsersIcon />,
    },
    {
      label: t('adminDash.vendors', 'Vendors'),
      value: formatNumber(data.total_vendors),
      hint: `${formatNumber(data.pending_vendors)} ${t('adminDash.pendingApprovals', 'pending approvals')}`,
      tone: 'amber',
      icon: <VendorIcon />,
    },
    {
      label: t('adminDash.orders', 'Orders'),
      value: formatNumber(data.total_orders),
      hint: `${formatNumber(data.total_products)} ${t('adminDash.productsLive', 'products live')}`,
      tone: 'slate',
      icon: <OrderIcon />,
    },
    {
      label: t('adminDash.bookings', 'Bookings'),
      value: formatNumber(data.total_bookings),
      hint: `${formatNumber(data.total_services)} ${t('adminDash.servicesAvail', 'services available')}`,
      tone: 'emerald',
      icon: <CalendarIcon />,
    },
    {
      label: t('adminDash.revenue', 'Revenue'),
      value: formatCurrency(data.total_revenue),
      hint: t('adminDash.grossSales', 'Gross platform sales'),
      tone: 'emerald',
      icon: <RevenueIcon />,
    },
    {
      label: t('admin.commissions'),
      value: formatCurrency(data.total_commissions),
      hint: t('adminDash.platformEarnings', 'Platform earnings'),
      tone: 'rose',
      icon: <CardPaymentIcon />,
    },
  ]

  const orderTrend = [...(data.recent_orders || [])]
    .slice(0, 6)
    .reverse()
    .map((order) => Number(order.total || 0))

  const bookingTrend = [...(data.recent_bookings || [])]
    .slice(0, 6)
    .reverse()
    .map((booking) => (booking.status === 'confirmed' || booking.status === 'completed' ? 2 : 1))

  return (
    <div className="space-y-5 lg:space-y-6">
      <div className="rounded-2xl p-4 sm:p-6 lg:p-7 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t('adminDash.title', 'Admin Command Center')}</h2>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">{t('adminDash.subtitle', 'Realtime marketplace performance and moderation overview')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-300">Today</p>
            <p className="text-sm sm:text-base font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <BarsChart
          title={t('adminDash.revenueMovement', 'Revenue Movement')}
          subtitle={t('adminDash.last6Orders', 'Last 6 orders value index')}
          values={orderTrend.length ? orderTrend : [0, 0, 0, 0, 0, 0]}
          colorClass="bg-sky-500"
        />
        <BarsChart
          title={t('adminDash.bookingActivity', 'Booking Activity')}
          subtitle={t('adminDash.recentMomentum', 'Recent booking momentum')}
          values={bookingTrend.length ? bookingTrend : [0, 0, 0, 0, 0, 0]}
          colorClass="bg-emerald-500"
        />
        <DonutChart
          title={t('adminDash.revenueVsCommission', 'Revenue vs Commission')}
          leftLabel={t('adminDash.revenue', 'Revenue')}
          leftValue={Math.round(Number(data.total_revenue || 0))}
          rightLabel={t('admin.commissions')}
          rightValue={Math.round(Number(data.total_commissions || 0))}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('adminDash.recentOrders', 'Recent Orders')}</h3>
            <Link to="/admin/orders" className="text-sm text-sky-600 hover:text-sky-700 no-underline">
              {t('common.viewAll', 'View all →')}
            </Link>
          </div>
          {data.recent_orders?.length > 0 ? (
            <div className="space-y-2.5">
              {data.recent_orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Order #{o.id}</p>
                    <p className="text-xs text-slate-500">{o.user?.name || 'Customer'} → {o.vendor?.name || 'Vendor'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(o.total)}</p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      o.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">{t('adminDash.noRecentOrders', 'No recent orders')}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('adminDash.pendingVendors', 'Pending Vendors')}</h3>
            <Link to="/admin/vendors" className="text-sm text-sky-600 hover:text-sky-700 no-underline">
              {t('adminDash.openQueue', 'Open queue →')}
            </Link>
          </div>
          {data.pending_vendor_list?.length > 0 ? (
            <div className="space-y-2.5">
              {data.pending_vendor_list.map((vendor) => (
                <div key={vendor.id} className="rounded-xl border border-slate-200 px-3 py-2.5">
                  <p className="text-sm font-medium text-slate-900">{vendor.name}</p>
                  <p className="text-xs text-slate-500">{vendor.email}</p>
                  <p className="text-xs text-slate-400 mt-1">{vendor.city} • {new Date(vendor.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">{t('adminDash.noApprovals', 'No pending approvals')}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('adminDash.recentBookings', 'Recent Bookings')}</h3>
            <Link to="/admin/bookings" className="text-sm text-sky-600 hover:text-sky-700 no-underline">{t('common.viewAll', 'View all →')}</Link>
          </div>
          {data.recent_bookings?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {data.recent_bookings.map((booking) => (
                <div key={booking.id} className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
                  <p className="text-sm font-semibold text-slate-900">{booking.service?.name || 'Service'}</p>
                  <p className="text-xs text-slate-500 mt-1">{booking.user?.name || 'Customer'} @ {booking.vendor?.name || 'Vendor'}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString() : '-'}</span>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      booking.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-200 text-slate-700'
                    }`}>{booking.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">{t('adminDash.noBookings', 'No bookings yet')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
