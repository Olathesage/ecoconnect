import { GoogleGenAI } from '@google/genai'
import { config } from '../config'
import { buildPrompt, type AnalysisInput } from './prompts'
import { validateAnalysis, type AnalysisResult } from './validateAnalysis'

async function callGemmaApi(input: AnalysisInput): Promise<AnalysisResult> {
  if (!config.gemmaApiKey) {
    throw new Error('GEMMA_API_KEY is not configured')
  }

  const ai = new GoogleGenAI({
    apiKey: config.gemmaApiKey,
    httpOptions: { timeout: 60000 },
  })
  const response = await ai.models.generateContent({
    model: config.gemmaModel,
    contents: buildPrompt(input),
    config: {
      systemInstruction: 'You are Gemma 4, the AI triage engine for EcoConnect Ekiti.',
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  })
  const content = response.text
  if (!content) {
    throw new Error('Gemma API response did not contain text')
  }

  return validateAnalysis(JSON.parse(content) as unknown)
}

export async function analyseReport(input: AnalysisInput): Promise<AnalysisResult> {
  return callGemmaApi(input)
}
