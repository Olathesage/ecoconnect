export interface AnalysisInput {
  description: string
  imageUrl?: string | null
  audioUrl?: string | null
  locationText?: string | null
}

export const AI_CATEGORY_VALUES = [
  'waste',
  'drainage',
  'road',
  'water',
  'streetlight',
  'power_outage',
  'hostel_facility',
  'other',
] as const

export const AI_SEVERITY_VALUES = ['low', 'medium', 'high', 'urgent'] as const

export const AI_LANGUAGE_VALUES = ['en', 'yo', 'pcm'] as const

export const AI_FALLBACK_SUMMARY_LENGTH = 200

export function buildPrompt(input: AnalysisInput): string {
  const lines: string[] = [
    'Analyse this community complaint for EcoConnect Ekiti, serving Ikole and Oye, Ekiti.',
    'Return only valid JSON with no markdown or extra text.',
    'The JSON must follow this exact shape:',
    '{',
    '  "category": "one of waste | drainage | road | water | streetlight | power_outage | hostel_facility | other",',
    '  "severity": "one of low | medium | high | urgent",',
    '  "location_text": "free text location description",',
    '  "summary": "short English summary, max 2 sentences",',
    '  "language": "one of en | yo | pcm",',
    '  "needs_review": true or false,',
    '  "detected_issue": "short description of the detected issue",',
    '  "reason": "why this category and severity were selected",',
    '  "review_reason": "reason for human review, or null",',
    '  "forward_message": "professional draft for the appropriate authority, or null"',
    '}',
    'Detect whether the original complaint is English (en), Yoruba (yo), or Nigerian Pidgin (pcm).',
    'Write the summary in clear English, regardless of the complaint language.',
    'Use urgent only for immediate danger or severe disruption; high for substantial impact, medium for a moderate issue, and low for a minor issue.',
    'Set needs_review to true when the report is ambiguous, lacks enough evidence, has conflicting details, or the category or severity is uncertain. Explain why in review_reason.',
    'Do not invent missing location details; use the provided location only, or an empty string if none was provided.',
    'Draft a concise, professional message an administrator can forward to the likely responsible government or school authority. Do not claim it was sent or received, and do not invent an authority name.',
  ]

  if (input.locationText) {
    lines.push(`Provided location: ${input.locationText}`)
  } else {
    lines.push('Provided location: none')
  }
  lines.push(`Complaint:\n${input.description || '(No text description provided.)'}`)
  if (input.imageUrl) {
    lines.push('An image was attached to the report.')
  }
  if (input.audioUrl) {
    lines.push('An audio recording was attached to the report.')
  }

  return lines.join('\n')
}
