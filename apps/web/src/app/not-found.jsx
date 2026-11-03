'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-border-default max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold text-heading-text">Page Not Found</h1>
        <p className="text-body-text text-sm mt-2">
          The page you are looking for does not exist.
        </p>
        <div className="mt-6">
          <Button variant="primary" fullWidth onClick={() => router.push('/')}>
            Go to Home
          </Button>
        </div>
        <div className="mt-3">
          <Button variant="outline" fullWidth onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
        <p className="text-center text-xs text-body-text mt-6">
          <Link href="/" className="text-emerald-brand font-semibold hover:text-forest">
            EcoConnect Ekiti
          </Link>
        </p>
      </div>
    </div>
  )
}
