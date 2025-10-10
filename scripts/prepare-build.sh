#!/bin/bash
###############################################################################
# Script de preparação para build multi-tenant
#
# Este script prepara o ambiente para build de um tenant específico
# Deve ser executado antes de iniciar o processo de build
#
# Uso:
#   ./scripts/prepare-build.sh 46              # Prepara tenant 46
#   ./scripts/prepare-build.sh all             # Valida todos os tenants
#   ./scripts/prepare-build.sh 46 --validate   # Apenas valida configuração
###############################################################################

set -e  # Exit on error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuração
TENANT_ID=${1:-"46"}
VALIDATE_ONLY=false

if [[ "$2" == "--validate" ]]; then
  VALIDATE_ONLY=true
fi

# Funções auxiliares
log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

###############################################################################
# Valida se o tenant existe
###############################################################################
validate_tenant() {
  local tenant_id=$1
  local partners_dir="partners"

  log_info "Validating tenant: $tenant_id"

  # Verifica se diretório partners existe
  if [ ! -d "$partners_dir" ]; then
    log_error "Partners directory not found: $partners_dir"
    log_info "Run 'node scripts/sync-configs.js' first"
    return 1
  fi

  # Procura diretório do tenant
  tenant_dir=$(find "$partners_dir" -maxdepth 1 -type d -name "partner-${tenant_id}-*" | head -n 1)

  if [ -z "$tenant_dir" ]; then
    log_error "Tenant $tenant_id not found in $partners_dir"
    return 1
  fi

  log_success "Found tenant directory: $tenant_dir"

  # Valida arquivos necessários
  required_files=(
    "app.config.json"
    "env.json"
    "theme.json"
  )

  for file in "${required_files[@]}"; do
    if [ ! -f "$tenant_dir/$file" ]; then
      log_error "Missing required file: $tenant_dir/$file"
      return 1
    fi
  done

  log_success "All configuration files found"

  # Valida assets
  required_assets=(
    "assets/icon.png"
    "assets/adaptive-icon.png"
    "assets/splash-icon.png"
  )

  for asset in "${required_assets[@]}"; do
    if [ ! -f "$tenant_dir/$asset" ]; then
      log_warning "Missing asset: $tenant_dir/$asset"
    fi
  done

  # Valida JSON
  log_info "Validating JSON files..."

  if ! jq empty "$tenant_dir/app.config.json" 2>/dev/null; then
    log_error "Invalid JSON: app.config.json"
    return 1
  fi

  if ! jq empty "$tenant_dir/env.json" 2>/dev/null; then
    log_error "Invalid JSON: env.json"
    return 1
  fi

  if ! jq empty "$tenant_dir/theme.json" 2>/dev/null; then
    log_error "Invalid JSON: theme.json"
    return 1
  fi

  log_success "All JSON files are valid"

  # Exibe informações do tenant
  app_name=$(jq -r '.name' "$tenant_dir/app.config.json")
  bundle_id=$(jq -r '.ios.bundleIdentifier' "$tenant_dir/app.config.json")
  package_name=$(jq -r '.android.package' "$tenant_dir/app.config.json")

  echo ""
  log_info "Tenant Information:"
  echo "  📱 App Name: $app_name"
  echo "  🍎 iOS Bundle: $bundle_id"
  echo "  🤖 Android Package: $package_name"
  echo ""

  return 0
}

###############################################################################
# Prepara ambiente para build
###############################################################################
prepare_build() {
  local tenant_id=$1

  log_info "Preparing build environment for tenant: $tenant_id"

  # Exporta variável de ambiente
  export TENANT_ID=$tenant_id
  export EXPO_PUBLIC_TENANT_ID=$tenant_id

  log_success "Environment variables set:"
  echo "  TENANT_ID=$TENANT_ID"
  echo "  EXPO_PUBLIC_TENANT_ID=$EXPO_PUBLIC_TENANT_ID"
  echo ""

  # Verifica se EAS CLI está instalado
  if ! command -v eas &> /dev/null; then
    log_warning "EAS CLI not found"
    log_info "Install with: npm install -g eas-cli"
  else
    eas_version=$(eas --version)
    log_success "EAS CLI installed: $eas_version"
  fi

  # Verifica se está logado no Expo
  if ! eas whoami &> /dev/null; then
    log_warning "Not logged in to Expo"
    log_info "Login with: eas login"
  else
    expo_user=$(eas whoami)
    log_success "Logged in as: $expo_user"
  fi

  echo ""
  log_success "Build environment ready!"
  echo ""
  log_info "Next steps:"
  echo "  1. Run: node scripts/build-partner.js $tenant_id"
  echo "  2. Or: TENANT_ID=$tenant_id eas build --platform all"
  echo ""
}

###############################################################################
# Valida todos os tenants
###############################################################################
validate_all_tenants() {
  log_info "Validating all tenants..."
  echo ""

  local partners_dir="partners"
  local success_count=0
  local fail_count=0

  for tenant_dir in "$partners_dir"/partner-*; do
    if [ -d "$tenant_dir" ]; then
      tenant_id=$(basename "$tenant_dir" | grep -oP 'partner-\K\d+')

      echo "========================================================================"
      if validate_tenant "$tenant_id"; then
        ((success_count++))
      else
        ((fail_count++))
      fi
      echo "========================================================================"
      echo ""
    fi
  done

  echo ""
  log_info "Validation Summary:"
  echo "  ✅ Success: $success_count"
  echo "  ❌ Failed: $fail_count"
  echo ""
}

###############################################################################
# Main
###############################################################################
main() {
  echo ""
  echo "========================================================================"
  echo "🏗️  Multi-Tenant Build Preparation"
  echo "========================================================================"
  echo ""

  # Verifica se jq está instalado (para validação de JSON)
  if ! command -v jq &> /dev/null; then
    log_warning "jq not found (JSON validation will be skipped)"
    log_info "Install jq: https://stedolan.github.io/jq/download/"
    echo ""
  fi

  if [ "$TENANT_ID" == "all" ]; then
    validate_all_tenants
  elif [ "$VALIDATE_ONLY" == true ]; then
    validate_tenant "$TENANT_ID"
  else
    if validate_tenant "$TENANT_ID"; then
      prepare_build "$TENANT_ID"
    else
      log_error "Validation failed. Build preparation aborted."
      exit 1
    fi
  fi

  echo "========================================================================"
  echo ""
}

# Executa
main
