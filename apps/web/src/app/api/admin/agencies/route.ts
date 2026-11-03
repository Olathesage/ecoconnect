import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireAdminFromRequest } from '@/lib/auth'

export async function GET(req: Request) {
  const admin = requireAdminFromRequest(req)
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase.from('agencies').select('*')
    if (error) {
      return NextResponse.json({ agencies: [] })
    }
    return NextResponse.json({ agencies: data || [] })
  } catch {
    return NextResponse.json({ agencies: [] })
  }
}
