import { useId } from 'react'

/**
 * TextArea Component
 * 
 * A multiline text input component supporting labels, character count limits
 * (as shown in the Figma report submission form, e.g. 0/500), helper text,
 * and validation error states.
 * 
 * Props:
 * - label: Text label displayed above the textarea
 * - id: Unique ID for accessibility (auto-generated if not supplied)
 * - name: Field name for form submissions
 * - value: Controlled value
 * - onChange: Change event handler
 * - placeholder: Placeholder text
 * - rows: Number of visible text lines (default: 4)
 * - maxLength: Maximum allowed characters (e.g., 500)
 * - showCount: Whether to display character counter (default: true if maxLength is set)
 * - helperText: Informational caption beneath the textarea
 * - error: Error message string
 * - required: boolean
 * - disabled: boolean
 * - className: Classes applied to outer wrapper
 * - textareaClassName: Classes applied directly to <textarea>
 */
export default function TextArea({
  label,
  id,
  name,
  value = '',
  onChange,
  placeholder = '',
  rows = 4,
  maxLength,
  showCount = true,
  helperText = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  textareaClassName = '',
  ...props
}) {
  const generatedId = useId()
  const textareaId = id || generatedId
  const helperId = `${textareaId}-helper`
  const errorId = `${textareaId}-error`

  const hasError = Boolean(error)
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {/* Label and Character Count Header */}
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
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
      </div>

      {/* Textarea Element Container */}
      <div className="relative">
        <textarea
          id={textareaId}
          name={name}
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          required={required}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          className={`
            w-full bg-white text-heading-text text-sm rounded-lg border transition-colors duration-150 p-3.5
            placeholder:text-content-muted placeholder:font-normal
            focus:outline-none focus:ring-2 resize-y
            ${disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-border-default' : ''}
            ${
              hasError
                ? 'border-severity-urgent focus:border-severity-urgent focus:ring-red-200'
                : 'border-border-default focus:border-emerald-brand focus:ring-emerald-100'
            }
            ${textareaClassName}
          `}
          {...props}
        />
      </div>

      {/* Footer Info: Error, Helper Text, and Character Counter */}
      <div className="flex items-center justify-between text-xs min-h-[1.25rem]">
        {hasError ? (
          <p id={errorId} className="text-severity-urgent font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-body-text">
            {helperText}
          </p>
        ) : (
          <span></span>
        )}

        {/* Character Count */}
        {showCount && maxLength && (
          <span
            className={`font-mono text-xs ml-auto ${
              currentLength >= maxLength ? 'text-severity-urgent font-bold' : 'text-content-muted'
            }`}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}

