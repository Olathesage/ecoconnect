'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components'

const features = [
  {
    title: 'AI-Powered Triage',
    text: 'Gemma 4 classifies every report and drafts routing messages for the responsible office.',
  },
  {
    title: 'Photo & Location',
    text: 'Reports include photos, landmarks and location context from Ikole and Oye.',
  },
  {
    title: 'Track to Resolution',
    text: 'Residents follow each report from pending through forwarded, in progress and resolved.',
  },
]

export default function Landing() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <header className="bg-white border-b border-border-default">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-lg bg-emerald-brand flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.4 8.4l2.1 2.1M18.4 5.6l-2.1 2.1m0 10.6l-2.1 2.1"
                />
              </svg>
            </span>
            <span className="text-lg font-extrabold text-heading-text">EcoConnect Ekiti</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push('/track')}>
              Track a Report
            </Button>
            <Button size="sm" onClick={() => router.push('/report')}>
              Report a Problem
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-soft-green px-3 py-1 rounded-full text-emerald-brand text-xs font-semibold mb-4">
            <span>Community Reporting</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-heading-text">
            Report community problems in Ikole and Oye
          </h1>
          <p className="text-body-text text-base mt-4 max-w-xl">
            EcoConnect Ekiti helps residents of Ikole and Oye report community
            problems with text, photos and location, and follow them to resolution.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Button
              size="lg"
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              }
              onClick={() => router.push('/report')}
            >
              Report a Problem
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/track')}>
              Track a Report
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border-default">
          <img
            src="/hero-image.jpg"
            alt="Community Hero"
            className="w-full max-h-[400px] object-cover rounded-xl shadow-md"
          />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border-default"
            >
              <h2 className="text-lg font-bold text-heading-text">{feature.title}</h2>
              <p className="text-sm text-body-text mt-2">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-br from-emerald-brand to-forest rounded-2xl p-8 sm:p-10 text-white">
          <h2 className="text-2xl font-extrabold text-white">See something that needs fixing?</h2>
          <p className="text-soft-green text-sm mt-2 max-w-xl">
            Submit a report with a photo and location. Our team and AI triage it quickly.
          </p>
          <div className="mt-6">
            <Button variant="secondary" size="lg" onClick={() => router.push('/report')}>
              Report a Problem
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-body-text pb-10">
        EcoConnect Ekiti • Ikole and Oye, Ekiti
      </footer>
    </div>
  )
}
