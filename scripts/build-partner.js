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

if (!partnerId) {
  console.error('❌ Usage: node scripts/build-partner.js <TENANT_ID|all> [--platform=ios|android|all] [--profile=production|preview] [--no-wait] [--auto-submit]');
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
async function buildPartner(tenantId, platform, profile) {
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
      const easCommand = [
        'eas build',
        `--platform ${plt}`,
        `--profile ${profile}`,
        '--non-interactive',
      ];

      if (noWait) {
        easCommand.push('--no-wait');
      }

      if (autoSubmit && profile === 'production') {
        easCommand.push('--auto-submit');
      }

      const command = easCommand.join(' ');

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
async function buildAllPartners(platform, profile) {
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
        await buildPartner(tenantId, platform, profile);
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
async function listBuilds(tenantId) {
  try {
    console.log(`\n📋 Listing builds for tenant ${tenantId}...\n`);

    const { config } = await validateTenant(tenantId);

    execSync('eas build:list --limit 5', {
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
 * Main
 */
async function main() {
  try {
    // Verifica se EAS CLI está instalado
    try {
      execSync('eas --version', { stdio: 'pipe' });
    } catch {
      console.error('❌ EAS CLI not found. Install it with: npm install -g eas-cli');
      process.exit(1);
    }

    // Comando especial: listar builds
    if (process.argv.includes('--list')) {
      await listBuilds(partnerId === 'all' ? '46' : partnerId);
      return;
    }

    // Build
    if (partnerId === 'all') {
      await buildAllPartners(platformArg, profileArg);
    } else {
      await buildPartner(partnerId, platformArg, profileArg);
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
