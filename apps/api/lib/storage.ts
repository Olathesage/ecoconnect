import { randomUUID } from 'crypto'
import { supabase } from './supabase'

export type UploadKind = 'photo' | 'audio'

export interface UploadCheck {
  valid: boolean
  error?: string
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES: Record<UploadKind, string[]> = {
  photo: ['image/jpeg', 'image/png', 'image/webp'],
  audio: ['audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/wav'],
}

export function validateUpload(kind: UploadKind, mimeType: string, fileSize: number): UploadCheck {
  const allowed = ALLOWED_MIME_TYPES[kind]
  if (!allowed.includes(mimeType)) {
    return { valid: false, error: `Unsupported ${kind} file type. Allowed: ${allowed.join(', ')}` }
  }
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File exceeds the 5MB limit.' }
  }
  return { valid: true }
}

export function generateStoragePath(kind: UploadKind): string {
  const extension = kind === 'photo' ? 'jpg' : 'bin'
  return `${kind}/${Date.now()}-${randomUUID()}.${extension}`
}

export async function uploadMedia(
  kind: UploadKind,
  mimeType: string,
  fileSize: number,
  buffer: Buffer,
): Promise<{ url: string }> {
  const check = validateUpload(kind, mimeType, fileSize)
  if (!check.valid) {
    throw new Error(check.error || 'Invalid upload')
  }
  const path = generateStoragePath(kind)
  const { data, error } = await supabase.storage.from('report-media').upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  })
  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }
  const { data: publicData } = await supabase.storage.from('report-media').getPublicUrl(path)
  return { url: publicData.publicUrl }
}
