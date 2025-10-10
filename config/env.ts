// config/env.ts - Configuração dinâmica baseada em tenant
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Obtém o TENANT_ID ativo
 * Prioridade: expo-constants > variável de ambiente > padrão
 */
const getTenantId = (): string => {
  // 1. Tenta pegar do expo-constants (configurado no build)
  const tenantFromConstants = Constants.expoConfig?.extra?.tenantId;
  if (tenantFromConstants) {
    return String(tenantFromConstants);
  }

  // 2. Fallback para ambiente de desenvolvimento
  if (__DEV__) {
    return process.env.EXPO_PUBLIC_TENANT_ID || '46';
  }

  // 3. Padrão (Play Móvel)
  return '46';
};

/**
 * Mapa estático de configurações de tenants
 * Metro bundler requer imports estáticos
 */
const TENANT_CONFIGS: Record<string, any> = {
  '46': require('../partners/partner-46-playmovel/env.json'),
  // Adicione outros tenants aqui conforme necessário
  // '47': require('../partners/partner-47-slug/env.json'),
};

/**
 * Configuração padrão (fallback)
 */
const DEFAULT_CONFIG = {
  API_URL: 'https://sistema.playmovel.com.br',
  COMPANY_ID: 46,
  PARCEIRO: 'PLAY MÓVEL',
  ACCESS_TK: '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
  APP_VERSION: '1.0.0',
  NODE_ENV: __DEV__ ? 'development' : 'production',
  ENABLE_ANALYTICS: false,
  ENABLE_CRASH_REPORTING: false,
  FEATURES: {
    recharge: true,
    portability: true,
    support: true,
    plans: true,
    consumption: true,
  },
};

/**
 * Carrega configuração do tenant a partir do arquivo
 * Em produção, estas configs vêm do build-time
 * Em desenvolvimento, carrega do diretório partners/
 */
const loadTenantConfig = () => {
  const tenantId = getTenantId();

  try {
    // Tenta carregar configuração do tenant
    // Em produção, estas variáveis já estarão disponíveis via expo-constants
    const tenantConfig = Constants.expoConfig?.extra?.tenantConfig;

    if (tenantConfig) {
      return tenantConfig;
    }

    // Fallback para desenvolvimento - usa mapa estático
    if (__DEV__) {
      console.log(`📦 Loading config for tenant: ${tenantId} (development mode)`);

      // Busca no mapa estático de tenants
      if (TENANT_CONFIGS[tenantId]) {
        return TENANT_CONFIGS[tenantId];
      } else {
        console.warn(`⚠️  Tenant ${tenantId} not found in TENANT_CONFIGS, using defaults`);
      }
    }
  } catch (error) {
    console.error('Error loading tenant config:', error);
  }

  // Retorna configuração padrão
  return DEFAULT_CONFIG;
};

// Carrega a configuração do tenant
const tenantConfig = loadTenantConfig();

/**
 * Configurações de ambiente exportadas
 * IMPORTANTE: Estas configurações são baseadas no tenant ativo
 * As cores e temas dinâmicos virão do backend via API
 */
export const env = {
  // Tenant Info
  TENANT_ID: getTenantId(),

  // API Configuration
  API_URL: tenantConfig.API_URL,

  // Company Configuration
  COMPANY_ID: tenantConfig.COMPANY_ID,
  PARCEIRO: tenantConfig.PARCEIRO,

  // Access Token
  ACCESS_TK: tenantConfig.ACCESS_TK,

  // App Version
  APP_VERSION: tenantConfig.APP_VERSION,

  // Environment
  NODE_ENV: tenantConfig.NODE_ENV || (__DEV__ ? 'development' : 'production'),

  // Features flags
  ENABLE_ANALYTICS: tenantConfig.ENABLE_ANALYTICS || false,
  ENABLE_CRASH_REPORTING: tenantConfig.ENABLE_CRASH_REPORTING || false,

  // Feature toggles por tenant
  FEATURES: tenantConfig.FEATURES || {
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
};

/**
 * Tipo para configuração do tenant
 */
export interface TenantConfig {
  API_URL: string;
  COMPANY_ID: number;
  PARCEIRO: string;
  ACCESS_TK: string;
  APP_VERSION: string;
  NODE_ENV: string;
  ENABLE_ANALYTICS: boolean;
  ENABLE_CRASH_REPORTING: boolean;
  FEATURES: {
    recharge: boolean;
    portability: boolean;
    support: boolean;
    plans: boolean;
    consumption: boolean;
  };
}

// Log de debug (apenas em desenvolvimento)
if (__DEV__) {
  console.log('🏢 Environment Configuration:', {
    TENANT_ID: env.TENANT_ID,
    COMPANY_ID: env.COMPANY_ID,
    PARCEIRO: env.PARCEIRO,
    API_URL: env.API_URL,
    FEATURES: env.FEATURES,
  });
}
