import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, SeverityChip, StatusBadge } from '../components'
import { SAMPLE_REPORTS, STATUSES, STATUS_LABELS } from '../data/sampleReports'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [reports, setReports] = useState(SAMPLE_REPORTS)
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/stats', { credentials: 'include' })
        if (response.ok) {
          setIsAuthenticated(true)
        }
      } catch {
        // Stay unauthenticated when the API is unreachable.
      } finally {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    const loadReports = async () => {
      try {
        const reportsResponse = await fetch('/api/admin/reports', { credentials: 'include' })
        const reportsData = await reportsResponse.json().catch(() => null)
        if (reportsResponse.ok && Array.isArray(reportsData?.items)) {
          setReports(reportsData.items)
        }
      } catch {
        // Keep the last known in-memory state when the API is unreachable.
      } finally {
        setIsLoading(false)
      }
    }
    loadReports()
  }, [isAuthenticated])

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-page-bg">
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default text-center">
            <p className="text-sm text-body-text">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const visibleReports = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: reports.filter((r) => r.status === status).length,
  }))

  return (
    <div className="min-h-screen bg-page-bg">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading-text">Admin Dashboard</h1>
            <p className="text-body-text text-sm sm:text-base mt-1">
              Review and route community reports in Ikole and Oye.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statusCounts.map((stat) => (
            <div
              key={stat.status}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border-default"
            >
              <p className="text-2xl font-extrabold text-heading-text">{stat.count}</p>
              <p className="text-xs text-body-text mt-1">{STATUS_LABELS[stat.status]}</p>
            </div>
          ))}
        </section>

        {/* Filters */}
        <section className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {['all', ...STATUSES].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                  filter === status
                    ? 'bg-emerald-brand text-white border-emerald-brand'
                    : 'bg-white text-body-text border border-border-default hover:bg-soft-green'
                }`}
              >
                {status === 'all' ? 'All' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </section>

        {/* Reports list */}
        <section className="space-y-4">
          {isLoading && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default text-center">
              <p className="text-sm text-body-text">Loading reports...</p>
            </div>
          )}
          {!isLoading && visibleReports.length === 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default text-center">
              <p className="text-sm text-body-text">No reports with this status.</p>
            </div>
          )}
          {visibleReports.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/admin/reports/${report.id}`)}
              className="w-full text-left bg-white rounded-2xl p-6 shadow-sm border border-border-default hover:border-emerald-brand transition-colors duration-150"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-heading-text">{report.reference}</span>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <SeverityChip severity={report.severity} />
                <span className="text-xs font-medium text-body-text capitalize">{report.category?.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-body-text mt-2">{report.location_text}</p>
              <p className="text-xs text-body-text mt-2">Submitted {String(report.createdAt || report.created_at || '').slice(0, 10)}</p>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}
