import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher({ dark = false }) {
  const { i18n } = useTranslation()
  const current = i18n.language === 'en' ? 'en' : 'it'

  const toggle = () => {
    const next = current === 'it' ? 'en' : 'it'
    i18n.changeLanguage(next)
    localStorage.setItem('beauty_lang', next)
  }

  return (
    <button
      onClick={toggle}
      title={current === 'it' ? 'Switch to English' : 'Passa all\'italiano'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '0.25rem 0.6rem',
        borderRadius: 999,
        border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e5e7eb',
        background: dark ? 'rgba(255,255,255,0.08)' : '#f9fafb',
        color: dark ? '#e5e7eb' : '#374151',
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.04em',
        lineHeight: 1,
        transition: 'background 0.15s, border-color 0.15s',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <span style={{ opacity: current === 'it' ? 1 : 0.45 }}>IT</span>
      <span style={{ opacity: 0.35, fontSize: 10, fontWeight: 400 }}>|</span>
      <span style={{ opacity: current === 'en' ? 1 : 0.45 }}>EN</span>
    </button>
  )
}
