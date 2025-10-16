# Partner: PLAY MÓVEL (ID: 46)

## Informações do Parceiro

- **Nome**: PLAY MÓVEL
- **Tenant ID**: 46
- **Slug**: playmovel
- **Owner**: playmovel-org

## Branding

### Cores Principais
- **Primary**: #007AFF
- **Secondary**: #5856D6
- **Accent**: #FF9500

### Cores de Fundo (Assets)
- **Splash Background**: #007AFF (definido em `app.config.json`)
- **iOS Icon Background**: #007AFF (aplicado se o ícone tiver transparência)
- **Android Adaptive Icon Background**: #007AFF (fundo do ícone adaptativo)

### Assets
Todos os assets estão localizados em `./assets/`:

- **icon.png** (1024x1024px) - Ícone principal do app
- **adaptive-icon.png** (1024x1024px) - Foreground do ícone adaptativo Android
- **splash-icon.png** (400x400px) - Logo exibido na tela splash
- **favicon.png** (192x192px) - Favicon para versão web

**Nota**: As cores de fundo são configuradas em `app.config.json` e aplicadas automaticamente durante o build.

## Configurações de Build

### iOS
- **Bundle Identifier**: com.playmovel.app
- **Build Number**: 1

### Android
- **Package**: com.playmovel.app
- **Version Code**: 1

## API Configuration

- **Base URL**: https://sistema.playmovel.com.br
- **Company ID**: 46

## Features Habilitadas

- ✅ Recarga
- ✅ Portabilidade
- ✅ Suporte
- ✅ Planos
- ✅ Consumo

## Build Local

Para fazer build localmente para este parceiro:

```bash
TENANT_ID=46 npx expo start
```

## Build via EAS

```bash
TENANT_ID=46 eas build --platform all --profile production
```

## Contato

- **Email de Suporte**: suporte@playmovel.com.br
- **Telefone**: +55 11 0000-0000
- **Website**: https://playmovel.com.br
