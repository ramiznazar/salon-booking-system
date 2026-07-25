import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'

const kpiIconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

function EarningsIcon() {
  return <svg {...kpiIconProps}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function TrendIcon() {
  return <svg {...kpiIconProps}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
}
function CalendarIcon() {
  return <svg {...kpiIconProps}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function ClockIcon() {
  return <svg {...kpiIconProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function ScissorsIcon() {
  return <svg {...kpiIconProps}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
}
function BagIcon() {
  return <svg {...kpiIconProps}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
}

const ICON_TONES = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue:    'bg-blue-100 text-blue-700',
  amber:   'bg-amber-100 text-amber-700',
  rose:    'bg-rose-100 text-rose-700',
  violet:  'bg-violet-100 text-violet-700',
  slate:   'bg-slate-100 text-slate-700',
}

function CardIcon({ tone = 'slate', children }) {
  return (
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ICON_TONES[tone]}`}>
      {children}
    </div>
  )
}

function StatCard({ label, value, hint, tone, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {hint && <p className="text-[11px] sm:text-xs text-slate-500 mt-1">{hint}</p>}
        </div>
        <CardIcon tone={tone}>{icon}</CardIcon>
      </div>
    </div>
  )
}

export default function VendorDashboard() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState(null)
  const [plan, setPlan] = useState(null)
  const [usage, setUsage] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/vendor/stats'),
      api.get('/vendor/plan'),
      api.get('/vendor/bookings?status=pending'),
    ]).then(([sRes, pRes, bRes]) => {
      setStats(sRes.data.data)
      setPlan(pRes.data.data?.active_plan)
      setUsage(pRes.data.data?.usage)
      setBookings(bRes.data.data?.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const vendor = JSON.parse(localStorage.getItem('app_user') || '{}')
  const currentLocale = i18n.language === 'it' ? 'it-IT' : 'en-US'

  const completeness = [
    { label: t('vendorDash.profileComplete'), done: true },
    { label: t('vendorDash.addedFirstService'), done: (stats?.services_count ?? 0) > 0 },
    { label: t('vendorDash.addedFirstProduct'), done: (stats?.products_count ?? 0) > 0 },
    { label: t('vendorDash.setAvailability'), done: false },
  ]
  const doneCount = completeness.filter(c => c.done).length

  if (loading) return <div className="text-center py-20 text-slate-400">{t('vendorDash.loading')}</div>

  const kpis = [
    { label: t('vendorDash.todayEarnings'),    value: `€${(stats?.today_earnings ?? 0).toFixed(2)}`,  hint: t('vendorDash.productServiceSales'), tone: 'emerald', icon: <EarningsIcon /> },
    { label: t('vendorDash.thisWeek'),         value: `€${(stats?.week_earnings ?? 0).toFixed(2)}`,   hint: t('vendorDash.weekRevenue'),         tone: 'blue',    icon: <TrendIcon /> },
    { label: t('vendorDash.bookingsToday'),    value: stats?.bookings_today ?? 0,                      hint: t('vendorDash.pendingAccepted'),     tone: 'amber',   icon: <CalendarIcon /> },
    { label: t('vendorDash.pendingApprovals'), value: stats?.pending_bookings ?? 0,                    hint: t('vendorDash.awaitingResponse'),    tone: 'rose',    icon: <ClockIcon /> },
    { label: t('vendorDash.activeServices'),   value: stats?.services_count ?? 0,                      hint: t('vendorDash.visibleCustomers'),    tone: 'violet',  icon: <ScissorsIcon /> },
    { label: t('vendorDash.activeProducts'),   value: stats?.products_count ?? 0,                      hint: t('vendorDash.inCatalogue'),         tone: 'slate',   icon: <BagIcon /> },
  ]

  return (
    <div className="space-y-5 lg:space-y-6">
      {/* Hero banner */}
      <div className="rounded-2xl p-4 sm:p-6 lg:p-7 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t('vendorDash.welcome', { name: vendor.name?.split(' ')[0] || 'Vendor' })}</h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">{t('vendorDash.performance')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">{t('vendorDash.today')}</p>
            <p className="text-sm sm:text-base font-semibold">{new Date().toLocaleDateString(currentLocale, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {kpis.map(k => <StatCard key={k.label} {...k} />)}
      </div>

      {/* Plan Usage + Getting Started */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Plan Usage */}
        {plan && usage && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">{t('vendorDash.planUsage')}</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{plan.plan?.name}</span>
            </div>
            {plan.plan?.max_services && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>{t('vendor.services')}</span>
                  <span className="font-semibold">{usage.services} / {plan.plan.max_services}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usage.services >= plan.plan.max_services ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, (usage.services / plan.plan.max_services) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {plan.plan?.max_products && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                  <span>{t('vendor.products')}</span>
                  <span className="font-semibold">{usage.products} / {plan.plan.max_products}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usage.products >= plan.plan.max_products ? 'bg-rose-500' : 'bg-indigo-500'}`}
                    style={{ width: `${Math.min(100, (usage.products / plan.plan.max_products) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3">
              {t('vendorDash.expires')} {new Date(plan.expires_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Getting Started checklist */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('vendorDash.gettingStarted')}</h3>
            <span className="text-xs font-bold text-indigo-600">{doneCount}/{completeness.length} {t('vendorDash.done')}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(doneCount / completeness.length) * 100}%` }} />
          </div>
          <div className="space-y-2.5">
            {completeness.map((c, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${c.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {c.done
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/></svg>
                  }
                </div>
                <span className={c.done ? 'text-slate-800' : 'text-slate-400'}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">{t('vendorDash.pendingBookings')}</h3>
            <Link to="/vendor/bookings" className="text-sm text-sky-600 hover:text-sky-700 no-underline">{t('vendorDash.viewAll')}</Link>
          </div>
          <div className="space-y-2">
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-slate-900 m-0">{b.user?.name || 'Customer'}</p>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">{b.service?.name} · {new Date(b.scheduled_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <Link to="/vendor/bookings" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 no-underline font-semibold transition-colors">
                  {t('vendorDash.review')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
