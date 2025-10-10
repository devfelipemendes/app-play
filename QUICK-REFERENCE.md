# ⚡ Quick Reference - WhiteLabel Multi-Tenant

Referência rápida de comandos e operações mais usadas.

---

## 🚀 Comandos de Desenvolvimento

```bash
# Iniciar desenvolvimento (tenant padrão: 46)
npm start

# Iniciar com tenant específico
TENANT_ID=47 npx expo start

# Plataformas específicas
npm run android
npm run ios
npm run web
```

---

## 🔄 Operações Multi-Tenant

### Sincronizar Configurações

```bash
# Sincronizar TODOS os tenants do backend
node scripts/sync-configs.js

# Sincronizar tenant específico
node scripts/sync-configs.js 46

# Preview sem aplicar mudanças (dry run)
node scripts/sync-configs.js --dry-run
```

### Validar Configuração

```bash
# Validar tenant específico
./scripts/prepare-build.sh 46 --validate

# Validar todos os tenants
./scripts/prepare-build.sh all --validate
```

### Build

```bash
# Build automático com script
node scripts/build-partner.js 46
node scripts/build-partner.js 46 --platform=ios
node scripts/build-partner.js 46 --platform=android
node scripts/build-partner.js all

# Build direto com EAS
TENANT_ID=46 eas build --platform all --profile production
TENANT_ID=46 eas build --platform ios --profile preview

# Listar builds recentes
eas build:list --limit 10
```

---

## 📁 Estrutura de Diretórios

```
partners/partner-{ID}-{slug}/
├── app.config.json    # Expo: nome, bundle ID, package name
├── env.json           # API URL, tokens, feature flags
├── theme.json         # Cores, branding, fontes
├── README.md          # Documentação do parceiro
└── assets/
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    ├── favicon.png
    └── logo.png
```

---

## 🎨 Arquivos de Configuração

### `app.config.json`
```json
{
  "name": "Nome do App",
  "slug": "slug-unico",
  "owner": "org-expo",
  "ios": {
    "bundleIdentifier": "com.empresa.app"
  },
  "android": {
    "package": "com.empresa.app"
  }
}
```

### `env.json`
```json
{
  "API_URL": "https://api.empresa.com.br",
  "COMPANY_ID": 46,
  "PARCEIRO": "Nome da Empresa",
  "ACCESS_TK": "token_de_acesso",
  "FEATURES": {
    "recharge": true,
    "portability": true
  }
}
```

### `theme.json`
```json
{
  "darkLightMode": true,
  "colors": {
    "primary": "#007AFF",
    "secondary": "#5856D6"
  },
  "branding": {
    "companyName": "Nome da Empresa",
    "tagline": "Slogan"
  }
}
```

---

## 🔑 Variáveis de Ambiente

### Desenvolvimento Local
```bash
export TENANT_ID=46
export EXPO_PUBLIC_TENANT_ID=46
```

### Build (GitHub Actions)
```bash
TENANT_ID=46
BACKEND_URL=https://sistema.playmovel.com.br
BACKEND_API_KEY=your_api_key
```

---

## 🌐 Endpoints da API Backend

```bash
# Listar todos os tenants
GET /api/tenants
Authorization: Bearer {API_KEY}

# Detalhes de tenant específico
GET /api/tenants/{id}
Authorization: Bearer {API_KEY}
```

**📖 Spec completa**: [API-BACKEND.md](./API-BACKEND.md)

---

## 🧪 Testing & Debugging

```bash
# Validar JSON
jq . partners/partner-46-playmovel/theme.json

# Testar endpoint da API
curl -H "Authorization: Bearer TOKEN" \
  https://sistema.playmovel.com.br/api/tenants/46

# Download de asset
curl -I https://cdn.empresa.com/icon.png

# Build local para debug
TENANT_ID=46 eas build --platform ios --local
```

---

## 📦 Adicionar Novo Parceiro (Resumo)

1. **Backend**: Cadastrar no DB
2. **Sync**: `node scripts/sync-configs.js {ID}`
3. **Validar**: `./scripts/prepare-build.sh {ID} --validate`
4. **Testar**: `TENANT_ID={ID} npx expo start`
5. **Build**: `node scripts/build-partner.js {ID}`

**📖 Guia completo**: [WHITELABEL.md](./WHITELABEL.md)

---

## 🔧 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Tenant não encontrado | `node scripts/sync-configs.js {ID}` |
| Tema não aplica | Verificar `theme.json` e endpoint API |
| Build falha | `./scripts/prepare-build.sh {ID} --validate` |
| Assets faltando | Verificar URLs no backend |
| JSON inválido | `jq . arquivo.json` |

---

## 📚 Documentação Completa

| Arquivo | O que contém |
|---------|--------------|
| [README.md](./README.md) | Visão geral e quick start |
| [CLAUDE.md](./CLAUDE.md) | Arquitetura técnica completa |
| [API-BACKEND.md](./API-BACKEND.md) | Especificação da API |
| [WHITELABEL.md](./WHITELABEL.md) | Onboarding de parceiros |

---

## 🎯 Fluxo de Deploy CI/CD

```
GitHub → Actions → Build WhiteLabel Apps
  ↓
Escolher: Partner ID, Platform, Profile
  ↓
Sync → Validate → Build → (Submit)
  ↓
App Store / Google Play
```

**Acesso**: GitHub → Actions → Run workflow

---

## 💡 Dicas Úteis

```bash
# Manter terminal aberto com tenant específico
export TENANT_ID=46
npm start

# Rebuild node_modules limpo
rm -rf node_modules && npm install

# Limpar cache do Expo
npx expo start -c

# Ver logs do build EAS
eas build:view {BUILD_ID}

# Cancelar build em andamento
eas build:cancel
```

---

## 🔗 Links Rápidos

- **Expo Dashboard**: https://expo.dev/
- **EAS Builds**: https://expo.dev/accounts/{org}/projects/{project}/builds
- **Gluestack UI**: https://ui.gluestack.io/
- **Expo Docs**: https://docs.expo.dev/

---

**Última atualização**: Janeiro 2025
