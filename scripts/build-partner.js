#!/usr/bin/env node
/**
 * Script para build de apps por parceiro
 *
 * Uso:
 *   node scripts/build-partner.js 46                    # Build apenas tenant 46
 *   node scripts/build-partner.js all                   # Build todos os tenants
 *   node scripts/build-partner.js 46 --platform ios     # Build apenas iOS
 *   node scripts/build-partner.js 46 --profile preview  # Build com profile preview
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

// Configuração
const partnerId = process.argv[2];
const platformArg = process.argv.find(arg => arg.startsWith('--platform='))?.split('=')[1] || 'all';
const profileArg = process.argv.find(arg => arg.startsWith('--profile='))?.split('=')[1] || 'production';
const noWait = process.argv.includes('--no-wait');
const autoSubmit = process.argv.includes('--auto-submit');
const interactive = process.argv.includes('--interactive');

if (!partnerId) {
  console.error('❌ Usage: node scripts/build-partner.js <TENANT_ID|all> [OPTIONS]');
  console.error('');
  console.error('Options:');
  console.error('  --platform=<ios|android|all>    Platform to build (default: all)');
  console.error('  --profile=<dev|preview|prod>    Build profile (default: production)');
  console.error('  --interactive                   Allow interactive prompts (for first build)');
  console.error('  --no-wait                       Don\'t wait for build to complete');
  console.error('  --auto-submit                   Auto-submit to stores (production only)');
  console.error('  --list                          List recent builds');
  console.error('');
  console.error('Examples:');
  console.error('  node scripts/build-partner.js 46 --platform=android --profile=preview');
  console.error('  node scripts/build-partner.js 46 --platform=ios --profile=development --interactive');
  console.error('  node scripts/build-partner.js all --platform=android --profile=production');
  process.exit(1);
}

/**
 * Valida se o tenant existe
 */
async function validateTenant(tenantId) {
  const partnersDir = path.join(__dirname, '..', 'partners');

  if (!fs.existsSync(partnersDir)) {
    throw new Error('Partners directory not found. Run sync-configs.js first.');
  }

  const tenants = await fs.readdir(partnersDir);
  const tenantDir = tenants.find(t => t.startsWith(`partner-${tenantId}-`));

  if (!tenantDir) {
    throw new Error(`Tenant ${tenantId} not found in partners directory`);
  }

  // Valida se tem app.config.json
  const configPath = path.join(partnersDir, tenantDir, 'app.config.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`app.config.json not found for tenant ${tenantId}`);
  }

  return {
    tenantDir,
    config: await fs.readJSON(configPath),
  };
}

/**
 * Executa build para um parceiro
 */
async function buildPartner(tenantId, platform, profile, easCmd = 'eas', isInteractive = false) {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 Building app for Tenant ID: ${tenantId}`);
    console.log(`${'='.repeat(70)}`);

    // Valida tenant
    const { tenantDir, config } = await validateTenant(tenantId);

    console.log(`📱 App Name: ${config.name}`);
    console.log(`📦 Slug: ${config.slug}`);
    console.log(`🎨 Platform: ${platform}`);
    console.log(`🏗️  Profile: ${profile}`);
    console.log(`📂 Directory: ${tenantDir}\n`);

    // Determina plataformas
    const platforms = platform === 'all' ? ['ios', 'android'] : [platform];

    // Build para cada plataforma
    for (const plt of platforms) {
      console.log(`\n🔨 Building for ${plt.toUpperCase()}...`);

      // Monta comando EAS
      const easBuildArgs = [
        'build',
        `--platform ${plt}`,
        `--profile ${profile}`,
      ];

      // Só adiciona --non-interactive se não for modo interativo
      if (!isInteractive) {
        easBuildArgs.push('--non-interactive');
      }

      if (noWait) {
        easBuildArgs.push('--no-wait');
      }

      if (autoSubmit && profile === 'production') {
        easBuildArgs.push('--auto-submit');
      }

      const command = `${easCmd} ${easBuildArgs.join(' ')}`;

      console.log(`   📝 Command: ${command}`);
      console.log(`   ⏳ Starting build...\n`);

      try {
        // Executa build com TENANT_ID configurado
        execSync(command, {
          stdio: 'inherit',
          env: {
            ...process.env,
            TENANT_ID: tenantId,
            EXPO_PUBLIC_TENANT_ID: tenantId,
          },
        });

        console.log(`\n   ✅ Build queued for ${plt}: ${config.name}`);
      } catch (error) {
        console.error(`\n   ❌ Build failed for ${plt}: ${config.name}`);
        throw error;
      }
    }

    console.log(`\n✅ All builds queued for: ${config.name}\n`);

  } catch (error) {
    console.error(`\n❌ Failed to build tenant ${tenantId}:`, error.message);
    throw error;
  }
}

/**
 * Build de todos os parceiros
 */
async function buildAllPartners(platform, profile, easCmd = 'eas', isInteractive = false) {
  try {
    console.log('\n🚀 Building apps for all tenants...\n');

    const partnersDir = path.join(__dirname, '..', 'partners');
    const tenants = await fs.readdir(partnersDir);

    const tenantIds = tenants
      .filter(dir => dir.startsWith('partner-'))
      .map(dir => dir.match(/partner-(\d+)-/)[1]);

    console.log(`Found ${tenantIds.length} tenant(s): ${tenantIds.join(', ')}\n`);

    let successCount = 0;
    let failCount = 0;

    for (const tenantId of tenantIds) {
      try {
        await buildPartner(tenantId, platform, profile, easCmd, isInteractive);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Skipping tenant ${tenantId} due to error\n`);
      }
    }

    // Resumo
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 Build Summary');
    console.log(`${'='.repeat(70)}`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📦 Total: ${tenantIds.length}`);
    console.log(`${'='.repeat(70)}\n`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

/**
 * Lista builds recentes
 */
async function listBuilds(tenantId, easCmd = 'eas') {
  try {
    console.log(`\n📋 Listing builds for tenant ${tenantId}...\n`);

    const { config } = await validateTenant(tenantId);

    execSync(`${easCmd} build:list --limit 5`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        TENANT_ID: tenantId,
      },
    });
  } catch (error) {
    console.error('❌ Failed to list builds:', error.message);
    process.exit(1);
  }
}

/**
 * Verifica disponibilidade do EAS CLI
 */
function checkEasCli() {
  // Tenta 'eas' primeiro (instalação global)
  try {
    execSync('eas --version', { stdio: 'pipe' });
    return 'eas';
  } catch {
    // Se 'eas' não funcionar, tenta 'npx eas' (fallback)
    try {
      execSync('npx eas --version', { stdio: 'pipe' });
      console.log('ℹ️  Using "npx eas" (global installation not found in PATH)');
      console.log('💡 Tip: Restart your terminal to use "eas" directly\n');
      return 'npx eas';
    } catch {
      console.error('❌ EAS CLI not found.');
      console.error('');
      console.error('Please install it with:');
      console.error('  npm install -g eas-cli');
      console.error('');
      console.error('Then restart your terminal and try again.');
      process.exit(1);
    }
  }
}

/**
 * Main
 */
async function main() {
  try {
    // Verifica se EAS CLI está instalado e retorna o comando correto
    const easCommand = checkEasCli();

    // Comando especial: listar builds
    if (process.argv.includes('--list')) {
      await listBuilds(partnerId === 'all' ? '46' : partnerId, easCommand);
      return;
    }

    // Mostra aviso se for primeiro build sem --interactive
    if (!interactive && (profileArg === 'preview' || profileArg === 'production' || profileArg === 'production-aab')) {
      console.log('');
      console.log('⚠️  Note: If this is your first build, you may need to use --interactive');
      console.log('   This allows EAS to generate keystores/certificates interactively.');
      console.log('');
      console.log('   If build fails, retry with:');
      console.log(`   node scripts/build-partner.js ${partnerId} --platform=${platformArg} --profile=${profileArg} --interactive`);
      console.log('');
    }

    // Build
    if (partnerId === 'all') {
      await buildAllPartners(platformArg, profileArg, easCommand, interactive);
    } else {
      await buildPartner(partnerId, platformArg, profileArg, easCommand, interactive);
    }

  } catch (error) {
    console.error('\n❌ Unhandled error:', error.message);
    process.exit(1);
  }
}

// Executa
if (require.main === module) {
  main();
}

module.exports = { buildPartner, buildAllPartners };
