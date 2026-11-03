import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  try {
    const { reference: rawRef } = await params
    const reference = String(rawRef || '').trim().toUpperCase()

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id,reference,status,category,severity,summary,location_text,photo_url,created_at')
      .eq('reference', reference)
      .single()

    if (reportError || !report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const { data: history } = await supabase
      .from('status_history')
      .select('new_status,note,created_at')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      reference: report.reference,
      status: report.status,
      category: report.category,
      severity: report.severity,
      summary: report.summary,
      location_text: report.location_text,
      photo_url: report.photo_url,
      created_at: report.created_at,
      status_history: history || [],
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
