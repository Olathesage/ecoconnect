import { Request, Response } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'

interface ReportRow {
  id: string
  reference: string
  status: string
  category: string
  severity: string
  summary: string | null
  location_text: string | null
  photo_url: string | null
  forward_message: string | null
  needs_review: boolean | null
  created_at: string | null
}

interface SingleResult<T> {
  data: T | null
  error: { message: string } | null
}

const listReportsQuerySchema = z.object({
  category: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

const updateReportSchema = z.object({
  status: z.enum(['pending', 'forwarded', 'in_progress', 'resolved']),
  note: z.string().max(1000).optional(),
})

export async function listAdminReports(req: Request, res: Response): Promise<void> {
  const query = req.query as Record<string, string>
  const parsed = listReportsQuerySchema.parse({
    category: query.category,
    severity: query.severity,
    status: query.status,
    q: query.q,
    page: query.page,
    pageSize: query.pageSize,
  })

  let builder = supabase
    .from('reports')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((parsed.page - 1) * parsed.pageSize, parsed.page * parsed.pageSize - 1)

  if (parsed.category) {
    builder = builder.eq('category', parsed.category)
  }
  if (parsed.severity) {
    builder = builder.eq('severity', parsed.severity)
  }
  if (parsed.status) {
    builder = builder.eq('status', parsed.status)
  }

  const { data, error, count } = await builder

  res.json({
    items: data || [],
    total: count || 0,
  })
}

export async function getAdminReport(req: Request, res: Response): Promise<void> {
  const id = req.params.id
  const response = (await supabase.from('reports').select('*').eq('id', id).single()) as unknown as SingleResult<ReportRow>
  if (response.error || !response.data) {
    res.status(404).json({ error: 'Report not found' })
    return
  }
  const historyResult = (await supabase
    .from('status_history')
    .select('id,report_id,old_status,new_status,updated_by,note,created_at')
    .eq('report_id', response.data.id)
    .order('created_at', { ascending: true })) as unknown as SingleResult<
    Array<{ id: string; report_id: string; old_status: string | null; new_status: string; updated_by: string | null; note: string | null; created_at: string | null }>
  >

  res.json({ report: { ...response.data, status_history: historyResult.data || [] } })
}

export async function updateAdminReport(req: Request, res: Response): Promise<void> {
  const id = req.params.id
  const parsed = updateReportSchema.parse(req.body)
  const admin = (req as Request & { admin?: { email?: string } }).admin
  const { data: updated, error } = await supabase.rpc('apply_report_status_update', {
    p_report_id: id,
    p_status: parsed.status,
    p_note: parsed.note || null,
    p_updated_by: admin?.email || null,
  })
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ report: updated })
}

export async function getAdminStats(_req: Request, res: Response): Promise<void> {
  const { data: allReports, error } = await supabase.from('reports').select('*')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  const reports = allReports || []
  const byStatus = (status: string) => reports.filter((r) => r.status === status).length
  const bySeverity = (severity: string) => reports.filter((r) => r.severity === severity).length
  res.json({
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

export async function getAdminAgencies(_req: Request, res: Response): Promise<void> {
  const { data, error } = await supabase.from('agencies').select('*')
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json({ agencies: data || [] })
}

export async function forwardReportMessage(req: Request, res: Response): Promise<void> {
  const id = req.params.id
  const { data: report, error } = await supabase.from('reports').select('*').eq('id', id).single()
  if (error || !report.data) {
    res.status(404).json({ error: 'Report not found' })
    return
  }
  const message = report.data.forward_message || 'Forward message unavailable.'
  res.json({ forward_message: message })
}
