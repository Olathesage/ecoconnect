import 'dotenv/config'
import { timingSafeEqual } from 'crypto'
import { pathToFileURL } from 'url'
import express, { type Express, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { validateConfig } from './lib/config'
import {
  clearAdminSessionCookie,
  createAdminSession,
  requireAdmin,
  setAdminSessionCookie,
} from './middleware/requireAdmin'
import { mediaUpload } from './middleware/upload'
import { createReport, trackReport } from './routes/reports'
import {
  forwardReportMessage,
  getAdminAgencies,
  getAdminReport,
  getAdminStats,
  listAdminReports,
  updateAdminReport,
} from './routes/admin'

export function createApp(): Express {
  const app = express()

  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json({ limit: '10kb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/reports', mediaUpload(), (req: Request, res: Response, next: NextFunction) => {
    createReport(req, res).catch(next)
  })
  app.get('/api/reports/:reference', (req: Request, res: Response, next: NextFunction) => {
    trackReport(req, res).catch(next)
  })

  app.post('/api/admin/login', (req, res) => {
    const { pin } = req.body as { pin?: string }
    const adminPin = process.env.ADMIN_PIN || ''
    if (!adminPin || !pin) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const a = Buffer.from(String(pin))
    const b = Buffer.from(adminPin)
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    const token = createAdminSession('admin@ecoconnect.local')
    setAdminSessionCookie(res, token)
    res.json({ ok: true })
  })

  app.post('/api/admin/logout', (req, res) => {
    clearAdminSessionCookie(res)
    res.json({ ok: true })
  })

  app.get('/api/admin/reports', requireAdmin, listAdminReports)
  app.get('/api/admin/reports/:id', requireAdmin, getAdminReport)
  app.patch('/api/admin/reports/:id', requireAdmin, updateAdminReport)
  app.get('/api/admin/stats', requireAdmin, getAdminStats)
  app.get('/api/admin/agencies', requireAdmin, getAdminAgencies)
  app.post('/api/admin/reports/:id/forward-message', requireAdmin, forwardReportMessage)

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unexpected server error'
    res.status(500).json({ error: message })
  })

  return app
}

export function startServer(port: number): Express {
  const app = createApp()
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`EcoConnect Ekiti API listening on port ${port}`)
  })
  return app
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (isDirectRun) {
  validateConfig()
  const port = Number(process.env.PORT || 3001)
  startServer(port)
}
