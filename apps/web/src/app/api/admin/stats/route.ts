import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminFromRequest } from '@/lib/auth'
import { SAMPLE_REPORTS } from '@/data/sampleReports'

export async function GET(req: Request) {
  const admin = requireAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: allReports, error } = await supabase.from('reports').select('*')
    if (error) {
      return getFallbackStats()
    }
    const reports = allReports || []
    const byStatus = (status: string) => reports.filter((r) => r.status === status).length
    const bySeverity = (severity: string) => reports.filter((r) => r.severity === severity).length

    return NextResponse.json({
      total: reports.length,
      pending: byStatus('pending'),
      forwarded: byStatus('forwarded'),
      in_progress: byStatus('in_progress'),
      resolved: byStatus('resolved'),
      by_severity: {
        low: bySeverity('low'),
        medium: bySeverity('medium'),
        high: bySeverity('high'),
        urgent: bySeverity('urgent'),
      },
      by_category: {},
      urgent: bySeverity('urgent'),
      needs_human_review: reports.filter((r) => r.needs_review).length,
    })
  } catch {
    return getFallbackStats()
  }
}

function getFallbackStats() {
  const reports = SAMPLE_REPORTS
  const byStatus = (status: string) => reports.filter((r) => r.status === status).length
  const bySeverity = (severity: string) => reports.filter((r) => r.severity === severity).length

  return NextResponse.json({
    total: reports.length,
    pending: byStatus('pending'),
    forwarded: byStatus('forwarded'),
    in_progress: byStatus('in_progress'),
    resolved: byStatus('resolved'),
    by_severity: {
      low: bySeverity('low'),
      medium: bySeverity('medium'),
      high: bySeverity('high'),
      urgent: bySeverity('urgent'),
    },
    by_category: {},
    urgent: bySeverity('urgent'),
    needs_human_review: reports.filter((r) => r.needs_review).length,
  })
}
