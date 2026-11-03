import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { requireAdminFromRequest } from '@/lib/auth'
import { SAMPLE_REPORTS } from '@/data/sampleReports'

const updateReportSchema = z.object({
  status: z.enum(['pending', 'forwarded', 'in_progress', 'resolved']),
  note: z.string().max(1000).optional(),
})

export async function GET(
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

    if (error || !report) {
      // Check fallback sample data
      const sample = SAMPLE_REPORTS.find((r) => r.id === id || r.reference.toLowerCase() === id.toLowerCase())
      if (sample) {
        return NextResponse.json({
          report: {
            ...sample,
            status_history: [
              {
                id: '1',
                report_id: sample.id,
                old_status: null,
                new_status: sample.status,
                updated_by: 'system',
                note: 'Report submitted',
                created_at: sample.submittedAt,
              },
            ],
          },
        })
      }
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    const { data: history } = await supabase
      .from('status_history')
      .select('id,report_id,old_status,new_status,updated_by,note,created_at')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      report: {
        ...report,
        status_history: history || [],
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = requireAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const parsed = updateReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 })
  }

  try {
    // Try RPC first
    const { data: updated, error: rpcError } = await supabase.rpc('apply_report_status_update', {
      p_report_id: id,
      p_status: parsed.data.status,
      p_note: parsed.data.note || null,
      p_updated_by: admin.email || null,
    })

    if (!rpcError && updated) {
      return NextResponse.json({ report: updated })
    }

    // Direct update fallback if RPC function is missing or failed
    const { data: directUpdated, error: directError } = await supabase
      .from('reports')
      .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (directError) {
      return NextResponse.json({ error: directError.message }, { status: 500 })
    }

    await supabase.from('status_history').insert({
      report_id: id,
      old_status: null,
      new_status: parsed.data.status,
      updated_by: admin.email || null,
      note: parsed.data.note || null,
    })

    return NextResponse.json({ report: directUpdated })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating report'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
