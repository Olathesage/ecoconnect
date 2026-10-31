import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || 'http://127.0.0.1:54321',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key',
  adminPin: process.env.ADMIN_PIN || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  gemmaApiKey: process.env.GEMMA_API_KEY || '',
  gemmaModel: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  aiForceFail: process.env.AI_FORCE_FAIL === 'true',
}

export function validateConfig(): void {
  const missing: string[] = []
  if (!config.supabaseUrl) missing.push('SUPABASE_URL')
  if (!config.supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!config.adminPin) missing.push('ADMIN_PIN')
  if (!config.sessionSecret) missing.push('SESSION_SECRET')
  if (!config.gemmaModel) missing.push('GEMMA_MODEL')

  const isProduction = config.nodeEnv === 'production'
  const requiredInProduction = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ADMIN_PIN',
    'SESSION_SECRET',
    'GEMMA_API_KEY',
    'GEMMA_MODEL',
  ]

  if (isProduction) {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        missing.push(`${key} (required in production)`)
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment configuration: ${missing.join(', ')}. ` +
        'Copy apps/api/.env.example to apps/api/.env and fill in the values.',
    )
  }
}
