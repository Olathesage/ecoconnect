import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, TextInput } from '../components'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError('')
    setHasError(true)
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) {
        setFormError(data.error || 'Invalid admin PIN.')
        return
      }
      navigate('/admin')
    } catch {
      setFormError('Unable to reach the EcoConnect server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-default">
          <h1 className="text-2xl font-extrabold text-heading-text">Admin Login</h1>
          <p className="text-body-text text-sm mt-1">
            Sign in with your admin account to review community reports.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <TextInput
              label="Email"
              type="email"
              name="email"
              placeholder="admin@ekiti.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Enter the admin account email."
            />
            <TextInput
              label="PIN"
              type="password"
              name="pin"
              placeholder="Enter your PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              helperText="Enter your admin PIN to continue."
              error={hasError && !pin.trim() ? 'Please enter your admin PIN.' : ''}
            />
            {formError && <p className="text-xs text-severity-urgent font-medium">{formError}</p>}
            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              Sign In
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
