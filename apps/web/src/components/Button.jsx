'use client'

/**
 * Button Component
 * 
 * A reusable button component with support for multiple visual variants,
 * sizes, loading states, and icon slots.
 * 
 * Props:
 * - children: Button text or elements
 * - variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' (default: 'primary')
 * - size: 'sm' | 'md' | 'lg' (default: 'md')
 * - fullWidth: boolean (default: false)
 * - disabled: boolean (default: false)
 * - loading: boolean (default: false)
 * - leftIcon: React node to render on the left
 * - rightIcon: React node to render on the right
 * - type: 'button' | 'submit' | 'reset' (default: 'button')
 * - className: additional Tailwind classes to apply
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  type = 'button',
  className = '',
  ...props
}) {
  // Base classes applied to all button variants
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Variant-specific styling (matching Figma design colors)
  const variantClasses = {
    primary:
      'bg-emerald-brand hover:bg-forest text-white focus:ring-emerald-brand shadow-sm active:bg-forest',
    secondary:
      'bg-white hover:bg-page-bg text-heading-text border border-border-default focus:ring-emerald-brand shadow-sm',
    outline:
      'bg-transparent hover:bg-soft-green text-emerald-brand border border-emerald-brand focus:ring-emerald-brand',
    danger:
      'bg-severity-urgent hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
    ghost:
      'bg-transparent hover:bg-mint-bg text-forest focus:ring-emerald-brand',
  }

  // Size variations
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-lg gap-2.5',
  }

  // Disabled and width modifier classes
  const stateClasses = disabled || loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  const widthClasses = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${stateClasses} ${widthClasses} ${className}`}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      )}

      {/* Optional Left Icon */}
      {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}

      {/* Button Content */}
      <span>{children}</span>

      {/* Optional Right Icon */}
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  )
}

