'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components'

function ConfirmationCard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref') || 'ECO-0001'

  return (
    <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-border-default text-center">
      <span className="w-16 h-16 rounded-full bg-soft-green flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-emerald-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </span>

      <h1 className="text-2xl font-extrabold text-heading-text mt-5">Report Submitted</h1>
      <p className="text-body-text text-sm mt-2">
        Thanks for helping keep Ikole and Oye safe and clean. Our team and AI will review your report.
      </p>

      <div className="mt-6 bg-mint-bg rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-forest">Reference Number</span>
        <span className="text-sm font-bold text-forest">{reference}</span>
      </div>

      <p className="text-xs text-body-text mt-4">
        Save this reference to track the status of your report.
      </p>

      <div className="mt-6 space-y-3">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={() => router.push(`/track?ref=${encodeURIComponent(reference)}`)}
        >
          Track this Report
        </Button>
        <Button variant="outline" fullWidth onClick={() => router.push('/report')}>
          Report Another Problem
        </Button>
      </div>

      <p className="text-xs text-body-text mt-6">
        <Link href="/" className="text-emerald-brand font-semibold hover:text-forest">
          Back to Home
        </Link>
      </p>
    </div>
  )
}

export default function ReportConfirmationPage() {
  return (
    <div className="min-h-screen bg-page-bg">
      <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl p-8 text-center text-sm text-body-text shadow-sm border border-border-default">
              Loading confirmation...
            </div>
          }
        >
          <ConfirmationCard />
        </Suspense>
      </main>
    </div>
  )
}
