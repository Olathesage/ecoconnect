import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { config } from './config'

function getSessionSecret(): string {
  if (!config.sessionSecret) {
    throw new Error('SESSION_SECRET is not configured')
  }

  return config.sessionSecret
}
export const SESSION_COOKIE_NAME = 'ecoconnect_admin_session'
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

export interface SessionPayload {
  email?: string
  issuedAt: number
}

export function signPayload(payload: SessionPayload): string {
  const secret = getSessionSecret()
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(base64).digest('base64url')
  return `${base64}.${signature}`
}

export function verifyToken(token: string): SessionPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }
  const secret = config.sessionSecret || 'dev-session-secret'
  const [base64, signature] = parts
  const expected = createHmac('sha256', secret).update(base64).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null
  }
  try {
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString('utf8')) as SessionPayload
    if (typeof payload.issuedAt !== 'number') {
      return null
    }
    if (Date.now() - payload.issuedAt > SESSION_TTL_MS) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function createAdminSession(email?: string): string {
  return signPayload({ email, issuedAt: Date.now() })
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function requireAdminFromRequest(req: Request): SessionPayload | null {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim()
    const payload = verifyToken(token)
    if (payload) return payload
  }

  // Check Cookie header
  const cookieHeader = req.headers.get('cookie') || ''
  const cookiesList = cookieHeader.split(';').map((c) => c.trim())
  const sessionCookie = cookiesList.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
  if (sessionCookie) {
    const token = sessionCookie.substring(SESSION_COOKIE_NAME.length + 1)
    const payload = verifyToken(token)
    if (payload) return payload
  }

  return null
}

function shouldUseSecureCookies(): boolean {
  if (process.env.COOKIE_SECURE === 'true') return true
  if (process.env.COOKIE_SECURE === 'false') return false
  if (process.env.VERCEL || process.env.VERCEL_ENV === 'production') return true
  return false
}

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    maxAge: 0,
    path: '/',
  })
}
