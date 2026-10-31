import { Request } from 'express'
import multer from 'multer'

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  },
})

export function mediaUpload() {
  return upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ])
}

export type MulterRequest = Request & {
  files?: Record<string, Express.Multer.File[] | undefined>
}

export type MulterError = Error & { code?: string }
