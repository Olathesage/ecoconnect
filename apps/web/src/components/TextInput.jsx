'use client'

import { useId } from 'react'

/**
 * TextInput Component
 * 
 * An accessible form input field with support for labels, helper text,
 * error messages, and leading/trailing icon/element slots.
 * 
 * Props:
 * - label: Text label displayed above the input
 * - id: Input id attribute (auto-generated if omitted)
 * - name: Name attribute for forms
 * - type: HTML input type ('text', 'email', 'password', 'search', etc. Default: 'text')
 * - value: Controlled input value
 * - onChange: Change event handler
 * - placeholder: Placeholder text
 * - helperText: Informational caption beneath the input
 * - error: Error message string (activates error styling and ARIA attributes)
 * - leftIcon: React icon rendered inside the left side of the input
 * - rightElement: React component or button rendered inside the right side
 * - required: boolean (adds required asterisk and HTML required attribute)
 * - disabled: boolean
 * - className: Classes applied to the outer container
 * - inputClassName: Classes applied directly to the <input> element
 */
export default function TextInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  helperText = '',
  error = '',
  leftIcon = null,
  rightElement = null,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`

  // Decide if there's an error message
  const hasError = Boolean(error)

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-heading-text flex items-center gap-1"
        >
          <span>{label}</span>
          {required && (
            <span className="text-severity-urgent font-bold" title="Required field">
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative flex items-center">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-content-muted">
            {leftIcon}
          </div>
        )}

        {/* HTML Input Element */}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`
            w-full bg-white text-heading-text text-sm rounded-lg border transition-colors duration-150
            placeholder:text-content-muted placeholder:font-normal
            focus:outline-none focus:ring-2
            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-border-default' : ''}
            ${
              hasError
                ? 'border-severity-urgent focus:border-severity-urgent focus:ring-red-200'
                : 'border-border-default focus:border-emerald-brand focus:ring-emerald-100'
            }
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightElement ? 'pr-28' : 'pr-3.5'}
            py-2.5
            ${inputClassName}
          `}
          {...props}
        />

        {/* Right Element (e.g. 'Use My Location' button or visibility toggle) */}
        {rightElement && (
          <div className="absolute right-2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p id={errorId} className="text-xs text-severity-urgent font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}

      {/* Helper Text (shown only when no error) */}
      {!hasError && helperText && (
        <p id={helperId} className="text-xs text-body-text">
          {helperText}
        </p>
      )}
    </div>
  )
}

