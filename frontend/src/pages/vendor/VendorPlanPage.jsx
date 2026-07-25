import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../api/axios'
import { getLocalizedArray, getLocalizedField } from '../../utils/localize'

function CreditCardIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}

function UsageBar({ label, used, max, color = 'bg-indigo-500' }) {
  const { t } = useTranslation()
  const pct = max ? Math.min(100, (used / max) * 100) : 0
  const isNearLimit = max && used >= max * 0.8
  const isAtLimit = max && used >= max
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${isAtLimit ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-slate-700'}`}>
          {used} / {max ?? '∞'}
          {max && <span className="font-normal text-slate-400 ml-1">({Math.max(0, max - used)} {t('vendorPlan.remaining', 'remaining')})</span>}
        </span>
      </div>
      {max && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isAtLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {!max && <p className="text-xs text-emerald-600 font-medium">{t('vendorPlan.unlimited', 'Unlimited')}</p>}
    </div>
  )
}

export default function VendorPlanPage() {
  const { t, i18n } = useTranslation()
  const [planData, setPlanData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [boostTiers, setBoostTiers] = useState([])

  useEffect(() => {
    Promise.all([
      api.get('/vendor/plan'),
      api.get('/vendor/me'),
      api.get('/boost-tiers'),
    ]).then(([pRes, _mRes, btRes]) => {
      setPlanData(pRes.data.data)
      setHistory([])
      setBoostTiers(btRes.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-slate-400 text-sm">{t('common.loading')}</div>

  const activePlan = planData?.active_plan
  const usage = planData?.usage
  const plan = activePlan?.plan

  const daysLeft = activePlan
    ? Math.max(0, Math.ceil((new Date(activePlan.expires_at) - new Date()) / 86400000))
    : null

  if (!activePlan || !plan) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('vendorPlan.title', 'Plan & Billing')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('vendorPlan.manageSubscription', 'Manage your subscription')}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CreditCardIcon />
          </div>
          <h3 className="text-base font-bold text-slate-900">{t('vendorPlan.noActivePlan', 'No Active Plan')}</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5">{t('vendorPlan.noActivePlanDesc', 'You need an active plan to add services and products.')}</p>
          <Link to="/plans" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl no-underline transition-colors">
            {t('vendorPlan.browsePlans', 'Browse Plans →')}
          </Link>
        </div>
      </div>
    )
  }

  const expiryDate = new Date(activePlan.expires_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('vendorPlan.title', 'Plan & Billing')}</h2>
          <p className="text-sm text-slate-500 mt-0.5">{t('vendorPlan.subtitle', 'Manage your subscription and boost settings')}</p>
        </div>
        <Link
          to="/plans"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl no-underline transition-colors"
        >
          {t('vendorPlan.upgradePlan', 'Upgrade Plan →')}
        </Link>
      </div>

      {/* Current plan card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorPlan.currentPlan', 'Current Plan')}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{getLocalizedField(plan, 'name', i18n.language)}</h3>
            <p className="text-sm text-slate-500 mt-0.5">€{parseFloat(plan.price).toFixed(2)} / {plan.duration_days} days</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${daysLeft <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {daysLeft <= 0 ? t('vendorPlan.expired', 'Expired') : t('vendorPlan.daysLeft', '{{count}} days left', { count: daysLeft })}
            </span>
            <p className="text-xs text-slate-400 mt-1.5">{t('vendorDash.expires')} {expiryDate}</p>
          </div>
        </div>

        {/* Features */}
        {getLocalizedArray(plan, 'features', i18n.language)?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {getLocalizedArray(plan, 'features', i18n.language).map((f, i) => (
              <span key={i} className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">{f}</span>
            ))}
          </div>
        )}

        {/* Usage */}
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{t('vendorDash.planUsage')}</p>
          <UsageBar label={t('vendor.services')} used={usage?.services ?? 0} max={plan.max_services} color="bg-indigo-500" />
          <UsageBar label={t('vendor.products')} used={usage?.products ?? 0} max={plan.max_products} color="bg-violet-500" />
        </div>
      </div>

      {/* Boost tiers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{t('vendorPlan.boostTiers', 'Boost Tiers')}</p>
            <p className="text-xs text-slate-500">{t('vendorPlan.boostTiersDesc', 'Available boost packages to get your services & products on the homepage')}</p>
          </div>
        </div>
        {boostTiers.filter(t => t.is_active).length === 0 ? (
          <p className="text-sm text-slate-400">{t('vendorPlan.noBoostTiers', 'No boost tiers configured yet. Contact admin.')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {boostTiers.filter(t => t.is_active).map(t => (
              <div key={t.id} className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <p className="text-sm font-bold text-slate-800">{t.name}</p>
                </div>
                {t.description && <p className="text-xs text-slate-400">{t.description}</p>}
                <p className="text-lg font-bold text-amber-700 mt-1">€{parseFloat(t.price).toFixed(2)}</p>
                <p className="text-xs text-amber-600 font-medium">{t.duration_days} days active</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-slate-400 mt-4">Go to <Link to="/vendor/services" className="text-indigo-600 hover:underline">Services</Link> or <Link to="/vendor/products" className="text-indigo-600 hover:underline">Products</Link> and click Boost to choose a tier.</p>
      </div>

      {/* Upgrade CTA */}
      {(plan.max_services !== null || plan.max_products !== null) && (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
          <p className="text-sm font-semibold opacity-80">{t('vendorPlan.needMore', 'Need more?')}</p>
          <h3 className="text-lg font-bold mt-1">{t('vendorPlan.upgradeDesc', 'Upgrade your plan for higher limits & lower boost prices')}</h3>
          <Link
            to="/plans"
            className="inline-block mt-4 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold px-5 py-2.5 rounded-xl no-underline transition-colors"
          >
            {t('vendorPlan.viewAllPlans', 'View All Plans')}
          </Link>
        </div>
      )}
    </div>
  )
}
