import { createHmac, timingSafeEqual } from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import { config } from '../lib/config'

const SESSION_COOKIE_NAME = 'ecoconnect_admin_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

interface SessionPayload {
  email?: string
  issuedAt: number
}

function signPayload(payload: SessionPayload): string {
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', config.sessionSecret).update(base64).digest('base64url')
  return `${base64}.${signature}`
}

function verifyToken(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) {
    return null
  }
  const [base64, signature] = parts
  const expected = createHmac('sha256', config.sessionSecret).update(base64).digest('base64url')
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

export function setAdminSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
}

export function createAdminSession(email?: string): string {
  return signPayload({ email, issuedAt: Date.now() })
}

export function clearAdminSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    path: '/',
  })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const cookies = req.cookies as Record<string, string> | undefined
  const token = cookies?.[SESSION_COOKIE_NAME]
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  ;(req as Request & { admin?: { email?: string } }).admin = { email: payload.email }
  next()
}
