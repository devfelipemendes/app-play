#!/usr/bin/env node
/**
 * Script para sincronizar configurações dos tenants com o backend
 *
 * Uso:
 *   node scripts/sync-configs.js              # Sincroniza todos os tenants
 *   node scripts/sync-configs.js 46           # Sincroniza apenas o tenant 46
 *   node scripts/sync-configs.js --dry-run    # Mostra o que seria feito sem executar
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

// Configuração
const BACKEND_URL = process.env.BACKEND_URL || 'https://sistema.playmovel.com.br';
const BACKEND_API_KEY = process.env.BACKEND_API_KEY || process.env.ACCESS_TK;
const DRY_RUN = process.argv.includes('--dry-run');
const SPECIFIC_TENANT = process.argv.find(arg => /^\d+$/.test(arg));

/**
 * Baixa um asset (imagem) e salva localmente
 */
async function downloadAsset(url, destination) {
  try {
    console.log(`   📥 Downloading: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    if (!DRY_RUN) {
      await fs.writeFile(destination, response.data);
    }

    console.log(`   ✅ Saved: ${destination}`);
  } catch (error) {
    console.error(`   ❌ Failed to download ${url}:`, error.message);
  }
}

/**
 * Valida a configuração do tenant
 */
function validateTenantData(tenant) {
  const required = ['id', 'name', 'slug', 'appTheme'];
  const missing = required.filter(field => !tenant[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  // Valida appTheme
  const theme = typeof tenant.appTheme === 'string'
    ? JSON.parse(tenant.appTheme)
    : tenant.appTheme;

  if (!theme.colors || !theme.colors.primary || !theme.colors.secondary) {
    throw new Error('Invalid appTheme: missing colors.primary or colors.secondary');
  }

  return true;
}

/**
 * Sincroniza configuração de um tenant
 */
async function syncTenant(tenant) {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🏢 Syncing Tenant: ${tenant.name} (ID: ${tenant.id})`);
    console.log(`${'='.repeat(70)}`);

    // Valida dados
    validateTenantData(tenant);

    // Define diretório do parceiro
    const tenantDir = path.join(
      __dirname,
      '..',
      'partners',
      `partner-${tenant.id}-${tenant.slug}`
    );

    console.log(`📂 Directory: ${tenantDir}`);

    if (DRY_RUN) {
      console.log('   🔍 DRY RUN - No changes will be made');
    } else {
      // Cria estrutura de diretórios
      await fs.ensureDir(tenantDir);
      await fs.ensureDir(path.join(tenantDir, 'assets'));
    }

    // Parse do appTheme
    const appTheme = typeof tenant.appTheme === 'string'
      ? JSON.parse(tenant.appTheme)
      : tenant.appTheme;

    // 1. Salvar env.json
    const envConfig = {
      API_URL: tenant.apiUrl || BACKEND_URL,
      COMPANY_ID: tenant.id,
      PARCEIRO: tenant.name,
      ACCESS_TK: tenant.accessToken || '',
      APP_VERSION: tenant.appVersion || '1.0.0',
      NODE_ENV: 'production',
      ENABLE_ANALYTICS: tenant.enableAnalytics || false,
      ENABLE_CRASH_REPORTING: tenant.enableCrashReporting || false,
      FEATURES: tenant.features || {
        recharge: true,
        portability: true,
        support: true,
        plans: true,
        consumption: true,
      },
    };

    console.log('📝 Writing env.json');
    if (!DRY_RUN) {
      await fs.writeJSON(path.join(tenantDir, 'env.json'), envConfig, {
        spaces: 2,
      });
    }

    // 2. Salvar theme.json
    console.log('🎨 Writing theme.json');
    if (!DRY_RUN) {
      await fs.writeJSON(path.join(tenantDir, 'theme.json'), appTheme, {
        spaces: 2,
      });
    }

    // 3. Salvar app.config.json
    const appConfig = {
      name: tenant.appName || tenant.name,
      slug: tenant.slug,
      owner: tenant.expoOwner,
      version: tenant.appVersion || '1.0.0',
      ios: {
        supportsTablet: tenant.ios?.supportsTablet ?? true,
        bundleIdentifier: tenant.ios?.bundleIdentifier,
        buildNumber: tenant.ios?.buildNumber || '1',
      },
      android: {
        package: tenant.android?.packageName,
        versionCode: tenant.android?.versionCode || 1,
        adaptiveIcon: {
          backgroundColor: appTheme.colors?.primary || '#007AFF',
        },
      },
      splash: {
        backgroundColor: appTheme.colors?.primary || '#007AFF',
      },
      extra: {
        supportEmail: tenant.supportEmail,
        supportPhone: tenant.supportPhone,
        websiteUrl: tenant.websiteUrl,
        ...(tenant.extraConfig || {}),
      },
      eas: {
        projectId: tenant.easProjectId,
      },
    };

    console.log('📱 Writing app.config.json');
    if (!DRY_RUN) {
      await fs.writeJSON(path.join(tenantDir, 'app.config.json'), appConfig, {
        spaces: 2,
      });
    }

    // 4. Download de assets
    console.log('🖼️  Downloading assets...');

    if (tenant.assets) {
      const assetsToDownload = [
        { url: tenant.assets.icon, filename: 'icon.png' },
        { url: tenant.assets.adaptiveIcon, filename: 'adaptive-icon.png' },
        { url: tenant.assets.splash, filename: 'splash-icon.png' },
        { url: tenant.assets.favicon, filename: 'favicon.png' },
        { url: tenant.assets.logo, filename: 'logo.png' },
      ];

      for (const asset of assetsToDownload) {
        if (asset.url) {
          await downloadAsset(
            asset.url,
            path.join(tenantDir, 'assets', asset.filename)
          );
        }
      }
    } else {
      console.log('   ⚠️  No assets configuration found');
    }

    // 5. Criar README
    const readmeContent = `# Partner: ${tenant.name} (ID: ${tenant.id})

## Informações do Parceiro

- **Nome**: ${tenant.name}
- **Tenant ID**: ${tenant.id}
- **Slug**: ${tenant.slug}
- **Owner**: ${tenant.expoOwner || 'N/A'}

## Branding

### Cores
- **Primary**: ${appTheme.colors.primary}
- **Secondary**: ${appTheme.colors.secondary}
${appTheme.colors.accent ? `- **Accent**: ${appTheme.colors.accent}` : ''}

## Configurações de Build

### iOS
- **Bundle Identifier**: ${tenant.ios?.bundleIdentifier || 'N/A'}
- **Build Number**: ${tenant.ios?.buildNumber || '1'}

### Android
- **Package**: ${tenant.android?.packageName || 'N/A'}
- **Version Code**: ${tenant.android?.versionCode || '1'}

## API Configuration

- **Base URL**: ${tenant.apiUrl || BACKEND_URL}
- **Company ID**: ${tenant.id}

## Build Local

\`\`\`bash
TENANT_ID=${tenant.id} npx expo start
\`\`\`

## Build via EAS

\`\`\`bash
TENANT_ID=${tenant.id} eas build --platform all --profile production
\`\`\`

---
*Last synced: ${new Date().toISOString()}*
`;

    console.log('📄 Writing README.md');
    if (!DRY_RUN) {
      await fs.writeFile(path.join(tenantDir, 'README.md'), readmeContent);
    }

    console.log(`\n✅ Successfully synced: ${tenant.name}`);

  } catch (error) {
    console.error(`\n❌ Failed to sync tenant ${tenant.id}:`, error.message);
    throw error;
  }
}

/**
 * Busca tenants do backend e sincroniza
 */
async function syncAllTenants() {
  try {
    console.log('\n🚀 Starting tenant synchronization...\n');
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Dry Run: ${DRY_RUN ? 'YES' : 'NO'}\n`);

    // Busca lista de tenants
    const endpoint = SPECIFIC_TENANT
      ? `${BACKEND_URL}/api/tenants/${SPECIFIC_TENANT}`
      : `${BACKEND_URL}/api/tenants`;

    console.log(`📡 Fetching tenants from: ${endpoint}\n`);

    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${BACKEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    const tenants = Array.isArray(response.data)
      ? response.data
      : [response.data];

    console.log(`Found ${tenants.length} tenant(s) to sync`);

    // Sincroniza cada tenant
    let successCount = 0;
    let failCount = 0;

    for (const tenant of tenants) {
      try {
        await syncTenant(tenant);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Skipping tenant ${tenant.id} due to error`);
      }
    }

    // Resumo
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 Synchronization Summary');
    console.log(`${'='.repeat(70)}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📦 Total: ${tenants.length}`);
    console.log(`${'='.repeat(70)}\n`);

    if (DRY_RUN) {
      console.log('⚠️  This was a DRY RUN - no changes were made');
      console.log('Run without --dry-run to apply changes\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);

    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }

    process.exit(1);
  }
}

// Executa
if (require.main === module) {
  syncAllTenants().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { syncTenant, syncAllTenants };
