import type { AnalysisResult } from './validateAnalysis'

export function fallbackAnalysis(description: string): AnalysisResult {
  return {
    category: 'other',
    severity: 'medium',
    location_text: '',
    summary: (description || '').slice(0, 200),
    language: 'en',
    needs_review: true,
    detected_issue: null,
    reason: null,
    review_reason: 'AI unavailable or invalid output',
    forward_message: null,
  }
}

export async function analyseWithFallback(input: {
  description: string
  imageUrl?: string | null
  audioUrl?: string | null
  locationText?: string | null
}): Promise<AnalysisResult> {
  if (input.description === undefined) {
    throw new Error('description is required')
  }

  if (process.env.AI_FORCE_FAIL === 'true') {
    return fallbackAnalysis(input.description)
  }

  try {
    const analysis = await import('./analyseReport').then((m) => m.analyseReport(input))
    return analysis
  } catch (error) {
    console.error('AI analysis failed, using fallback:', error instanceof Error ? error.message : error)
    return fallbackAnalysis(input.description)
  }
}
