/**
 * StatusBadge Component
 * 
 * Displays the current workflow status of a report following the Figma design:
 * - Pending: Amber
 * - Forwarded: Sky Blue
 * - In Progress: Purple
 * - Resolved: Emerald Green
 * 
 * Props:
 * - status: 'pending' | 'forwarded' | 'in_progress' | 'resolved' (case-insensitive)
 * - size: 'sm' | 'md' (default: 'md')
 * - showDot: boolean (default: true)
 * - className: additional Tailwind classes
 */
export default function StatusBadge({
  status = 'pending',
  size = 'md',
  showDot = true,
  className = '',
}) {
  // Normalize status string (e.g., 'in_progress' or 'In Progress' -> 'in_progress')
  const normalized = String(status).toLowerCase().trim().replace(/[\s-]+/g, '_')

  // Configurations for each status matching Figma specs
  const configs = {
    pending: {
      label: 'Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    forwarded: {
      label: 'Forwarded',
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
    },
    in_progress: {
      label: 'In Progress',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-brand',
    },
  }

  // Fallback to pending if unknown status is provided
  const config = configs[normalized] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bg} ${config.text} ${config.border}
        ${sizeClasses[size] || sizeClasses.md}
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  )
}

