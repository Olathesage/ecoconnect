import { test } from 'node:test'
import assert from 'node:assert'
import { buildPrompt } from '../lib/ai/prompts'
import { validateAnalysis } from '../lib/ai/validateAnalysis'
import { fallbackAnalysis } from '../lib/ai/analyseWithFallback'
import { validateUpload } from '../lib/storage'
import { config } from '../lib/config'
import { analyseReport } from '../lib/ai/analyseReport'

const validAnalysis = {
  category: 'waste',
  severity: 'high',
  location_text: 'Ikole-Ekiti, behind Unity Primary School',
  summary: 'Refuse pile blocking a drainage channel.',
  language: 'en',
  needs_review: false,
  detected_issue: 'Illegal dumping of household waste',
  reason: 'Visible refuse accumulation',
  review_reason: null,
  forward_message: 'Please clear the refuse dump site.',
}

test('valid AI analysis passes validation', () => {
  const result = validateAnalysis(validAnalysis)
  assert.equal(result.category, 'waste')
  assert.equal(result.severity, 'high')
  assert.equal(validateAnalysis({ ...validAnalysis, location_text: '' }).location_text, '')
})

test('invalid AI category is rejected', () => {
  assert.throws(() => validateAnalysis({ ...validAnalysis, category: 'unknown' }))
})

test('missing AI summary is rejected', () => {
  assert.throws(() => validateAnalysis({ ...validAnalysis, summary: '' }))
})

test('fallback analysis is used when AI fails', async () => {
  process.env.AI_FORCE_FAIL = 'true'
  const fallback = await import('../lib/ai/analyseWithFallback')
  const result = await fallback.analyseWithFallback({
    description: 'Broken streetlight on Old Ekiti Road.',
    locationText: 'Old Ekiti Road',
  })
  assert.equal(result.category, 'other')
  assert.equal(result.severity, 'medium')
  assert.equal(result.needs_review, true)
  assert.equal(result.summary, 'Broken streetlight on Old Ekiti Road.')
  delete process.env.AI_FORCE_FAIL
})

test('storage rejects unsupported file type', () => {
  const check = validateUpload('photo', 'application/pdf', 1024)
  assert.equal(check.valid, false)
})

test('storage rejects files over 5MB', () => {
  const check = validateUpload('photo', 'image/png', 6 * 1024 * 1024)
  assert.equal(check.valid, false)
})

test('storage accepts valid photo', () => {
  const check = validateUpload('photo', 'image/png', 1024)
  assert.equal(check.valid, true)
})

test('prompt includes description and location', () => {
  const prompt = buildPrompt({
    description: 'Flooding near the school.',
    locationText: 'Ikole-Ekiti, near Federal Polytechnic',
  })
  assert.ok(prompt.includes('Flooding near the school.'))
  assert.ok(prompt.includes('Ikole-Ekiti, near Federal Polytechnic'))
})

test('Gemma SDK request uses configured credentials and validates its response', async () => {
  const originalFetch = globalThis.fetch
  const originalConfig = {
    gemmaApiKey: config.gemmaApiKey,
    gemmaModel: config.gemmaModel,
  }
  let requestUrl = ''
  let requestInit: RequestInit | undefined

  config.gemmaApiKey = 'test-api-key'
  config.gemmaModel = 'gemma-4-26b-a4b-it'
  globalThis.fetch = async (input, init) => {
    requestUrl = String(input)
    requestInit = init
    return new Response(
      JSON.stringify({
        candidates: [
          {
            content: {
              role: 'model',
              parts: [{ text: JSON.stringify(validAnalysis) }],
            },
          },
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  }

  try {
    const result = await analyseReport({ description: 'Refuse blocking a drain.' })
    assert.match(requestUrl, /generativelanguage\.googleapis\.com\/v1beta\/models\/gemma-4-26b-a4b-it:generateContent/)
    assert.equal(new Headers(requestInit?.headers).get('x-goog-api-key'), 'test-api-key')
    assert.equal(JSON.parse(String(requestInit?.body)).contents[0].parts[0].text.includes('Refuse blocking a drain.'), true)
    assert.equal(result.category, 'waste')
  } finally {
    globalThis.fetch = originalFetch
    Object.assign(config, originalConfig)
  }
})
