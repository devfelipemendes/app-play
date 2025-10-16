# Template de Configuração para Novo Parceiro

Este documento serve como guia para criar a configuração de um novo parceiro no sistema WhiteLabel.

## Estrutura de Diretório

Cada parceiro deve ter a seguinte estrutura dentro de `/partners/`:

```
partners/
└── partner-{ID}-{slug}/
    ├── app.config.json      # Configurações do app (nome, bundle ID, cores, etc.)
    ├── env.json             # Variáveis de ambiente específicas
    ├── theme.json           # Tema visual (cores, fontes, branding)
    ├── assets/              # Assets visuais
    │   ├── icon.png         # Ícone do app (1024x1024px)
    │   ├── adaptive-icon.png # Ícone adaptativo Android (1024x1024px)
    │   ├── splash-icon.png  # Logo para tela splash (mínimo 200x200px)
    │   └── favicon.png      # Favicon para web (48x48px ou maior)
    └── README.md            # Documentação específica do parceiro
```

## 1. app.config.json

Este arquivo define as configurações específicas do Expo para o parceiro.

### Template Completo com Comentários:

```json
{
  "name": "Nome do App",
  "slug": "slug-do-app",
  "owner": "nome-da-organizacao-expo",
  "version": "1.0.0",

  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.suaempresa.nomedoapp",
    "buildNumber": "1",
    "icon": {
      "backgroundColor": "#007AFF"
    }
  },

  "android": {
    "package": "com.suaempresa.nomedoapp",
    "versionCode": 1,
    "adaptiveIcon": {
      "backgroundColor": "#007AFF"
    }
  },

  "splash": {
    "backgroundColor": "#007AFF",
    "resizeMode": "contain"
  },

  "extra": {
    "supportEmail": "suporte@suaempresa.com.br",
    "supportPhone": "+55 11 0000-0000",
    "websiteUrl": "https://suaempresa.com.br"
  },

  "eas": {
    "projectId": "seu-expo-project-id-aqui"
  }
}
```

### Campos Importantes:

#### Identificação do App
- **name**: Nome completo do aplicativo (exibido abaixo do ícone)
- **slug**: Identificador único (apenas letras minúsculas, números e hífens)
- **owner**: Nome da organização no Expo (necessário para builds EAS)
- **version**: Versão semântica do app (ex: "1.0.0", "2.1.3")

#### Configurações iOS
- **bundleIdentifier**: ID único do app na App Store (ex: "com.playmovel.app")
- **buildNumber**: Número do build (incrementar a cada nova versão)
- **icon.backgroundColor**: Cor de fundo do ícone iOS (formato hexadecimal)

#### Configurações Android
- **package**: Nome do pacote Android (ex: "com.playmovel.app")
- **versionCode**: Código numérico da versão (incrementar a cada build)
- **adaptiveIcon.backgroundColor**: Cor de fundo do ícone adaptativo Android

#### Splash Screen
- **backgroundColor**: Cor de fundo da tela de splash (formato hexadecimal)
- **resizeMode**: Como o logo é exibido na splash
  - `"contain"` - Mantém proporções, pode ter espaço em branco
  - `"cover"` - Preenche toda a tela, pode cortar imagem
  - `"native"` - Comportamento nativo de cada plataforma

#### Extras
- **supportEmail**: Email de suporte do parceiro
- **supportPhone**: Telefone de suporte (formato internacional)
- **websiteUrl**: URL do site do parceiro

#### EAS (Expo Application Services)
- **projectId**: ID do projeto no Expo (obter em expo.dev)

## 2. Cores - Guia Visual

### Cores de Fundo (backgroundColor)

As cores são aplicadas em três contextos diferentes:

#### 1. Splash Screen
```json
"splash": {
  "backgroundColor": "#007AFF"
}
```
- **Onde aparece**: Tela inicial ao abrir o app
- **Recomendação**: Use a cor principal da marca
- **Formato**: Hexadecimal (#RRGGBB)

#### 2. Ícone iOS
```json
"ios": {
  "icon": {
    "backgroundColor": "#007AFF"
  }
}
```
- **Onde aparece**: Fundo do ícone no iOS (se o PNG tiver transparência)
- **Recomendação**: Mesma cor da splash ou cor da marca
- **Nota**: Apenas visível se o arquivo `icon.png` tiver áreas transparentes

#### 3. Adaptive Icon Android
```json
"android": {
  "adaptiveIcon": {
    "backgroundColor": "#007AFF"
  }
}
```
- **Onde aparece**: Fundo do ícone adaptativo no Android
- **Recomendação**: Cor sólida que contraste com o foreground
- **Nota**: Android aplica formas diferentes (círculo, quadrado, etc.)

### Exemplos de Paletas de Cores

```json
// Azul Corporativo
"backgroundColor": "#007AFF"

// Verde Vibrante
"backgroundColor": "#00C853"

// Roxo Moderno
"backgroundColor": "#6200EA"

// Laranja Energético
"backgroundColor": "#FF6D00"

// Vermelho Intenso
"backgroundColor": "#D50000"

// Azul Escuro Elegante
"backgroundColor": "#1A237E"
```

## 3. Assets - Especificações Técnicas

### icon.png (Ícone Principal)
- **Dimensões**: 1024x1024 pixels
- **Formato**: PNG com transparência (recomendado) ou fundo sólido
- **Uso**:
  - iOS: Ícone do app na Home Screen
  - Android: Base para ícone legado (se não houver adaptive icon)
- **Dicas**:
  - Evite texto pequeno (difícil de ler em tamanhos menores)
  - Use margens internas (~10%) para evitar cortes
  - Teste em diferentes tamanhos

### adaptive-icon.png (Android)
- **Dimensões**: 1024x1024 pixels
- **Formato**: PNG com transparência (recomendado)
- **Uso**: Foreground do ícone adaptativo Android
- **Área Segura**:
  - Conteúdo importante deve estar em círculo de 66% (676x676px no centro)
  - Android pode cortar em diferentes formas (círculo, quadrado arredondado, etc.)
- **Background**: Definido pela cor em `android.adaptiveIcon.backgroundColor`

### splash-icon.png (Logo Splash)
- **Dimensões Mínimas**: 200x200 pixels (recomendado: 400x400px ou maior)
- **Formato**: PNG com transparência (recomendado)
- **Uso**: Logo exibido no centro da tela splash
- **Dicas**:
  - Pode ser apenas o logo/marca (sem texto se desejar minimalismo)
  - Ficará centralizado sobre o `splash.backgroundColor`
  - Use `resizeMode: "contain"` para garantir que todo o logo seja visível

### favicon.png (Web)
- **Dimensões**: 48x48 pixels ou maior (recomendado: 192x192px)
- **Formato**: PNG
- **Uso**: Ícone exibido na aba do navegador (versão web do app)

## 4. Exemplo Completo: Partner 46 - Play Móvel

### Estrutura:
```
partners/partner-46-playmovel/
├── app.config.json
├── env.json
├── theme.json
├── assets/
│   ├── icon.png (1024x1024)
│   ├── adaptive-icon.png (1024x1024)
│   ├── splash-icon.png (400x400)
│   └── favicon.png (192x192)
└── README.md
```

### app.config.json:
```json
{
  "name": "Play Móvel",
  "slug": "playmovel",
  "owner": "playmovel-org",
  "version": "1.0.0",
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.playmovel.app",
    "buildNumber": "1",
    "icon": {
      "backgroundColor": "#007AFF"
    }
  },
  "android": {
    "package": "com.playmovel.app",
    "versionCode": 1,
    "adaptiveIcon": {
      "backgroundColor": "#007AFF"
    }
  },
  "splash": {
    "backgroundColor": "#007AFF",
    "resizeMode": "contain"
  },
  "extra": {
    "supportEmail": "suporte@playmovel.com.br",
    "supportPhone": "+55 11 0000-0000",
    "websiteUrl": "https://playmovel.com.br"
  },
  "eas": {
    "projectId": "your-expo-project-id-here"
  }
}
```

## 5. Checklist de Configuração

Ao criar um novo parceiro, verifique:

- [ ] Criar diretório `partners/partner-{ID}-{slug}/`
- [ ] Copiar e preencher `app.config.json`
- [ ] Definir cores de fundo consistentes:
  - [ ] `splash.backgroundColor`
  - [ ] `ios.icon.backgroundColor`
  - [ ] `android.adaptiveIcon.backgroundColor`
- [ ] Criar pasta `assets/` com todos os arquivos:
  - [ ] `icon.png` (1024x1024)
  - [ ] `adaptive-icon.png` (1024x1024)
  - [ ] `splash-icon.png` (400x400+)
  - [ ] `favicon.png` (192x192)
- [ ] Configurar `env.json` (variáveis de ambiente)
- [ ] Configurar `theme.json` (tema visual)
- [ ] Validar configuração: `./scripts/prepare-build.sh {ID} --validate`
- [ ] Testar localmente: `TENANT_ID={ID} npx expo start`
- [ ] Build de teste: `node scripts/build-partner.js {ID} --profile=preview`

## 6. Comandos Úteis

```bash
# Testar configuração localmente
TENANT_ID=46 npx expo start

# Validar configuração antes do build
./scripts/prepare-build.sh 46 --validate

# Sincronizar configs do backend
node scripts/sync-configs.js 46

# Build de preview (teste interno)
node scripts/build-partner.js 46 --platform=all --profile=preview

# Build de produção
node scripts/build-partner.js 46 --platform=all --profile=production
```

## 7. Recursos Adicionais

- [Expo Icon Guidelines](https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Documentação Interna: API-BACKEND.md](../API-BACKEND.md)
- [Documentação Interna: WHITELABEL.md](../WHITELABEL.md)

## 8. Solução de Problemas

### "Tenant not found" durante build
- Verifique se o diretório está nomeado corretamente: `partner-{ID}-{slug}`
- Execute `node scripts/sync-configs.js {ID}` para sincronizar do backend

### Cores não aplicadas
- Verifique se as cores estão no formato hexadecimal (#RRGGBB)
- Confirme que o `app.config.json` está válido (use um validador JSON)
- Limpe o cache: `npx expo start --clear`

### Ícones não aparecem
- Verifique as dimensões dos arquivos PNG
- Confirme que os arquivos estão em `partners/partner-{ID}-{slug}/assets/`
- Execute `npx expo prebuild --clean` para regenerar assets nativos

### Build falha
- Valide a configuração: `./scripts/prepare-build.sh {ID} --validate`
- Verifique logs de build no Expo: `eas build:list`
- Confirme que o `eas.projectId` está correto

---

**Última atualização**: 2025-01-16
**Versão do template**: 1.0.0
