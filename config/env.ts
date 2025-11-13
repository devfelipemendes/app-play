// config/env.ts - Configuração fixa para Play Móvel (Partner 46)
import { Platform } from 'react-native'

/**
 * Configurações de ambiente - Play Móvel
 * Valores fixos para o aplicativo padrão
 */
export const env = {
  // API Configuration
  API_URL: 'https://sistema.playmovel.com.br',
  // API_URL: 'https://twoglobal.operadora.app.br',

  // Company Configuration
  COMPANY_ID: 46,
  PARCEIRO: 'PLAY MÓVEL',

  // App Version
  APP_VERSION: '5.0.0',

  // Environment
  NODE_ENV: __DEV__ ? 'development' : 'production',

  // Features flags
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,

  // External URLs
  SUPPORT_CHAT_URL: '',
  CHIP_PURCHASE_URL: '',

  // Feature toggles
  FEATURES: {
    recharge: true,
    portability: true,
    support: true,
    plans: true,
    consumption: true,
  },

  // Platform info
  IS_IOS: Platform.OS === 'ios',
  IS_ANDROID: Platform.OS === 'android',
  IS_WEB: Platform.OS === 'web',
  IS_DEV: __DEV__,
}

// Log de debug (apenas em desenvolvimento)
if (__DEV__) {
  console.log('🏢 Environment Configuration:', {
    COMPANY_ID: env.COMPANY_ID,
    PARCEIRO: env.PARCEIRO,
    API_URL: env.API_URL,
    FEATURES: env.FEATURES,
  })
}
