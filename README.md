# 📱 WhiteLabel Multi-Tenant MVNO App

> Sistema WhiteLabel para MVNOs (Operadoras Virtuais) - 1 código-fonte, N apps customizados

Este é um aplicativo React Native + Expo para operadoras virtuais (MVNOs) que permite gerar múltiplos apps customizados a partir de um único código-fonte. Cada parceiro (tenant) tem seu próprio branding, tema, configurações e builds automatizadas.

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js**: v22.12.0 ou superior (mínimo v22.6.0)
- **npm** ou **yarn**
- **Expo CLI**: Instalado globalmente
- **EAS CLI**: Para builds (opcional para desenvolvimento local)

### Instalação

```bash
# 1. Clone o repositório
git clone <repository-url>
cd app-play

# 2. Instale as dependências
npm install

# 3. Inicie o app (tenant padrão: 46 - PLAY MÓVEL)
npm start
```

### Desenvolvimento com Tenant Específico

```bash
# Definir tenant antes de iniciar
TENANT_ID=46 npx expo start

# Ou usando variável de ambiente
export EXPO_PUBLIC_TENANT_ID=46
npm start
```

---

## 📚 Documentação

### 📖 Guias Principais

| Documento | Descrição | Para Quem |
|-----------|-----------|-----------|
| **[CLAUDE.md](./CLAUDE.md)** | Arquitetura técnica completa, comandos, patterns | Desenvolvedores |
| **[API-BACKEND.md](./API-BACKEND.md)** | Especificação da API backend, estrutura de dados | Backend Developers |
| **[WHITELABEL.md](./WHITELABEL.md)** | Guia de onboarding de novos parceiros | DevOps/PM |

### 🗂️ Estrutura do Projeto

```
app-play/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                   # Telas de autenticação
│   ├── (tabs)/                   # Navegação principal
│   └── _layout.tsx               # Root layout
├── components/                   # Componentes React
│   ├── ui/                       # Gluestack UI components
│   ├── screens/                  # Feature-specific components
│   └── shared/                   # Shared components
├── partners/                     # 🎨 Configurações por tenant
│   └── partner-46-playmovel/
│       ├── app.config.json       # Expo config
│       ├── env.json              # Environment variables
│       ├── theme.json            # Cores e branding
│       └── assets/               # Ícones, splash, etc.
├── scripts/                      # Scripts de automação
│   ├── sync-configs.js           # Sincroniza configs do backend
│   ├── build-partner.js          # Build por tenant
│   └── prepare-build.sh          # Validação pré-build
├── src/
│   ├── api/                      # API clients (RTK Query)
│   ├── store/                    # Redux store e slices
│   └── utils/                    # Utilities
├── config/
│   ├── env.ts                    # Dynamic env configuration
│   └── theme.ts                  # Theme configuration
├── .github/workflows/            # CI/CD
│   └── build-whitelabel.yml      # Automated builds
├── app.config.js                 # 🔧 Dynamic Expo config
├── eas.json                      # EAS Build configuration
└── package.json
```

---

## 🛠️ Comandos Principais

### Desenvolvimento

```bash
# Start development server
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Linting
npm run lint

# Testing
npm run test
```

### Multi-Tenant Operations

```bash
# Sincronizar configurações do backend
node scripts/sync-configs.js              # Todos os tenants
node scripts/sync-configs.js 46           # Tenant específico
node scripts/sync-configs.js --dry-run    # Preview sem aplicar

# Validar configuração de tenant
./scripts/prepare-build.sh 46 --validate

# Build para tenant específico
node scripts/build-partner.js 46
node scripts/build-partner.js 46 --platform=ios
node scripts/build-partner.js all

# Build direto com EAS
TENANT_ID=46 eas build --platform all --profile production
```

---

## 🏗️ Arquitetura Multi-Tenant

### Como Funciona

1. **Um código-fonte** gera múltiplos apps customizados
2. **Tenant ID** identifica cada parceiro (ex: 46 para PLAY MÓVEL)
3. **Build-time**: `app.config.js` carrega configs do `/partners/{id}/`
4. **Runtime**: App detecta tenant via `expo-constants`
5. **Tema**: Carregado do arquivo local → depois atualizado via API

### Fluxo de Build

```
Backend API → Sync Scripts → /partners/{id}/ → app.config.js → EAS Build → App Stores
```

### Configuração por Tenant

Cada tenant possui:
- ✅ **app.config.json** - Nome, bundle ID, package name
- ✅ **env.json** - API URL, tokens, feature flags
- ✅ **theme.json** - Cores, branding, fontes
- ✅ **assets/** - Ícones, splash screens, logos

---

## 🎨 Sistema de Temas

### Dual-Layer Theming

**Layer 1: Local Theme** (`/partners/{id}/theme.json`)
- Carregado imediatamente (evita flash)
- Fallback se API falhar

**Layer 2: API Theme** (`GET /api/tenants/{id}`)
- Atualiza tema com dados do backend
- Permite hot updates sem rebuild

### Acessando o Tema

```typescript
import { useWhitelabelTheme } from '@/contexts/theme-context/whitelabel-theme-context';

const { theme } = useWhitelabelTheme();
// theme.colors.primary, theme.colors.secondary
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions

**Workflow**: `.github/workflows/build-whitelabel.yml`

**Triggers**:
- Manual dispatch (via GitHub UI)
- Weekly schedule (Sundays 2 AM UTC)
- Push to `main` com mudanças em `partners/`

**Como Usar**:
1. Acesse **GitHub** → **Actions** → **Build WhiteLabel Apps**
2. Click **Run workflow**
3. Configure:
   - Partner ID (ou "all")
   - Platform (ios/android/all)
   - Profile (production/preview)
   - Auto-submit (true/false)

### Secrets Necessários

Configure em **Settings → Secrets**:
- `EXPO_TOKEN` - Expo authentication
- `BACKEND_URL` - Backend API URL
- `BACKEND_API_KEY` - API key
- `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` - iOS
- `secrets/google-play-{TENANT_ID}.json` - Android

---

## 📦 Adicionando Novo Parceiro

### Processo Completo

1. **Backend**: Cadastrar tenant no banco de dados
2. **Sync**: `node scripts/sync-configs.js {TENANT_ID}`
3. **Validar**: `./scripts/prepare-build.sh {TENANT_ID} --validate`
4. **Testar**: `TENANT_ID={ID} npx expo start`
5. **Build**: `node scripts/build-partner.js {TENANT_ID}`
6. **Deploy**: Trigger GitHub Action ou usar EAS diretamente

**📖 Guia detalhado**: [WHITELABEL.md](./WHITELABEL.md)

---

## 🔧 Stack Tecnológica

### Core
- **React Native** 0.76.3
- **Expo SDK** 52
- **TypeScript** 5.3.3
- **Node.js** v22.12.0

### State Management
- **Redux Toolkit** 2.9.0
- **RTK Query** (incluído)

### UI/Styling
- **Gluestack UI** 1.1.x
- **NativeWind** 4.1.x (Tailwind for RN)
- **React Native Reanimated** 3.16.x

### Navigation
- **Expo Router** 4.0.x (file-based)

### Forms
- **React Hook Form** 7.62.0
- **Valibot** 1.1.0

### Build & Deploy
- **EAS Build**
- **GitHub Actions**

---

## 📱 Tenants Ativos

| ID | Nome | Slug | Bundle ID/Package |
|----|------|------|-------------------|
| 46 | PLAY MÓVEL | playmovel | com.playmovel.app |

*Para adicionar novos tenants, consulte [WHITELABEL.md](./WHITELABEL.md)*

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test

# Lint
npm run lint
```

---

## 🐛 Troubleshooting

### Tenant não encontrado
```bash
node scripts/sync-configs.js {TENANT_ID}
```

### Tema não aplicado
- Verifique `partners/partner-{id}-*/theme.json`
- Teste endpoint: `curl https://api/tenants/{id}`

### Build falha
```bash
# Validar configuração
./scripts/prepare-build.sh {TENANT_ID} --validate

# Build local para debug
TENANT_ID={ID} eas build --platform ios --local
```

**📖 Mais soluções**: [CLAUDE.md - Troubleshooting](./CLAUDE.md#troubleshooting)

---

## 📞 Suporte

### Documentação
- **Técnica**: [CLAUDE.md](./CLAUDE.md)
- **API Backend**: [API-BACKEND.md](./API-BACKEND.md)
- **Onboarding**: [WHITELABEL.md](./WHITELABEL.md)

### Links Úteis
- [Expo Docs](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Gluestack UI](https://ui.gluestack.io/)

---

## 📄 Licença

Private - Todos os direitos reservados

---

## 🤝 Contribuindo

Este é um projeto interno. Para mudanças:
1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -m "Add nova feature"`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

---

**Última atualização**: Janeiro 2025
