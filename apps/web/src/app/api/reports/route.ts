import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { analyseWithFallback } from '@/lib/ai/analyseWithFallback'
import { uploadMedia } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    let description = ''
    let locationText = ''
    let contact: string | undefined
    let latitude: number | undefined
    let longitude: number | undefined
    let photoFile: File | null = null
    let audioFile: File | null = null

    const contentType = req.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      description = String(formData.get('description') || '').trim()
      locationText = String(formData.get('locationText') || '').trim()
      contact = formData.get('contact') ? String(formData.get('contact')).trim() : undefined
      const lat = formData.get('latitude')
      const lng = formData.get('longitude')
      if (lat) latitude = Number(lat)
      if (lng) longitude = Number(lng)

      const photoEntry = formData.get('photo')
      if (photoEntry instanceof File && photoEntry.size > 0) {
        photoFile = photoEntry
      }
      const audioEntry = formData.get('audio')
      if (audioEntry instanceof File && audioEntry.size > 0) {
        audioFile = audioEntry
      }
    } else if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => ({}))
      description = String(json.description || '').trim()
      locationText = String(json.locationText || '').trim()
      contact = json.contact ? String(json.contact).trim() : undefined
      if (json.latitude != null) latitude = Number(json.latitude)
      if (json.longitude != null) longitude = Number(json.longitude)
    }

    const hasMedia = Boolean(photoFile || audioFile)
    if (!description && !hasMedia) {
      return NextResponse.json(
        { error: 'Description or media is required.' },
        { status: 400 },
      )
    }

    let photoUrl: string | null = null
    let audioUrl: string | null = null

    if (photoFile) {
      try {
        const buffer = Buffer.from(await photoFile.arrayBuffer())
        const uploaded = await uploadMedia('photo', photoFile.type, photoFile.size, buffer, photoFile.name)
        photoUrl = uploaded.url
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Photo upload failed'
        return NextResponse.json({ error: msg }, { status: 400 })
      }
    }

    if (audioFile) {
      try {
        const buffer = Buffer.from(await audioFile.arrayBuffer())
        const uploaded = await uploadMedia('audio', audioFile.type, audioFile.size, buffer, audioFile.name)
        audioUrl = uploaded.url
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Audio upload failed'
        return NextResponse.json({ error: msg }, { status: 400 })
      }
    }

    const analysis = await analyseWithFallback({
      description,
      imageUrl: photoUrl,
      audioUrl,
      locationText,
    })

    // Generate report reference
    let reference = ''
    try {
      const { data: refData, error: refError } = await supabase.rpc('generate_report_reference')
      if (!refError && refData) {
        reference = refData as string
      }
    } catch {
      // Fallback below
    }

    if (!reference) {
      const rand = Math.floor(1000 + Math.random() * 9000)
      reference = `ECO-${rand}`
    }

    const reportPayload = {
      reference,
      description,
      category: analysis.category,
      severity: analysis.severity,
      location_text: locationText || analysis.location_text || null,
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
      contact: contact || null,
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
    }

    const { data: savedReport, error: insertError } = await supabase
      .from('reports')
      .insert(reportPayload)
      .select()
      .single()

    if (insertError) {
      console.error('[CreateReport] Supabase insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to save report.' },
        { status: 500 },
      )
    }

    try {
      await supabase.from('status_history').insert({
        report_id: savedReport.id,
        old_status: null,
        new_status: 'pending',
        updated_by: null,
        note: 'Report submitted',
      })
    } catch (historyErr) {
      console.warn('[CreateReport] Could not insert status history:', historyErr)
    }

    return NextResponse.json(
      {
        reference: savedReport.reference,
        category: savedReport.category,
        severity: savedReport.severity,
        summary: savedReport.summary,
        needs_review: savedReport.needs_review,
        status: savedReport.status,
      },
      { status: 201 },
    )
  } catch (err: unknown) {
    console.error('[CreateReport] Error:', err)
    const message = err instanceof Error ? err.message : 'Unexpected server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
