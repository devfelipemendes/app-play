// config/env.ts
export const env = {
  // API Configuration
  API_URL: 'https://sistema.playmovel.com.br',

  // Company Configuration
  COMPANY_ID: 46,
  PARCEIRO: 'PLAY MÓVEL',

  // Access Token - ATUALIZAR COM O TOKEN CORRETO
  // IMPORTANTE: Este token precisa ser um token válido fornecido pela API
  // O token "your_access_token_here" está causando o erro 429
  ACCESS_TK: '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558', // Use o token correto aqui

  // App Version
  APP_VERSION: '1.0.0',

  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Features flags
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
}
