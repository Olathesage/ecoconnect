import { NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { requireAdminFromRequest } from '@/lib/auth'
import { SAMPLE_REPORTS } from '@/data/sampleReports'

const querySchema = z.object({
  category: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
})

export async function GET(req: Request) {
  const admin = requireAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.parse({
    category: searchParams.get('category') || undefined,
    severity: searchParams.get('severity') || undefined,
    status: searchParams.get('status') || undefined,
    q: searchParams.get('q') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  })

  try {
    let builder = supabase
      .from('reports')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((parsed.page - 1) * parsed.pageSize, parsed.page * parsed.pageSize - 1)

    if (parsed.category) builder = builder.eq('category', parsed.category)
    if (parsed.severity) builder = builder.eq('severity', parsed.severity)
    if (parsed.status) builder = builder.eq('status', parsed.status)

    const { data, error, count } = await builder

    if (error) {
      console.warn('[AdminReports] Supabase query error, falling back to sample data:', error.message)
      return getFallbackReports(parsed)
    }

    return NextResponse.json({
      items: data || [],
      total: count || 0,
    })
  } catch (err) {
    console.warn('[AdminReports] Exception querying Supabase, using fallback:', err)
    return getFallbackReports(parsed)
  }
}

function getFallbackReports(parsed: z.infer<typeof querySchema>) {
  let filtered = [...SAMPLE_REPORTS]
  if (parsed.category) filtered = filtered.filter((r) => r.category === parsed.category)
  if (parsed.severity) filtered = filtered.filter((r) => r.severity === parsed.severity)
  if (parsed.status) filtered = filtered.filter((r) => r.status === parsed.status)

  const start = (parsed.page - 1) * parsed.pageSize
  const items = filtered.slice(start, start + parsed.pageSize)

  return NextResponse.json({
    items,
    total: filtered.length,
  })
}
