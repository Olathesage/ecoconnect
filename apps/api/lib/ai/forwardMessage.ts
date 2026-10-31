import type { AnalysisResult } from './validateAnalysis'

export function buildForwardMessage(params: {
  reference: string
  locationText?: string | null
  severity?: AnalysisResult['severity'] | null
  summary?: string | null
}): {
  subject: string
  reference: string
  location: string
  severity: string
  summary: string
  message: string
} {
  const subject = `EcoConnect Ekiti Report ${params.reference}`
  const location = params.locationText || 'Unspecified location'
  const severity = params.severity || 'medium'
  const summary = params.summary || 'No summary available.'

  const message =
    `Subject: ${subject}\n` +
    `Reference: ${params.reference}\n` +
    `Location: ${location}\n` +
    `Severity: ${severity}\n` +
    `Summary: ${summary}\n\n` +
    `Please review this community report and confirm receipt.` +
    ' A two-sentence summary: ' +
    summary

  return {
    subject,
    reference: params.reference,
    location,
    severity,
    summary,
    message,
  }
}
