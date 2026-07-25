export function ActionIconButton({ label, onClick, className = '', disabled = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-md border-0 text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700 ${className}`}
    >
      {children}
    </button>
  )
}

const iconProps = {
  width: 14,
  height: 14,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function ApproveIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function RejectIcon() {
  return (
    <svg {...iconProps}>
      <path d="m18 6-12 12" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

export function BanIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 5.5 18.5 18.5" />
    </svg>
  )
}

export function DeleteIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

export function ActivateIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2v10" />
      <path d="M18.4 6.6a8 8 0 1 1-12.8 0" />
    </svg>
  )
}

export function DeactivateIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 2v10" />
      <path d="M18.4 6.6a8 8 0 1 1-12.8 0" />
      <path d="M4 4l16 16" />
    </svg>
  )
}

export function FlagIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 3v18" />
      <path d="M5 4h10l-2 4 2 4H5" />
    </svg>
  )
}

export function UnflagIcon() {
  return (
    <svg {...iconProps}>
      <path d="M5 3v18" />
      <path d="M5 4h10l-2 4 2 4H5" />
      <path d="M3 3l18 18" />
    </svg>
  )
}

export function ExpandIcon({ open = false }) {
  return (
    <svg {...iconProps}>
      {open ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  )
}
