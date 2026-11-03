'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, SeverityChip, StatusBadge } from '@/components'
import { CATEGORIES, SAMPLE_REPORTS } from '@/data/sampleReports'

export default function AdminReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id

  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [forwardMessage, setForwardMessage] = useState('')
  const [loadingForward, setLoadingForward] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/admin/reports/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.report) {
            setReport(data.report)
            if (data.report.forward_message) {
              setForwardMessage(data.report.forward_message)
            }
            return
          }
        }
      } catch {
        // Fallback below
      }

      const sample = SAMPLE_REPORTS.find(
        (item) => item.id === id || item.reference.toLowerCase() === String(id).toLowerCase(),
      )
      setReport(sample || null)
      if (sample?.forward_message) {
        setForwardMessage(sample.forward_message)
      }
      setLoading(false)
    }

    fetchReport().finally(() => setLoading(false))
  }, [id])

  const categoryLabel = () =>
    CATEGORIES.find((item) => item.value === report?.category)?.label || report?.category

  const handleStatusUpdate = async (nextStatus) => {
    if (!report) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id || id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note: `Status updated to ${nextStatus}` }),
      })
      if (res.ok) {
        const data = await res.json()
        setReport((prev) => ({ ...prev, status: data.report?.status || nextStatus }))
      } else {
        // Optimistic UI update
        setReport((prev) => ({ ...prev, status: nextStatus }))
      }
    } catch {
      setReport((prev) => ({ ...prev, status: nextStatus }))
    } finally {
      setUpdating(false)
    }
  }

  const handleGenerateForwardMessage = async () => {
    if (!report) return
    setLoadingForward(true)
    try {
      const res = await fetch(`/api/admin/reports/${report.id || id}/forward-message`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        if (data.forward_message) {
          setForwardMessage(data.forward_message)
        }
      }
    } catch {
      // Keep existing
    } finally {
      setLoadingForward(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg">
        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-body-text shadow-sm border border-border-default">
            Loading report details...
          </div>
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-page-bg">
        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-border-default text-center">
            <h1 className="text-2xl font-extrabold text-heading-text">Report Not Found</h1>
            <p className="text-body-text text-sm mt-2">No report matches this reference or ID.</p>
            <div className="mt-6">
              <Button variant="primary" fullWidth onClick={() => router.push('/admin')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page-bg">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-body-text hover:text-emerald-brand font-medium"
          >
            &larr; Back to Dashboard
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading-text">
              {report.reference}
            </h1>
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Report details */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default mb-6">
          <h2 className="text-lg font-bold text-heading-text mb-4">Report Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs text-body-text font-medium">Category</dt>
              <dd className="text-sm font-semibold text-heading-text mt-1">{categoryLabel()}</dd>
            </div>
            <div>
              <dt className="text-xs text-body-text font-medium">Severity</dt>
              <dd className="text-sm font-semibold text-heading-text mt-1">
                <SeverityChip severity={report.severity} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-body-text font-medium">Location</dt>
              <dd className="text-sm font-semibold text-heading-text mt-1">{report.location_text}</dd>
            </div>
            <div>
              <dt className="text-xs text-body-text font-medium">Submitted</dt>
              <dd className="text-sm font-semibold text-heading-text mt-1">
                {String(report.createdAt || report.created_at || report.submittedAt || '').slice(0, 10)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-body-text font-medium">Description</dt>
              <dd className="text-sm text-body-text mt-1">{report.description}</dd>
            </div>
            {report.photo_url && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-body-text font-medium">Photo Attachment</dt>
                <dd className="mt-2">
                  <img
                    src={report.photo_url}
                    alt="Report photo"
                    className="max-h-64 rounded-xl border border-border-default object-cover"
                  />
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* AI analysis */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default mb-6">
          <h2 className="text-lg font-bold text-heading-text mb-4">AI Analysis</h2>
          <div className="bg-soft-green rounded-xl p-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-body-text font-medium">Category</dt>
                <dd className="text-sm font-semibold text-heading-text mt-1">{categoryLabel()}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Severity</dt>
                <dd className="text-sm font-semibold text-heading-text mt-1">
                  <SeverityChip severity={report.severity} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Location</dt>
                <dd className="text-sm font-semibold text-heading-text mt-1">{report.location_text}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Summary</dt>
                <dd className="text-sm text-body-text mt-1">{report.summary}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Language</dt>
                <dd className="text-sm font-semibold text-heading-text mt-1">{report.language}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Detected Issue</dt>
                <dd className="text-sm text-body-text mt-1">{report.detected_issue || 'None'}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Reason</dt>
                <dd className="text-sm text-body-text mt-1">{report.reason || report.ai_reason || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs text-body-text font-medium">Review Reason</dt>
                <dd className="text-sm text-body-text mt-1">{report.review_reason || 'None'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-body-text font-medium">Forward Message</dt>
                <dd className="text-sm text-body-text mt-1 whitespace-pre-wrap">
                  {forwardMessage || report.forward_message || 'No forward message drafted yet.'}
                </dd>
                {!forwardMessage && !report.forward_message && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 text-xs"
                    onClick={handleGenerateForwardMessage}
                    loading={loadingForward}
                  >
                    Draft Forward Message
                  </Button>
                )}
              </div>
            </dl>
            <div className="mt-4">
              <span
                className={`inline-flex items-center font-medium rounded-full border px-2.5 py-1 text-xs ${
                  report.needs_review
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    report.needs_review ? 'bg-amber-500' : 'bg-emerald-brand'
                  }`}
                />
                {report.needs_review ? 'Needs Review' : 'AI Analysis Ready'}
              </span>
            </div>
          </div>
        </section>

        {/* Status actions */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
          <h2 className="text-lg font-bold text-heading-text mb-4">Update Status</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {report.status === 'pending' && (
              <Button
                variant="secondary"
                onClick={() => handleStatusUpdate('forwarded')}
                loading={updating}
              >
                Forward Report
              </Button>
            )}
            {report.status === 'forwarded' && (
              <Button
                onClick={() => handleStatusUpdate('in_progress')}
                loading={updating}
              >
                Start Work
              </Button>
            )}
            {report.status === 'in_progress' && (
              <Button
                variant="primary"
                onClick={() => handleStatusUpdate('resolved')}
                loading={updating}
              >
                Mark Resolved
              </Button>
            )}
            {report.status === 'resolved' && (
              <p className="text-sm text-body-text">This report has been resolved.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
