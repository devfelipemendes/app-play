# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WhiteLabel Multi-Tenant React Native + Expo** mobile application for MVNOs (operadoras virtuais). The app supports multiple partners/tenants from a single codebase with automated builds via CI/CD. Each tenant gets customized branding, themes, and configurations while maintaining a single source of truth.

**Stack**: React Native, Expo SDK 52, TypeScript, Redux Toolkit, RTK Query
**Node Version**: v22.12.0 (minimum v22.6.0)

## 🏗️ Multi-Tenant Architecture

### Tenant System
- **Single codebase → Multiple apps**: One source generates N customized apps
- **Tenant ID**: Each partner identified by numeric ID (e.g., 46 for Play Móvel)
- **Dynamic configuration**: Theme, branding, and env vars loaded per tenant
- **Build-time customization**: app.config.js generates unique configs per build

### Directory Structure
```
/partners/
  ├── partner-46-playmovel/
  │   ├── app.config.json        # Expo config (name, bundle ID, etc.)
  │   ├── env.json                # Environment variables
  │   ├── theme.json              # Colors, branding, fonts
  │   ├── assets/                 # Icons, splash, logo
  │   └── README.md               # Partner documentation
  └── partner-{id}-{slug}/        # Additional tenants

/scripts/
  ├── sync-configs.js             # Syncs tenant data from backend API
  ├── build-partner.js            # Automates EAS builds per tenant
  └── prepare-build.sh            # Validates tenant configs before build

/.github/workflows/
  └── build-whitelabel.yml        # CI/CD pipeline for automated builds
```

## Common Commands

### Development
```bash
# Start with specific tenant (defaults to 46)
TENANT_ID=46 npx expo start

# Or use environment variable
export EXPO_PUBLIC_TENANT_ID=46
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Linting & Testing
npm run lint
npm run test
```

### Multi-Tenant Operations

#### Sync Tenant Configs from Backend
```bash
# Sync all tenants
node scripts/sync-configs.js

# Sync specific tenant
node scripts/sync-configs.js 46

# Dry run (preview without changes)
node scripts/sync-configs.js --dry-run
```

#### Build for Tenants
```bash
# Build specific tenant
node scripts/build-partner.js 46

# Build all tenants
node scripts/build-partner.js all

# Build with options
node scripts/build-partner.js 46 --platform=ios --profile=production
node scripts/build-partner.js 46 --auto-submit --no-wait

# Validate tenant configuration
./scripts/prepare-build.sh 46 --validate
```

#### EAS Build Commands
```bash
# Direct EAS build for tenant
TENANT_ID=46 eas build --platform all --profile production

# List recent builds
eas build:list --limit 10
```

## Architecture & Key Concepts

### Tenant Configuration Flow
1. **Build-time**: `app.config.js` reads tenant files from `/partners/{id}/`
2. **Runtime**: `config/env.ts` loads tenant-specific environment variables
3. **Theme**: `WhitelabelThemeProvider` loads colors from local file → then fetches from API

### Dynamic App Configuration
- **File**: `app.config.js` (replaces static `app.json`)
- **Environment variable**: `TENANT_ID` determines which partner config to load
- **Output**: Generates unique app name, bundle ID, icons, splash per tenant

### Environment Configuration
- **File**: `config/env.ts`
- **Sources** (priority order):
  1. `expo-constants` (build-time)
  2. `/partners/partner-{id}-*/env.json`
  3. Hardcoded fallback
- **Exports**: `env.TENANT_ID`, `env.API_URL`, `env.COMPANY_ID`, feature flags

### Theming System (Dual-Layer)

**Layer 1: Local Theme** (`/partners/{id}/theme.json`)
- Loaded immediately on app start (prevents flash)
- Contains colors, fonts, branding
- Used as fallback if API fails

**Layer 2: API Theme** (fetched from backend)
- Endpoint: `GET /api/tenants/{id}`
- Overwrites local theme with latest from backend
- Supports hot updates without rebuilding

**Implementation**: `contexts/theme-context/whitelabel-theme-context.tsx`

```typescript
// Access theme in components
const { theme } = useWhitelabelTheme();
// theme.colors.primary, theme.colors.secondary, theme.branding
```

### State Management Architecture
Uses **Redux Toolkit** with RTK Query:
- **Store**: `src/store/index.ts`
- **Slices**: `authSlice`, `companySlice`, `screenFlowSlice`, `ativarLinhaSlice`, `det2Slice`
- **API**: `src/api/apiPlay.ts` with injected endpoints
- **Typed hooks**: `useAppDispatch`, `useAppSelector` from `src/store/hooks/`

### Routing Structure (Expo Router)
- `app/(auth)/` - Authentication (login, loading)
- `app/(tabs)/` - Main app with bottom tabs
  - `(home)/` - Home screens (index, days, monthly)
  - `maps.tsx`, `location.tsx`, `settings.tsx`
- `app/index.tsx` - Entry/splash
- `app/_layout.tsx` - Root layout with providers

### Component Architecture
- `components/ui/` - Gluestack UI wrappers
- `components/screens/` - Feature-specific sections
- `components/shared/` - Shared components (header, bottom-tab-bar)
- `components/layout/` - Layout components (inputs, carousels)
- `components/Pages/forms/` - Form components

### Path Aliases
- `@/*` → Root directory
- `@/components/*` → `components/*`
- `@/components/ui/*` → `components/ui/*`

Configured in `tsconfig.json` and `babel.config.js`

## Backend Integration Requirements

The PHP backend must expose these endpoints:

### 1. List Tenants
```
GET /api/tenants
Response: [{ id, name, slug, appTheme, ... }]
```

### 2. Get Tenant Details
```
GET /api/tenants/{id}
Response: {
  id: 46,
  name: "PLAY MÓVEL",
  slug: "playmovel",
  appTheme: { colors: { primary, secondary }, ... },
  ios: { bundleIdentifier },
  android: { packageName },
  assets: { icon, splash, logo },
  accessToken: "...",
  ...
}
```

### 3. Assets CDN
- Serve icons, splash screens, logos via public URLs
- Format: PNG with appropriate dimensions

**📖 Para especificação completa da API, consulte: [API-BACKEND.md](./API-BACKEND.md)**

Este documento contém:
- Estrutura detalhada de todas as respostas JSON
- Campos obrigatórios vs opcionais
- Estrutura de banco de dados SQL
- Exemplo completo de implementação PHP
- Guia de validação e testes

## CI/CD Pipeline (GitHub Actions)

### Workflow: `.github/workflows/build-whitelabel.yml`

**Triggers**:
- Manual dispatch (workflow_dispatch)
- Weekly schedule (Sundays 2 AM UTC)
- Push to `main` with changes to `partners/`

**Jobs**:
1. **sync-configs**: Fetches tenant data from backend
2. **prepare-matrix**: Generates build matrix (tenant IDs)
3. **build**: Builds apps for each tenant in parallel
4. **submit**: (Optional) Submits to App Store / Google Play
5. **summary**: Generates build report

**Usage**:
```bash
# Via GitHub UI: Actions → Build WhiteLabel Apps → Run workflow
# Select: partner ID, platform, profile, auto-submit
```

### Secrets Required
- `EXPO_TOKEN` - Expo authentication
- `BACKEND_URL` - Backend API URL
- `BACKEND_API_KEY` - Backend API key
- `APPLE_ID`, `ASC_APP_ID`, `APPLE_TEAM_ID` - iOS submission
- Google Play service account JSON in `secrets/google-play-{TENANT_ID}.json`

## EAS Build Configuration

**File**: `eas.json`

**Profiles**:
- `development` - Dev builds with dev client
- `preview` - Internal testing (APK/simulator)
- `production` - Production builds (auto-increment)
- `production-aab` - Android App Bundle for Play Store

**Environment Variables**:
- `TENANT_ID` - Passed to build process
- `EXPO_PUBLIC_TENANT_ID` - Available in app runtime

## Adding a New Tenant

1. **Backend**: Add tenant to database with complete configuration
2. **Sync**: Run `node scripts/sync-configs.js` to pull tenant data
3. **Validate**: Run `./scripts/prepare-build.sh {TENANT_ID} --validate`
4. **Test locally**: `TENANT_ID={ID} npx expo start`
5. **Build**: `node scripts/build-partner.js {TENANT_ID}`
6. **CI/CD**: Push to `main` or trigger GitHub Action

## Styling

**Dual System**: NativeWind (Tailwind) + Gluestack UI
- **Global**: `global.css`
- **Config**: `tailwind.config.js`
- **Theme**: `config/theme.ts` - Dynamic color injection for Gluestack

## Forms & Validation
- **Library**: react-hook-form + valibot
- **Masks**: `remask` library + `src/utils/masks.ts`
- **CPF/CNPJ**: Custom validator in `hooks/useCpfCnpjValidator.ts`
- **Dates**: react-native-paper-dates

## Key Libraries
- **UI**: Gluestack UI v1, NativeWind v4
- **Navigation**: Expo Router v4
- **State**: Redux Toolkit v2, RTK Query
- **Forms**: React Hook Form v7
- **Animations**: React Native Reanimated v3
- **Maps**: react-native-maps
- **Charts**: react-native-gifted-charts

## Important Notes

### Babel Configuration
`react-native-reanimated/plugin` **MUST** be the last plugin in `babel.config.js`

### Tenant Detection Priority
1. Expo Constants (`Constants.expoConfig.extra.tenantId`)
2. Environment variable (`process.env.EXPO_PUBLIC_TENANT_ID`)
3. Default fallback (46)

### Theme Loading Strategy
1. Load local theme immediately (prevent flash)
2. Fetch API theme asynchronously
3. Apply API theme when ready (may override local)

## Common Patterns

### Access Tenant Config
```typescript
import { env } from '@/config/env';

console.log(env.TENANT_ID);      // "46"
console.log(env.COMPANY_ID);     // 46
console.log(env.PARCEIRO);       // "PLAY MÓVEL"
console.log(env.FEATURES.recharge); // true
```

### Access Theme
```typescript
import { useWhitelabelTheme } from '@/contexts/theme-context/whitelabel-theme-context';

const { theme, loadThemeFromAPI } = useWhitelabelTheme();
// theme.colors.primary, theme.colors.secondary
```

### Redux Usage
```typescript
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';

const dispatch = useAppDispatch();
const user = useAppSelector((state) => state.auth.user);
```

### Create API Endpoint
```typescript
// src/api/endpoints/YourApi.ts
import { apiPlay } from '../apiPlay';

export const yourApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    yourQuery: builder.query({
      query: (params) => ({ url: '/endpoint', method: 'GET', params }),
      providesTags: ['YourTag'],
    }),
  }),
});

export const { useYourQueryQuery } = yourApi;
```

## Troubleshooting

### Build fails with "tenant not found"
- Run `node scripts/sync-configs.js {TENANT_ID}`
- Verify `/partners/partner-{id}-{slug}/` exists

### Theme not loading
- Check `theme.json` format
- Verify API endpoint `/api/tenants/{id}` returns valid `appTheme`
- Check network logs in development

### Wrong app name/bundle ID in build
- Verify `TENANT_ID` environment variable is set
- Check `app.config.js` is reading correct tenant directory
- Validate `partners/partner-{id}-*/app.config.json`

## Resources

### Documentation
- [API Backend Specification](./API-BACKEND.md) - Complete API structure and implementation guide
- [WhiteLabel Onboarding Guide](./WHITELABEL.md) - Step-by-step partner onboarding process
- [Partner Configuration](./partners/) - Tenant-specific configurations

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Gluestack UI](https://ui.gluestack.io/)
- [NativeWind](https://www.nativewind.dev/)

### Quick Reference
| Document | Purpose |
|----------|---------|
| `CLAUDE.md` | Technical architecture and development guide |
| `API-BACKEND.md` | Backend API specification and implementation |
| `WHITELABEL.md` | Onboarding process for new partners |
| `partners/{id}/README.md` | Partner-specific documentation |
