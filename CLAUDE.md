# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **React Native + Expo** mobile application for Play Móvel MVNO (operadora virtual). The app provides services for mobile plan management, recharges, portability, and customer support.

**Stack**: React Native, Expo SDK 52, TypeScript, Redux Toolkit, RTK Query
**Node Version**: v22.12.0 (minimum v22.6.0)

## Common Commands

### Development
```bash
# Start development server
npm start

# Platform-specific
npm run android
npm run ios
npm run web

# Linting & Testing
npm run lint
npm run test
```

### Build Commands
```bash
# Build for all platforms
eas build --platform all --profile production

# Build for specific platform
eas build --platform android --profile production
eas build --platform ios --profile production

# List recent builds
eas build:list --limit 10
```

## Architecture & Key Concepts

### Environment Configuration
- **File**: `config/env.ts`
- **Contains**: API URLs, company ID, access tokens, feature flags
- **Exports**: Fixed configuration for Play Móvel (Partner 46)

```typescript
import { env } from '@/config/env';

console.log(env.COMPANY_ID);     // 46
console.log(env.PARCEIRO);       // "PLAY MÓVEL"
console.log(env.API_URL);        // "https://sistema.playmovel.com.br"
console.log(env.FEATURES.recharge); // true
```

### Theming System

The app supports dynamic theming with colors loaded from the backend API.

**Default Theme**: Play Móvel brand colors (primary: #007AFF, secondary: #5856D6)
**API Integration**: Colors can be updated via `getCompany` endpoint
**Implementation**: `contexts/theme-context/index.tsx`

```typescript
// Access theme in components
import { useTheme } from '@/contexts/theme-context';

const { theme, loadThemeFromCompany } = useTheme();
// theme.colors.primary, theme.colors.secondary, theme.colors.accent

// Load theme from API response
loadThemeFromCompany(companyData);
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

## Backend Integration

The PHP backend provides these key endpoints:

### Get Company Info
```
GET /api/getCompany?companyId=46
Response: {
  companyId: 46,
  companyname: "PLAY MÓVEL",
  appTheme: "{\"colors\":{\"primary\":\"#007AFF\",\"secondary\":\"#5856D6\"}}",
  logotipo: "url...",
  ...
}
```

### Other Endpoints
- Authentication: `/api/login`, `/api/verify-token`
- Plans: `/api/plans`
- Recharge: `/api/recharge`
- Portability: `/api/portability`
- Consumption: `/api/consumption`

## App Configuration

**File**: `app.json` (static configuration)

Key settings:
- **Name**: Play Móvel
- **Bundle ID (iOS)**: com.playmovel.app
- **Package (Android)**: app.mobile.ios.infiniti
- **Version**: 5.0.0
- **EAS Project ID**: 8bfa2423-69b5-48bf-94c1-c4ded0716494

## EAS Build Configuration

**File**: `eas.json`

**Profiles**:
- `development` - Dev builds with dev client
- `preview` - Internal testing (APK/simulator)
- `production` - Production builds (auto-increment)
- `production-aab` - Android App Bundle for Play Store

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

### Theme Loading Strategy
1. Load default theme immediately (Play Móvel colors)
2. Fetch theme from API asynchronously via `getCompany`
3. Apply API theme when ready (may override defaults)

## Common Patterns

### Access Environment Config
```typescript
import { env } from '@/config/env';

console.log(env.COMPANY_ID);      // 46
console.log(env.PARCEIRO);         // "PLAY MÓVEL"
console.log(env.API_URL);          // "https://sistema.playmovel.com.br"
console.log(env.FEATURES.recharge); // true
```

### Access Theme
```typescript
import { useTheme } from '@/contexts/theme-context';

const { theme, loadThemeFromCompany } = useTheme();
// theme.colors.primary, theme.colors.secondary

// Load from API
loadThemeFromCompany(companyData);
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

### Build fails
- Verify `app.json` has correct bundle identifiers
- Check `eas.json` profile configuration
- Ensure all native dependencies are properly installed

### Theme not loading
- Check `getCompany` API endpoint returns valid `appTheme` JSON
- Verify network connectivity in development
- Check browser/metro console for errors

### Redux state issues
- Verify store is properly configured in `app/_layout.tsx`
- Check if slices are properly imported
- Use Redux DevTools for debugging

## Resources

### External Resources
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Gluestack UI](https://ui.gluestack.io/)
- [NativeWind](https://www.nativewind.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
