import { timingSafeEqual } from 'crypto'
import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { createAdminSession, setAdminCookie } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { pin?: string }
    const pin = body.pin
    const adminPin = config.adminPin

    if (!adminPin || !pin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const a = Buffer.from(String(pin))
    const b = Buffer.from(adminPin)

    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = createAdminSession('admin@ecoconnect.local')
    const response = NextResponse.json({ ok: true, token })
    setAdminCookie(response, token)
    return response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
