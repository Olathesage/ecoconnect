
export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  adminPin: process.env.ADMIN_PIN || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  gemmaApiKey: process.env.GEMMA_API_KEY || '',
  gemmaModel: process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it',
  aiForceFail: process.env.AI_FORCE_FAIL === 'true',
}

export function validateConfig(): void {
  const required = {
    SUPABASE_URL: config.supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: config.supabaseServiceKey,
    ADMIN_PIN: config.adminPin,
    SESSION_SECRET: config.sessionSecret,
  }

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length === 0) return

  const message = `[Config] Missing required environment variables: ${missing.join(', ')}`

  if (config.nodeEnv === 'production') {
    throw new Error(message)
  }

  console.warn(message)
}
