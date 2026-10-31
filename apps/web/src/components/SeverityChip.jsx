/**
 * SeverityChip Component
 * 
 * Displays the severity rating assigned to a community problem:
 * - Low: Emerald Green
 * - Medium: Amber
 * - High: Orange
 * - Urgent: Red
 * 
 * Props:
 * - severity: 'low' | 'medium' | 'high' | 'urgent' (case-insensitive)
 * - size: 'sm' | 'md' (default: 'md')
 * - showIcon: boolean (default: true)
 * - className: additional Tailwind classes
 */
export default function SeverityChip({
  severity = 'low',
  size = 'md',
  showIcon = true,
  className = '',
}) {
  // Normalize input string
  const normalized = String(severity).toLowerCase().trim()

  // Severity color maps and icons matching Figma specifications
  const configs = {
    low: {
      label: 'Low',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: (
        <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    medium: {
      label: 'Medium',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: (
        <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="4" />
        </svg>
      ),
    },
    high: {
      label: 'High',
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
      icon: (
        <svg className="w-3 h-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    urgent: {
      label: 'Urgent',
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: (
        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
  }

  const config = configs[normalized] || {
    label: severity,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: null,
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {showIcon && config.icon && (
        <span className="shrink-0" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  )
}

