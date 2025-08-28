// ✅ Configurações de ambiente centralizadas
export const env = {
  // TODO: Configurar valores reais
  COMPANY_ID: 46,
  ACCESS_TK: 'your_access_token_here',
  API_BASE_URL: 'https://sistema.playmovel.com.br',

  // Configurações do app
  APP_VERSION: '1.0.0',
  APP_NAME: 'MVNO App',

  // Debug
  DEBUG: __DEV__,
} as const

// ✅ Função para validar configurações obrigatórias
export function validateEnv() {
  const required = ['COMPANY_ID', 'ACCESS_TK', 'API_BASE_URL'] as const

  for (const key of required) {
    if (!env[key]) {
      console.warn(`⚠️  Environment variable ${key} não está configurado`)
    }
  }
}

// ✅ Validar na inicialização
if (__DEV__) {
  validateEnv()
}
