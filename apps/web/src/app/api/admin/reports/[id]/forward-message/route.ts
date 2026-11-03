import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminFromRequest } from '@/lib/auth'
import { buildForwardMessage } from '@/lib/ai/forwardMessage'
import { SAMPLE_REPORTS } from '@/data/sampleReports'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { data: report, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && report) {
      if (report.forward_message) {
        return NextResponse.json({ forward_message: report.forward_message })
      }
      const built = buildForwardMessage({
        reference: report.reference,
        locationText: report.location_text,
        severity: report.severity,
        summary: report.summary,
      })
      return NextResponse.json({ forward_message: built.message })
    }

    const sample = SAMPLE_REPORTS.find((r) => r.id === id || r.reference.toLowerCase() === id.toLowerCase())
    if (sample) {
      return NextResponse.json({
        forward_message:
          sample.forward_message ||
          `Please attend to the community issue reported at ${sample.location_text}.`,
      })
    }

    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating forward message'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
