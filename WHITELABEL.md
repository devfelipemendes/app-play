# 🎨 WhiteLabel Multi-Tenant System

## Guia Completo de Onboarding de Novos Parceiros

Este documento descreve o processo completo para adicionar novos parceiros (tenants) ao sistema WhiteLabel.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Requisitos](#requisitos)
3. [Fluxo de Onboarding](#fluxo-de-onboarding)
4. [Configuração do Backend](#configuração-do-backend)
5. [Sincronização e Validação](#sincronização-e-validação)
6. [Build e Deploy](#build-e-deploy)
7. [Troubleshooting](#troubleshooting)

---

## Visão Geral

### O que é um Tenant?

Um **tenant** (parceiro) é uma operadora MVNO que terá seu próprio app customizado gerado a partir do código-fonte único deste projeto.

### Arquitetura

```
1 Código-Fonte → N Apps Customizados
```

Cada tenant possui:
- **ID único** (numérico, ex: 46)
- **Slug** (string, ex: "playmovel")
- **Branding** (cores, logo, nome)
- **Configurações** (API URL, tokens, features)
- **Assets** (ícones, splash screens)

---

## Requisitos

### 1. Informações do Parceiro

Colete as seguintes informações:

#### Básicas
- [ ] Nome da empresa (ex: "PLAY MÓVEL")
- [ ] Slug único (ex: "playmovel")
- [ ] ID numérico único (ex: 46)

#### Branding
- [ ] Cor primária (hex, ex: "#007AFF")
- [ ] Cor secundária (hex, ex: "#5856D6")
- [ ] Cor de destaque/accent (opcional)
- [ ] Logo da empresa (PNG, SVG)

#### Aplicativo
- [ ] Nome do app (ex: "Play Móvel")
- [ ] **iOS Bundle Identifier** (ex: "com.playmovel.app")
- [ ] **Android Package Name** (ex: "com.playmovel.app")
- [ ] Expo Owner/Organization (ex: "playmovel-org")

#### API
- [ ] URL da API (ex: "https://sistema.playmovel.com.br")
- [ ] Access Token / API Key
- [ ] Company ID no sistema backend

#### Assets Visuais
- [ ] Ícone do app (1024x1024px PNG)
- [ ] Adaptive Icon (Android, foreground 1024x1024px)
- [ ] Splash Screen (imagem centralizada)
- [ ] Favicon (256x256px ou maior)

#### Contato
- [ ] Email de suporte
- [ ] Telefone de suporte
- [ ] Website

#### Features Habilitadas
- [ ] Recarga
- [ ] Portabilidade
- [ ] Suporte ao cliente
- [ ] Visualização de planos
- [ ] Consumo de dados

---

## Fluxo de Onboarding

### Passo 1: Cadastro no Backend

O parceiro deve ser cadastrado no backend PHP com todas as informações necessárias.

**Endpoint**: `POST /api/tenants`

**Payload Exemplo**:
```json
{
  "id": 47,
  "name": "Operadora XYZ",
  "slug": "operadoraxyz",
  "appName": "XYZ Móvel",
  "expoOwner": "operadoraxyz-org",

  "appTheme": {
    "darkLightMode": true,
    "colors": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "accent": "#FFE66D"
    },
    "branding": {
      "companyName": "Operadora XYZ",
      "tagline": "Conecte-se com liberdade"
    }
  },

  "ios": {
    "bundleIdentifier": "com.operadoraxyz.app",
    "buildNumber": "1",
    "supportsTablet": true
  },

  "android": {
    "packageName": "com.operadoraxyz.app",
    "versionCode": 1
  },

  "apiUrl": "https://api.operadoraxyz.com.br",
  "accessToken": "seu_token_aqui",

  "assets": {
    "icon": "https://cdn.operadoraxyz.com/icon.png",
    "adaptiveIcon": "https://cdn.operadoraxyz.com/adaptive-icon.png",
    "splash": "https://cdn.operadoraxyz.com/splash.png",
    "favicon": "https://cdn.operadoraxyz.com/favicon.png",
    "logo": "https://cdn.operadoraxyz.com/logo.png"
  },

  "supportEmail": "suporte@operadoraxyz.com.br",
  "supportPhone": "+55 11 9999-9999",
  "websiteUrl": "https://operadoraxyz.com.br",

  "features": {
    "recharge": true,
    "portability": true,
    "support": true,
    "plans": true,
    "consumption": true
  },

  "easProjectId": "your-expo-project-id"
}
```

### Passo 2: Sincronização das Configurações

Após cadastro no backend, sincronize as configurações:

```bash
# Sincronizar apenas o novo tenant
node scripts/sync-configs.js 47

# Ou sincronizar todos
node scripts/sync-configs.js
```

**O que este comando faz**:
- Busca dados do tenant no endpoint `/api/tenants/47`
- Cria diretório `/partners/partner-47-operadoraxyz/`
- Gera arquivos de configuração:
  - `app.config.json` (configurações do Expo)
  - `env.json` (variáveis de ambiente)
  - `theme.json` (cores e branding)
  - `README.md` (documentação do parceiro)
- Baixa assets (ícones, splash, logo)

**Estrutura criada**:
```
partners/partner-47-operadoraxyz/
├── app.config.json
├── env.json
├── theme.json
├── README.md
└── assets/
    ├── icon.png
    ├── adaptive-icon.png
    ├── splash-icon.png
    ├── favicon.png
    └── logo.png
```

### Passo 3: Validação

Valide a configuração do tenant:

```bash
./scripts/prepare-build.sh 47 --validate
```

**O que este comando verifica**:
- ✅ Existência do diretório do parceiro
- ✅ Presença de todos os arquivos necessários
- ✅ Validade dos JSONs
- ✅ Assets principais (ícone, splash)
- ✅ Configurações de Bundle ID e Package Name

### Passo 4: Teste Local

Teste o app localmente com o novo tenant:

```bash
# Define o TENANT_ID e inicia o app
TENANT_ID=47 npx expo start
```

Verifique:
- ✅ Nome do app correto
- ✅ Cores aplicadas (primária, secundária)
- ✅ Logo e branding
- ✅ Features habilitadas funcionando
- ✅ Conexão com API do parceiro

### Passo 5: Build de Produção

Execute o build para o novo tenant:

```bash
# Build para todas as plataformas
node scripts/build-partner.js 47

# Build apenas iOS
node scripts/build-partner.js 47 --platform=ios

# Build apenas Android
node scripts/build-partner.js 47 --platform=android

# Build com auto-submit
node scripts/build-partner.js 47 --auto-submit
```

### Passo 6: Deploy via CI/CD

Faça deploy automatizado via GitHub Actions:

1. Acesse: **Actions → Build WhiteLabel Apps → Run workflow**
2. Configure:
   - **Partner**: `47` (ou `all` para todos)
   - **Platform**: `all`, `ios` ou `android`
   - **Profile**: `production`
   - **Auto-submit**: `true` ou `false`
3. Clique em **Run workflow**

O pipeline executará:
1. Sincronização das configs do backend
2. Validação do tenant
3. Build para iOS e/ou Android
4. (Opcional) Submissão para App Store / Google Play

---

## Configuração do Backend

### Endpoints Necessários

#### 1. Listar Tenants
```http
GET /api/tenants
Authorization: Bearer {API_KEY}

Response:
[
  {
    "id": 46,
    "name": "PLAY MÓVEL",
    "slug": "playmovel",
    "active": true,
    ...
  },
  {
    "id": 47,
    "name": "Operadora XYZ",
    "slug": "operadoraxyz",
    "active": true,
    ...
  }
]
```

#### 2. Detalhes do Tenant
```http
GET /api/tenants/{id}
Authorization: Bearer {API_KEY}

Response:
{
  "id": 47,
  "name": "Operadora XYZ",
  "slug": "operadoraxyz",
  "appTheme": { ... },
  "ios": { ... },
  "android": { ... },
  "assets": { ... },
  ...
}
```

#### 3. CDN de Assets

Os assets devem estar disponíveis via URLs públicas:
- `https://cdn.{domain}/tenants/{id}/icon.png`
- `https://cdn.{domain}/tenants/{id}/adaptive-icon.png`
- `https://cdn.{domain}/tenants/{id}/splash.png`
- etc.

**Formato dos Assets**:
- **Icon**: 1024x1024px PNG (com transparência)
- **Adaptive Icon**: 1024x1024px PNG (foreground layer)
- **Splash**: Mínimo 2048x2048px PNG
- **Favicon**: 256x256px ou maior PNG
- **Logo**: SVG ou PNG de alta resolução

---

## Sincronização e Validação

### Dry Run

Teste a sincronização sem fazer alterações:

```bash
node scripts/sync-configs.js --dry-run
```

Isso mostrará o que será feito sem executar.

### Validar Todos os Tenants

```bash
./scripts/prepare-build.sh all --validate
```

Isso valida todos os tenants cadastrados.

### Logs e Debugging

Os scripts fornecem logs detalhados:

```bash
node scripts/sync-configs.js 47 2>&1 | tee sync-log.txt
```

---

## Build e Deploy

### Builds Locais

```bash
# Build direto com EAS
TENANT_ID=47 eas build --platform all --profile production
```

### Profiles de Build

**Development**:
```bash
TENANT_ID=47 eas build --profile development
```
- Para desenvolvimento interno
- Inclui dev tools

**Preview**:
```bash
TENANT_ID=47 eas build --profile preview
```
- Para testes internos
- APK/IPA para distribuição ad-hoc

**Production**:
```bash
TENANT_ID=47 eas build --profile production
```
- Build final para lojas
- Auto-increment de build number

### Submissão para Lojas

#### App Store (iOS)

```bash
eas submit --platform ios --latest
```

Requer secrets configurados:
- `APPLE_ID`
- `ASC_APP_ID`
- `APPLE_TEAM_ID`

#### Google Play (Android)

```bash
eas submit --platform android --latest
```

Requer:
- Service Account JSON: `secrets/google-play-47.json`

---

## Troubleshooting

### Erro: "Tenant not found"

**Causa**: Tenant não sincronizado ou ID incorreto

**Solução**:
```bash
node scripts/sync-configs.js {TENANT_ID}
```

### Erro: "Invalid JSON"

**Causa**: Arquivo JSON corrompido

**Solução**:
1. Valide o JSON manualmente: `jq . partners/partner-{id}-{slug}/env.json`
2. Re-sincronize: `node scripts/sync-configs.js {TENANT_ID}`

### Tema não aplicado

**Causa**: `theme.json` inválido ou cores não carregadas

**Solução**:
1. Verifique formato do `theme.json`
2. Confirme endpoint `/api/tenants/{id}` retorna `appTheme` válido
3. Veja logs de rede no app

### Bundle ID/Package Name duplicado

**Causa**: Conflito com outro app

**Solução**:
1. Use identificadores únicos por tenant
2. Padrão recomendado: `com.{empresa}.app` ou `com.{empresa}.{produto}`

### Assets faltando

**Causa**: URLs inválidas ou CDN offline

**Solução**:
1. Verifique URLs dos assets no backend
2. Teste URLs manualmente: `curl -I {URL}`
3. Adicione assets manualmente: `partners/partner-{id}-{slug}/assets/`

### Build falha no EAS

**Causa**: Configuração incorreta ou credenciais faltando

**Solução**:
1. Valide `eas.json`
2. Verifique secrets do GitHub/EAS
3. Rode build local para debug: `TENANT_ID={ID} eas build --platform ios --local`

---

## Checklist Final

Antes de considerar o onboarding completo:

- [ ] Tenant cadastrado no backend
- [ ] Configurações sincronizadas (`node scripts/sync-configs.js`)
- [ ] Validação passando (`./scripts/prepare-build.sh {ID} --validate`)
- [ ] Teste local funcionando (`TENANT_ID={ID} npx expo start`)
- [ ] Build de produção bem-sucedida
- [ ] App testado em dispositivo físico
- [ ] Submissão para lojas (se aplicável)
- [ ] Documentação interna atualizada
- [ ] Equipe do parceiro notificada

---

## Scripts de Referência Rápida

```bash
# Sincronizar configurações
node scripts/sync-configs.js {TENANT_ID}

# Validar configuração
./scripts/prepare-build.sh {TENANT_ID} --validate

# Teste local
TENANT_ID={TENANT_ID} npx expo start

# Build automático
node scripts/build-partner.js {TENANT_ID}

# Build direto com EAS
TENANT_ID={TENANT_ID} eas build --platform all --profile production

# Listar builds
eas build:list --limit 10
```

---

## Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Documentação do Projeto](./CLAUDE.md)
- [README do Parceiro](./partners/partner-{id}-{slug}/README.md)

---

## Suporte

Para dúvidas ou problemas, consulte:
- Documentação técnica: `CLAUDE.md`
- Logs do sistema: `logs/`
- GitHub Issues: [Criar issue]()

---

**Última atualização**: 2025-01-06
