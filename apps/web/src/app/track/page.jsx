'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button, SeverityChip, StatusBadge, TextInput } from '@/components'
import { SAMPLE_REPORTS, STATUS_FLOW } from '@/data/sampleReports'

const STATUS_STEPS = [
  { value: 'pending', label: 'Pending' },
  { value: 'forwarded', label: 'Forwarded' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

function TrackContent() {
  const searchParams = useSearchParams()
  const initialRef = searchParams.get('ref') || ''
  const [reference, setReference] = useState(initialRef)
  const [tracked, setTracked] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const fetchReport = async (refQuery) => {
    const normalized = refQuery.trim()
    if (!normalized) return

    setLoading(true)
    setSearched(true)
    setErrorMessage('')

    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(normalized)}`)
      if (res.ok) {
        const data = await res.json()
        setTracked(data)
        return
      }
    } catch {
      // API error, proceed to fallback
    }

    // Fallback to sample reports
    const sample = SAMPLE_REPORTS.find(
      (item) => item.reference.toLowerCase() === normalized.toLowerCase(),
    )
    if (sample) {
      setTracked(sample)
    } else {
      setTracked(null)
      setErrorMessage('No report found matching that reference number.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (initialRef) {
      fetchReport(initialRef)
    }
  }, [initialRef])

  const handleTrack = (event) => {
    event.preventDefault()
    fetchReport(reference)
  }

  const currentStepIndex = tracked
    ? STATUS_FLOW.indexOf(tracked.status)
    : -1

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-4">
        <Link href="/" className="text-sm text-body-text hover:text-emerald-brand font-medium">
          &larr; Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-default">
        <h1 className="text-2xl font-extrabold text-heading-text">Track a Report</h1>
        <p className="text-body-text text-sm mt-1">
          Enter your reference number to check the status.
        </p>

        <form onSubmit={handleTrack} className="mt-6 space-y-4">
          <TextInput
            label="Reference Number"
            placeholder="e.g. ECO-0001"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            helperText="Format is ECO- followed by digits."
            required
          />
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Track Report
          </Button>
        </form>
      </div>

      {tracked && (
        <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-border-default">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-heading-text">{tracked.reference}</h2>
            <StatusBadge status={tracked.status} />
          </div>
          {tracked.location_text && (
            <p className="text-sm text-body-text mt-1">{tracked.location_text}</p>
          )}

          {tracked.summary && (
            <p className="text-xs text-body-text mt-2 bg-slate-50 p-3 rounded-lg border border-border-default">
              {tracked.summary}
            </p>
          )}

          {tracked.photo_url && (
            <div className="mt-3">
              <img
                src={tracked.photo_url}
                alt="Report attachment"
                className="w-full h-40 object-cover rounded-lg border border-border-default"
              />
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-body-text font-medium">Severity:</span>
            <SeverityChip severity={tracked.severity} />
          </div>

          {/* Status timeline */}
          <div className="mt-6 space-y-0">
            {STATUS_STEPS.map((step, index) => {
              const state =
                index < currentStepIndex ? 'done' : index === currentStepIndex ? 'current' : 'todo'
              return (
                <div key={step.value} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        state === 'done'
                          ? 'bg-emerald-brand'
                          : state === 'current'
                            ? 'bg-emerald-brand ring-4 ring-mint-bg'
                            : 'bg-border-default'
                      }`}
                    />
                    {index < STATUS_STEPS.length - 1 && (
                      <span
                        className={`w-0.5 h-8 mt-1 ${
                          index < currentStepIndex ? 'bg-emerald-brand' : 'bg-border-default'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium pb-4 ${
                      state === 'current' || state === 'done'
                        ? 'text-heading-text'
                        : 'text-body-text'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {searched && !tracked && errorMessage && (
        <p className="text-xs text-severity-urgent text-center mt-4 font-medium">
          {errorMessage}
        </p>
      )}
    </main>
  )
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-page-bg">
      <Suspense
        fallback={
          <div className="max-w-md mx-auto px-4 py-16 text-center text-sm text-body-text">
            Loading...
          </div>
        }
      >
        <TrackContent />
      </Suspense>
    </div>
  )
}
