import { Request, Response } from 'express'
import { supabase } from '../lib/supabase'
import { analyseWithFallback } from '../lib/ai/analyseWithFallback'
import { uploadMedia } from '../lib/storage'
import type { MulterRequest } from '../middleware/upload'

interface ReportRow {
  id: string
  reference: string
  description: string
  category: string
  severity: string
  location_text: string | null
  summary: string | null
  needs_review: boolean | null
  status: string
  photo_url: string | null
  created_at: string | null
}

interface SingleResult<T> {
  data: T | null
  error: { message: string } | null
}

export async function createReport(req: Request, res: Response): Promise<void> {
  const body = req.body as Record<string, unknown>
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const locationText = typeof body.locationText === 'string' ? body.locationText.trim() : ''
  const contact = typeof body.contact === 'string' ? body.contact.trim() : undefined
  const latitude = typeof body.latitude === 'number' ? body.latitude : undefined
  const longitude = typeof body.longitude === 'number' ? body.longitude : undefined

  const files = (req as MulterRequest).files
  const hasMedia = Boolean(files?.photo?.[0] || files?.audio?.[0])
  if (!description && !hasMedia) {
    res.status(400).json({ error: 'Description or media is required.' })
    return
  }

  const photoFile = files?.photo?.[0]
  const audioFile = files?.audio?.[0]

  let photoUrl: string | null = null
  let audioUrl: string | null = null
  try {
    if (photoFile) {
      const uploaded = await uploadMedia('photo', photoFile.mimetype, photoFile.size, photoFile.buffer)
      photoUrl = uploaded.url
    }
    if (audioFile) {
      const uploaded = await uploadMedia('audio', audioFile.mimetype, audioFile.size, audioFile.buffer)
      audioUrl = uploaded.url
    }
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Media upload failed.' })
    return
  }

  const analysis = await analyseWithFallback({
    description,
    imageUrl: photoUrl,
    audioUrl,
    locationText,
  })

  const referenceResult = (await supabase.rpc('generate_report_reference')) as unknown as SingleResult<string>
  if (referenceResult.error || !referenceResult.data) {
    res.status(500).json({ error: 'Failed to generate report reference.' })
    return
  }
  const reference = referenceResult.data

  const createdResult = (await supabase
    .from('reports')
    .insert({
      reference,
      description,
      category: analysis.category,
      severity: analysis.severity,
      location_text: locationText || analysis.location_text,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      summary: analysis.summary,
      language: analysis.language,
      needs_review: analysis.needs_review,
      review_reason: analysis.review_reason,
      detected_issue: analysis.detected_issue,
      ai_reason: analysis.reason,
      forward_message: analysis.forward_message,
      recommended_agency_id: null,
      status: 'pending',
      photo_url: photoUrl,
      audio_url: audioUrl,
      contact,
      raw_ai_output: {
        category: analysis.category,
        severity: analysis.severity,
        location_text: analysis.location_text,
        summary: analysis.summary,
        language: analysis.language,
        needs_review: analysis.needs_review,
        detected_issue: analysis.detected_issue,
        reason: analysis.reason,
        review_reason: analysis.review_reason,
        forward_message: analysis.forward_message,
      },
    })
    .select()
    .single()) as unknown as SingleResult<ReportRow>

  if (createdResult.error || !createdResult.data) {
    res.status(500).json({ error: createdResult.error?.message || 'Failed to save report.' })
    return
  }

  const saved = createdResult.data
  await supabase.from('status_history').insert({
    report_id: saved.id,
    old_status: null,
    new_status: 'pending',
    updated_by: null,
    note: 'Report submitted',
  })

  res.status(201).json({
    reference: saved.reference,
    category: saved.category,
    severity: saved.severity,
    summary: saved.summary,
    needs_review: saved.needs_review,
    status: saved.status,
  })
}

export async function trackReport(req: Request, res: Response): Promise<void> {
  const reference = String(req.params.reference || '').trim().toUpperCase()
  const response = (await supabase
    .from('reports')
    .select(
      'reference,status,category,severity,summary,location_text,photo_url,created_at',
    )
    .eq('reference', reference)
    .single()) as unknown as SingleResult<ReportRow>

  if (response.error || !response.data) {
    res.status(404).json({ error: 'Report not found' })
    return
  }

  const historyResult = (await supabase
    .from('status_history')
    .select('new_status,note,created_at')
    .eq('report_id', response.data.id)
    .order('created_at', { ascending: true })) as unknown as SingleResult<{ new_status: string; note: string | null; created_at: string }[]>

  res.json({
    reference: response.data.reference,
    status: response.data.status,
    category: response.data.category,
    severity: response.data.severity,
    summary: response.data.summary,
    location_text: response.data.location_text,
    photo_url: response.data.photo_url,
    created_at: response.data.created_at,
    status_history: historyResult.data || [],
  })
}
