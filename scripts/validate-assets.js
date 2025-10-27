#!/usr/bin/env node
/**
 * Script de Validação de Assets WhiteLabel
 *
 * Valida se os assets de um parceiro estão corretos:
 * - Verifica existência dos arquivos
 * - Valida dimensões das imagens
 * - Testa se app.config.js carrega corretamente
 *
 * Uso:
 *   node scripts/validate-assets.js <TENANT_ID>
 *   node scripts/validate-assets.js 46
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
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
 * Encontra o diretório do parceiro
 */
function findPartnerDir(tenantId) {
  const partnersDir = path.join(__dirname, '..', 'partners');

  if (!fs.existsSync(partnersDir)) {
    return null;
  }

  const tenants = fs.readdirSync(partnersDir);
  const partnerDir = tenants.find(dir => dir.startsWith(`partner-${tenantId}-`));

  if (!partnerDir) {
    return null;
  }

  return path.join(partnersDir, partnerDir);
}

/**
 * Valida se arquivo existe
 */
function validateFileExists(filePath, fileName) {
  if (fs.existsSync(filePath)) {
    success(`${fileName} encontrado`);
    return true;
  } else {
    error(`${fileName} NÃO ENCONTRADO`);
    info(`  Caminho esperado: ${filePath}`);
    return false;
  }
}

/**
 * Obtém dimensões da imagem PNG (simplificado)
 */
function getPngDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    // PNG signature
    if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      return null;
    }

    // Lê dimensões do IHDR chunk
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);

    return { width, height };
  } catch (err) {
    return null;
  }
}

/**
 * Valida dimensões da imagem
 */
function validateImageDimensions(filePath, fileName, expectedWidth, expectedHeight, flexible = false) {
  const dimensions = getPngDimensions(filePath);

  if (!dimensions) {
    warning(`  Não foi possível ler dimensões de ${fileName}`);
    return false;
  }

  const { width, height } = dimensions;
  info(`  Dimensões: ${width}x${height}px`);

  if (flexible) {
    // Para splash, apenas sugerimos dimensões mínimas
    if (width >= expectedWidth && height >= expectedHeight) {
      success(`  Dimensões adequadas (mínimo recomendado: ${expectedWidth}x${expectedHeight}px)`);
      return true;
    } else {
      warning(`  Dimensões abaixo do recomendado (${expectedWidth}x${expectedHeight}px)`);
      return false;
    }
  } else {
    // Para ícones, dimensões devem ser exatas
    if (width === expectedWidth && height === expectedHeight) {
      success(`  Dimensões corretas (${expectedWidth}x${expectedHeight}px)`);
      return true;
    } else {
      error(`  Dimensões incorretas! Esperado: ${expectedWidth}x${expectedHeight}px`);
      return false;
    }
  }
}

/**
 * Valida arquivo de configuração
 */
function validateAppConfig(partnerDir) {
  const configPath = path.join(partnerDir, 'app.config.json');

  if (!fs.existsSync(configPath)) {
    error('app.config.json NÃO ENCONTRADO');
    return null;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    success('app.config.json válido');
    return config;
  } catch (err) {
    error('app.config.json com erro de sintaxe JSON');
    console.error(`  ${err.message}`);
    return null;
  }
}

/**
 * Testa se app.config.js carrega corretamente
 */
function testAppConfigJs(tenantId) {
  try {
    // Configura variável de ambiente
    process.env.TENANT_ID = tenantId;

    // Limpa cache do require
    const appConfigPath = path.join(__dirname, '..', 'app.config.js');
    delete require.cache[require.resolve(appConfigPath)];

    // Carrega app.config.js
    const getConfig = require(appConfigPath);
    const config = getConfig({ config: { expo: {} } });

    if (!config || !config.expo) {
      error('app.config.js não retornou configuração válida');
      return false;
    }

    success('app.config.js carregou configuração com sucesso');

    // Mostra informações importantes
    info(`  Nome do app: ${config.expo.name}`);
    info(`  Slug: ${config.expo.slug}`);
    info(`  Bundle ID (iOS): ${config.expo.ios?.bundleIdentifier}`);
    info(`  Package (Android): ${config.expo.android?.package}`);

    // Valida se os paths dos assets estão corretos
    if (config.expo.icon) {
      info(`  Icon path: ${config.expo.icon}`);
    }
    if (config.expo.splash?.image) {
      info(`  Splash path: ${config.expo.splash.image}`);
    }
    if (config.expo.android?.adaptiveIcon?.foregroundImage) {
      info(`  Adaptive icon path: ${config.expo.android.adaptiveIcon.foregroundImage}`);
    }

    return true;
  } catch (err) {
    error('Erro ao carregar app.config.js');
    console.error(`  ${err.message}`);
    return false;
  }
}

/**
 * Valida cores no app.config.json
 */
function validateColors(config) {
  let valid = true;

  // Valida splash backgroundColor
  if (config.splash?.backgroundColor) {
    success(`Splash backgroundColor: ${config.splash.backgroundColor}`);
  } else {
    warning('splash.backgroundColor não definido (usará #ffffff)');
    valid = false;
  }

  // Valida adaptive icon backgroundColor
  if (config.android?.adaptiveIcon?.backgroundColor) {
    success(`Android adaptiveIcon backgroundColor: ${config.android.adaptiveIcon.backgroundColor}`);
  } else {
    warning('android.adaptiveIcon.backgroundColor não definido (usará #ffffff)');
    valid = false;
  }

  // Valida iOS icon backgroundColor (opcional)
  if (config.ios?.icon?.backgroundColor) {
    success(`iOS icon backgroundColor: ${config.ios.icon.backgroundColor}`);
  } else {
    info('iOS icon backgroundColor não definido (opcional)');
  }

  return valid;
}

/**
 * Gera relatório de tamanho dos arquivos
 */
function showFileSizes(assetsDir) {
  const files = ['icon.png', 'adaptive-icon.png', 'splash-icon.png', 'favicon.png'];

  console.log('\n📊 Tamanho dos Arquivos:');
  files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      info(`  ${file}: ${sizeKB} KB`);
    }
  });
}

/**
 * Main
 */
function main() {
  const tenantId = process.argv[2];

  if (!tenantId) {
    console.error('❌ Uso: node scripts/validate-assets.js <TENANT_ID>');
    console.error('   Exemplo: node scripts/validate-assets.js 46');
    process.exit(1);
  }

  header(`Validação de Assets - Tenant ${tenantId}`);

  // 1. Encontra diretório do parceiro
  info(`Procurando por partner-${tenantId}-...`);
  const partnerDir = findPartnerDir(tenantId);

  if (!partnerDir) {
    error(`Tenant ${tenantId} não encontrado em /partners`);
    process.exit(1);
  }

  const partnerName = path.basename(partnerDir);
  success(`Parceiro encontrado: ${partnerName}`);
  console.log(`   Caminho: ${partnerDir}\n`);

  let totalErrors = 0;
  let totalWarnings = 0;

  // 2. Valida app.config.json
  header('1. Validando app.config.json');
  const appConfig = validateAppConfig(partnerDir);
  if (!appConfig) {
    totalErrors++;
  } else {
    console.log('');
    if (!validateColors(appConfig)) {
      totalWarnings++;
    }
  }

  // 3. Valida existência dos assets
  header('2. Validando Existência dos Assets');
  const assetsDir = path.join(partnerDir, 'assets');

  if (!fs.existsSync(assetsDir)) {
    error('Diretório /assets não encontrado!');
    info(`  Crie: ${assetsDir}`);
    totalErrors++;
  } else {
    success('Diretório /assets encontrado\n');

    // Valida cada asset
    const assets = [
      { file: 'icon.png', name: 'Icon Principal' },
      { file: 'adaptive-icon.png', name: 'Adaptive Icon (Android)' },
      { file: 'splash-icon.png', name: 'Splash Screen' },
      { file: 'favicon.png', name: 'Favicon (Web)' },
    ];

    assets.forEach(asset => {
      const filePath = path.join(assetsDir, asset.file);
      if (!validateFileExists(filePath, asset.name)) {
        totalErrors++;
      }
    });
  }

  // 4. Valida dimensões das imagens
  if (fs.existsSync(assetsDir)) {
    header('3. Validando Dimensões das Imagens');

    const iconPath = path.join(assetsDir, 'icon.png');
    if (fs.existsSync(iconPath)) {
      console.log('icon.png:');
      if (!validateImageDimensions(iconPath, 'icon.png', 1024, 1024)) {
        totalErrors++;
      }
      console.log('');
    }

    const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
    if (fs.existsSync(adaptiveIconPath)) {
      console.log('adaptive-icon.png:');
      if (!validateImageDimensions(adaptiveIconPath, 'adaptive-icon.png', 1024, 1024)) {
        totalErrors++;
      }
      console.log('');
    }

    const splashPath = path.join(assetsDir, 'splash-icon.png');
    if (fs.existsSync(splashPath)) {
      console.log('splash-icon.png:');
      if (!validateImageDimensions(splashPath, 'splash-icon.png', 1242, 2436, true)) {
        totalWarnings++;
      }
      console.log('');
    }

    const faviconPath = path.join(assetsDir, 'favicon.png');
    if (fs.existsSync(faviconPath)) {
      console.log('favicon.png:');
      if (!validateImageDimensions(faviconPath, 'favicon.png', 48, 48)) {
        totalErrors++;
      }
      console.log('');
    }

    showFileSizes(assetsDir);
  }

  // 5. Testa app.config.js
  header('4. Testando app.config.js');
  if (!testAppConfigJs(tenantId)) {
    totalErrors++;
  }

  // 6. Relatório Final
  header('Resultado da Validação');

  if (totalErrors === 0 && totalWarnings === 0) {
    success('✨ Todos os assets estão corretos!');
    success('Pronto para build!');
    console.log('');
    info('Próximos passos:');
    info(`  1. Testar localmente: TENANT_ID=${tenantId} npx expo start`);
    info(`  2. Build preview: node scripts/build-partner.js ${tenantId} --platform=android --profile=preview`);
    console.log('');
    process.exit(0);
  } else {
    if (totalErrors > 0) {
      error(`${totalErrors} erro(s) encontrado(s)`);
    }
    if (totalWarnings > 0) {
      warning(`${totalWarnings} aviso(s) encontrado(s)`);
    }
    console.log('');
    info('Corrija os problemas acima antes de fazer build.');
    console.log('');
    process.exit(1);
  }
}

main();
