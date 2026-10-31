import { z } from 'zod'
import { AI_CATEGORY_VALUES, AI_LANGUAGE_VALUES, AI_SEVERITY_VALUES } from './prompts'

export const AnalysisSchema = z.object({
  category: z.enum(AI_CATEGORY_VALUES),
  severity: z.enum(AI_SEVERITY_VALUES),
  location_text: z.string(),
  summary: z.string().min(1, 'summary is required'),
  language: z.enum(AI_LANGUAGE_VALUES),
  needs_review: z.boolean(),
  detected_issue: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  review_reason: z.string().nullable().optional(),
  forward_message: z.string().nullable().optional(),
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>

export type SafeAnalysisResult = {
  category: AnalysisResult['category']
  severity: AnalysisResult['severity']
  location_text: string
  summary: string
  language: AnalysisResult['language']
  needs_review: boolean
  detected_issue: string | null
  reason: string | null
  review_reason: string | null
  forward_message: string | null
}

export function validateAnalysis(input: unknown): AnalysisResult {
  const parsed = AnalysisSchema.parse(input)
  return parsed
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  try {
    validateAnalysis(value)
    return true
  } catch {
    return false
  }
}
