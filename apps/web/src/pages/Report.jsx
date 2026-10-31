import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, TextArea, TextInput } from '../components'
import { CATEGORIES } from '../data/sampleReports'

const initialForm = {
  location: '',
  description: '',
}

const severityOptions = [
  { value: 'low', label: 'Low', selected: 'bg-emerald-brand text-white border-2 border-emerald-brand' },
  { value: 'medium', label: 'Medium', selected: 'bg-amber-500 text-white border-2 border-amber-500' },
  { value: 'high', label: 'High', selected: 'bg-orange-600 text-white border-2 border-orange-600' },
  { value: 'urgent', label: 'Urgent', selected: 'bg-red-600 text-white border-2 border-red-600' },
]

const inactiveSeverity =
  'bg-white text-body-text border border-border-default hover:bg-soft-green'

export default function Report() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [hasError, setHasError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormError('')
    setHasError(true)
    try {
      const formData = new FormData()
      formData.append('description', form.description)
      formData.append('locationText', form.location)
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setFormError(data.error || 'Failed to submit the report. Please try again.')
        return
      }

      navigate('/report/success', { state: { reference: data.reference } })
    } catch {
      setFormError('Unable to reach the EcoConnect server. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-body-text hover:text-emerald-brand font-medium"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-heading-text mt-2">
            Report a Problem
          </h1>
          <p className="text-body-text text-sm sm:text-base mt-1">
            Tell us what is happening in Ikole or Oye. Fields marked with an asterisk are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <h2 className="text-lg font-bold text-heading-text mb-4">Describe the Problem</h2>
            <TextArea
              label="Describe the Problem"
              placeholder="Give a clear and detailed description of what you observed..."
              value={form.description}
              onChange={updateField('description')}
              maxLength={500}
              rows={4}
              required
              helperText="Include landmarks and severity details to help our team respond quickly."
              error={hasError && form.description.trim().length < 10 ? 'Description must be at least 10 characters.' : ''}
            />
          </section>

          {/* Category */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <h2 className="text-lg font-bold text-heading-text mb-4">Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((categoryOption) => (
                <button
                  key={categoryOption.value}
                  type="button"
                  onClick={() => setCategory(categoryOption.value)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                    category === categoryOption.value
                      ? 'bg-emerald-brand text-white border-emerald-brand'
                      : 'bg-white text-body-text border border-border-default hover:bg-soft-green'
                  }`}
                >
                  {categoryOption.label}
                </button>
              ))}
            </div>
          </section>

          {/* Severity */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <h2 className="text-lg font-bold text-heading-text mb-4">Severity</h2>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSeverity(option.value)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                    severity === option.value ? option.selected : inactiveSeverity
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <h2 className="text-lg font-bold text-heading-text mb-4">Location</h2>
            <TextInput
              label="Location"
              placeholder="e.g. Ikole-Ekiti, behind Unity Primary School"
              value={form.location}
              onChange={updateField('location')}
              required
              helperText="Enter the location of the problem or landmark."
              error={hasError && !form.location.trim() ? 'Please provide a valid location in Ikole or Oye.' : ''}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              rightElement={
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-emerald-brand hover:text-forest"
                  onClick={() => setForm((prev) => ({ ...prev, location: 'Ikole-Ekiti (GPS Detected)' }))}
                >
                  Use My Location
                </Button>
              }
            />
          </section>

          {/* Photo */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <h2 className="text-lg font-bold text-heading-text mb-4">Photo</h2>
            <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default bg-soft-green px-4 py-8 text-center cursor-pointer">
              <svg className="w-6 h-6 text-emerald-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l3-3h6l3 3v6H7v-6z" />
                <circle strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a3 3 0 006 0" />
              </svg>
              <span className="text-sm font-medium text-heading-text mt-3">Add a photo</span>
              <span className="text-xs text-body-text mt-1">PNG, JPG or GIF up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0]
                  if (file) {
                    setPhotoFile(file)
                    setPhoto({ name: file.name, url: URL.createObjectURL(file) })
                  }
                }}
              />
            </label>
            {photo && (
              <div className="mt-4">
                <img
                  src={photo.url}
                  alt="Report attachment preview"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-body-text truncate">{photo.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-severity-urgent"
                    onClick={() => {
                      setPhoto(null)
                      setPhotoFile(null)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
            <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
              Submit Report
            </Button>
            {formError && <p className="text-xs text-severity-urgent font-medium text-center mt-3">{formError}</p>}
            <p className="text-xs text-body-text text-center mt-3">
              Your report will be reviewed by our team and analysed by AI before routing.
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
