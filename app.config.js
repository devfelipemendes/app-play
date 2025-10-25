// app.config.js - Configuração dinâmica multi-tenant
const fs = require('fs');
const path = require('path');

/**
 * Função para encontrar o diretório do parceiro baseado no TENANT_ID
 */
function findPartnerDir(tenantId) {
  const partnersDir = path.join(__dirname, 'partners');

  // Verifica se o diretório partners existe
  if (!fs.existsSync(partnersDir)) {
    console.warn('⚠️  Diretório /partners não encontrado. Usando configuração padrão.');
    console.log('DEBUG: Caminho tentado:', partnersDir);
    return null;
  }

  const tenants = fs.readdirSync(partnersDir);
  console.log('DEBUG: Tenants encontrados:', tenants);
  console.log('DEBUG: Procurando por:', `partner-${tenantId}-`);

  const partnerDir = tenants.find(dir => dir.startsWith(`partner-${tenantId}-`));

  if (!partnerDir) {
    console.warn(`⚠️  Tenant ${tenantId} não encontrado. Usando configuração padrão.`);
    console.log('DEBUG: Diretórios disponíveis:', tenants);
    return null;
  }

  console.log('DEBUG: Partner encontrado:', partnerDir);
  return path.join(partnersDir, partnerDir);
}

/**
 * Carrega a configuração do parceiro
 */
function loadPartnerConfig(partnerDir) {
  if (!partnerDir) return null;

  const configPath = path.join(partnerDir, 'app.config.json');

  if (!fs.existsSync(configPath)) {
    console.warn(`⚠️  app.config.json não encontrado em ${partnerDir}`);
    return null;
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

module.exports = ({ config = {} }) => {
  // Garante que config.expo existe
  const baseConfig = config.expo || {};

  // Obtém o TENANT_ID do ambiente ou usa o padrão
  const tenantId = (process.env.TENANT_ID || process.env.EXPO_PUBLIC_TENANT_ID || '46').trim();

  console.log(`\n🏢 Building for Tenant ID: ${tenantId}`);

  // Encontra e carrega configuração do parceiro
  const partnerDir = findPartnerDir(tenantId);
  const partnerConfig = loadPartnerConfig(partnerDir);

  // Se não encontrar configuração do parceiro, usa a padrão
  if (!partnerConfig) {
    console.log('📦 Using default configuration from app.json');
    return {
      ...config,
      expo: {
        ...baseConfig,
        orientation: 'portrait', // 🔒 Bloquear orientação em portrait
        ios: {
          ...(baseConfig.ios || {}),
          bundleIdentifier: baseConfig.ios?.bundleIdentifier || 'com.appplay.default',
          infoPlist: {
            ...(baseConfig.ios?.infoPlist || {}),
            NSFaceIDUsageDescription: 'Este app usa Face ID para autenticar seu login de forma segura.',
            UIViewControllerBasedStatusBarAppearance: false,
          },
        },
        android: {
          ...(baseConfig.android || {}),
          package: baseConfig.android?.package || 'com.appplay.default',
          permissions: baseConfig.android?.permissions || [],
          screenOrientation: 'portrait', // 🔒 Bloquear orientação no Android
        },
        extra: {
          ...(baseConfig.extra || {}),
          tenantId,
          eas: {
            projectId: '8bfa2423-69b5-48bf-94c1-c4ded0716494',
          },
        },
      },
    };
  }

  console.log(`✅ Loaded config for: ${partnerConfig.name}`);

  // Constrói configuração dinâmica do Expo
  return {
    ...config,
    expo: {
      ...baseConfig,
      name: partnerConfig.name,
      slug: partnerConfig.slug,
      owner: partnerConfig.owner,
      version: partnerConfig.version || baseConfig.version,
      userInterfaceStyle: baseConfig.userInterfaceStyle || 'automatic',
      orientation: 'portrait', // 🔒 Bloquear orientação em portrait

      // iOS Config
      ios: {
        ...(baseConfig.ios || {}),
        supportsTablet: partnerConfig.ios?.supportsTablet ?? true,
        bundleIdentifier: partnerConfig.ios?.bundleIdentifier,
        buildNumber: partnerConfig.ios?.buildNumber,
        icon: partnerConfig.ios?.icon?.backgroundColor
          ? { backgroundColor: partnerConfig.ios.icon.backgroundColor }
          : undefined,
        infoPlist: {
          ...(baseConfig.ios?.infoPlist || {}),
          ...(partnerConfig.ios?.infoPlist || {}),
          NSFaceIDUsageDescription: 'Este app usa Face ID para autenticar seu login de forma segura.',
          UIViewControllerBasedStatusBarAppearance: false,
        },
      },

      // Android Config
      android: {
        ...(baseConfig.android || {}),
        package: partnerConfig.android?.package,
        versionCode: partnerConfig.android?.versionCode,
        adaptiveIcon: {
          foregroundImage: partnerDir
            ? path.join(partnerDir, 'assets/adaptive-icon.png')
            : baseConfig.android?.adaptiveIcon?.foregroundImage,
          backgroundColor: partnerConfig.android?.adaptiveIcon?.backgroundColor || '#ffffff',
        },
        softwareKeyboardLayoutMode: baseConfig.android?.softwareKeyboardLayoutMode,
        permissions: baseConfig.android?.permissions || [],
        screenOrientation: 'portrait', // 🔒 Bloquear orientação no Android
      },

      // Assets
      icon: partnerDir
        ? path.join(partnerDir, 'assets/icon.png')
        : baseConfig.icon,

      splash: {
        ...(baseConfig.splash || {}),
        image: partnerDir
          ? path.join(partnerDir, 'assets/splash-icon.png')
          : baseConfig.splash?.image,
        backgroundColor: partnerConfig.splash?.backgroundColor || '#ffffff',
        resizeMode: partnerConfig.splash?.resizeMode || baseConfig.splash?.resizeMode || 'contain',
      },

      // Web Config
      web: {
        ...(baseConfig.web || {}),
        favicon: partnerDir
          ? path.join(partnerDir, 'assets/favicon.png')
          : baseConfig.web?.favicon,
      },

      // Plugins (mantém os existentes)
      plugins: baseConfig.plugins,

      // Experiments
      experiments: baseConfig.experiments,

      // Extra config - disponível via expo-constants
      extra: {
        ...(baseConfig.extra || {}),
        tenantId,
        tenantName: partnerConfig.name,
        tenantSlug: partnerConfig.slug,
        ...(partnerConfig.extra || {}),
        eas: {
          projectId: partnerConfig.eas?.projectId || '8bfa2423-69b5-48bf-94c1-c4ded0716494',
        },
      },
    },
  };
};
