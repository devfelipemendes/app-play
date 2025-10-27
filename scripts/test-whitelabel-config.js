#!/usr/bin/env node
/**
 * Script de Teste de Configuração WhiteLabel
 *
 * Testa se o app.config.js carrega corretamente para todos os parceiros
 * Valida que os assets (ícone, splash) estão sendo carregados corretamente
 * Verifica que não há quebras no sistema WhiteLabel
 *
 * Uso:
 *   node scripts/test-whitelabel-config.js
 *   node scripts/test-whitelabel-config.js --tenant=46
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol}${colors.reset} ${message}`);
}

function success(message) {
  log(colors.green, '✓', message);
}

function error(message) {
  log(colors.red, '✗', message);
}

function warning(message) {
  log(colors.yellow, '⚠', message);
}

function info(message) {
  log(colors.blue, 'ℹ', message);
}

function header(message) {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  ${message}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);
}

/**
 * Lista todos os parceiros disponíveis
 */
function getAllTenants() {
  const partnersDir = path.join(__dirname, '..', 'partners');

  if (!fs.existsSync(partnersDir)) {
    return [];
  }

  const tenants = fs.readdirSync(partnersDir)
    .filter(dir => dir.startsWith('partner-'))
    .map(dir => {
      const match = dir.match(/^partner-(\d+)-(.+)$/);
      if (match) {
        return {
          id: match[1],
          slug: match[2],
          dir: path.join(partnersDir, dir),
        };
      }
      return null;
    })
    .filter(Boolean);

  return tenants;
}

/**
 * Testa o app.config.js para um tenant específico
 */
function testTenantConfig(tenantId) {
  try {
    // Configura variável de ambiente
    process.env.TENANT_ID = tenantId;
    process.env.EXPO_PUBLIC_TENANT_ID = tenantId;

    // Limpa cache do require
    const appConfigPath = path.join(__dirname, '..', 'app.config.js');
    delete require.cache[require.resolve(appConfigPath)];

    // Carrega app.config.js
    const getConfig = require(appConfigPath);
    const config = getConfig({ config: { expo: {} } });

    if (!config || !config.expo) {
      return {
        success: false,
        error: 'app.config.js não retornou configuração válida',
      };
    }

    const expo = config.expo;

    // Valida campos obrigatórios
    const validations = {
      name: expo.name,
      slug: expo.slug,
      icon: expo.icon,
      splash: expo.splash?.image,
      splashBackgroundColor: expo.splash?.backgroundColor,
      iosBundleId: expo.ios?.bundleIdentifier,
      androidPackage: expo.android?.package,
      adaptiveIcon: expo.android?.adaptiveIcon?.foregroundImage,
      adaptiveIconBg: expo.android?.adaptiveIcon?.backgroundColor,
      tenantId: expo.extra?.tenantId,
    };

    // Verifica se todos os campos existem
    const missing = [];
    const warnings = [];

    if (!validations.name) missing.push('expo.name');
    if (!validations.slug) missing.push('expo.slug');
    if (!validations.icon) missing.push('expo.icon');
    if (!validations.splash) missing.push('expo.splash.image');
    if (!validations.iosBundleId) missing.push('expo.ios.bundleIdentifier');
    if (!validations.androidPackage) missing.push('expo.android.package');
    if (!validations.adaptiveIcon) missing.push('expo.android.adaptiveIcon.foregroundImage');
    if (!validations.tenantId) missing.push('expo.extra.tenantId');

    // Avisos (não críticos)
    if (!validations.splashBackgroundColor) warnings.push('splash.backgroundColor não definido');
    if (!validations.adaptiveIconBg) warnings.push('adaptiveIcon.backgroundColor não definido');

    // Verifica se os arquivos de assets existem
    const assetChecks = [];
    const projectRoot = path.join(__dirname, '..');

    if (validations.icon) {
      // O path pode ser absoluto ou relativo
      const iconPath = path.isAbsolute(validations.icon)
        ? validations.icon
        : path.join(projectRoot, validations.icon);
      if (!fs.existsSync(iconPath)) {
        assetChecks.push(`Arquivo não encontrado: ${validations.icon}`);
      }
    }

    if (validations.splash) {
      const splashPath = path.isAbsolute(validations.splash)
        ? validations.splash
        : path.join(projectRoot, validations.splash);
      if (!fs.existsSync(splashPath)) {
        assetChecks.push(`Arquivo não encontrado: ${validations.splash}`);
      }
    }

    if (validations.adaptiveIcon) {
      const adaptivePath = path.isAbsolute(validations.adaptiveIcon)
        ? validations.adaptiveIcon
        : path.join(projectRoot, validations.adaptiveIcon);
      if (!fs.existsSync(adaptivePath)) {
        assetChecks.push(`Arquivo não encontrado: ${validations.adaptiveIcon}`);
      }
    }

    return {
      success: missing.length === 0 && assetChecks.length === 0,
      config: validations,
      missing,
      warnings,
      assetErrors: assetChecks,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      stack: err.stack,
    };
  }
}

/**
 * Exibe resultado do teste
 */
function displayTestResult(tenantId, slug, result) {
  console.log(`\n${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.magenta}  Tenant ${tenantId} (${slug})${colors.reset}`);
  console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  if (result.error) {
    error(`Erro ao carregar configuração`);
    console.error(`  ${result.error}`);
    if (result.stack) {
      console.error(`\n${result.stack}`);
    }
    return false;
  }

  if (result.missing.length > 0) {
    error(`${result.missing.length} campo(s) obrigatório(s) ausente(s):`);
    result.missing.forEach(field => {
      console.log(`  - ${field}`);
    });
  }

  if (result.assetErrors.length > 0) {
    error(`${result.assetErrors.length} arquivo(s) de asset não encontrado(s):`);
    result.assetErrors.forEach(err => {
      console.log(`  - ${err}`);
    });
  }

  if (result.warnings.length > 0) {
    warning(`${result.warnings.length} aviso(s):`);
    result.warnings.forEach(warn => {
      console.log(`  - ${warn}`);
    });
  }

  if (result.success) {
    success('Configuração válida!');
    console.log('');
    info('Configuração carregada:');
    info(`  Nome: ${result.config.name}`);
    info(`  Slug: ${result.config.slug}`);
    info(`  Tenant ID: ${result.config.tenantId}`);
    info(`  Bundle ID (iOS): ${result.config.iosBundleId}`);
    info(`  Package (Android): ${result.config.androidPackage}`);
    info(`  Icon: ${result.config.icon}`);
    info(`  Splash: ${result.config.splash}`);
    info(`  Adaptive Icon: ${result.config.adaptiveIcon}`);
  }

  return result.success;
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  const tenantArg = args.find(arg => arg.startsWith('--tenant='));
  const specificTenant = tenantArg ? tenantArg.split('=')[1] : null;

  header('Teste de Configuração WhiteLabel');

  // Lista todos os parceiros
  const tenants = getAllTenants();

  if (tenants.length === 0) {
    error('Nenhum parceiro encontrado em /partners');
    process.exit(1);
  }

  info(`Encontrados ${tenants.length} parceiro(s):`);
  tenants.forEach(tenant => {
    console.log(`  - Tenant ${tenant.id}: ${tenant.slug}`);
  });

  // Se um tenant específico foi solicitado, testa apenas ele
  const tenantsToTest = specificTenant
    ? tenants.filter(t => t.id === specificTenant)
    : tenants;

  if (tenantsToTest.length === 0) {
    error(`Tenant ${specificTenant} não encontrado`);
    process.exit(1);
  }

  // Testa cada tenant
  const results = tenantsToTest.map(tenant => {
    const result = testTenantConfig(tenant.id);
    const success = displayTestResult(tenant.id, tenant.slug, result);
    return { tenant, success };
  });

  // Relatório Final
  header('Resultado dos Testes');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('');
  if (passed > 0) {
    success(`${passed} parceiro(s) passaram nos testes`);
  }
  if (failed > 0) {
    error(`${failed} parceiro(s) falharam nos testes`);
  }

  console.log('');

  if (failed === 0) {
    success('🎉 Todos os testes passaram!');
    success('O sistema WhiteLabel está configurado corretamente');
    console.log('');
    info('Próximos passos:');
    info('  1. Testar localmente: TENANT_ID=46 npx expo start');
    info('  2. Validar assets: node scripts/validate-assets.js 46');
    info('  3. Build preview: node scripts/build-partner.js 46 --profile=preview');
    console.log('');
    process.exit(0);
  } else {
    error('Alguns testes falharam. Corrija os problemas acima.');
    console.log('');
    process.exit(1);
  }
}

main();
