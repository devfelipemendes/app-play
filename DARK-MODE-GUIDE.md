# 🌙 Guia Completo de Dark Mode

## Índice
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Sistema de Cores Centralizado](#sistema-de-cores-centralizado)
3. [Como Implementar Dark Mode em Novas Telas](#como-implementar-dark-mode-em-novas-telas)
4. [Boas Práticas](#boas-práticas)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Troubleshooting](#troubleshooting)

---

## Visão Geral da Arquitetura

O sistema de dark mode usa 3 camadas integradas:

```
┌─────────────────────────────────────────┐
│      1. ThemeContext (Estado Global)    │
│  Armazena: colorMode ('light' | 'dark') │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│     2. NativeWind (Classes Tailwind)    │
│  Aplica classes 'dark:' quando ativo    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   3. useCompanyThemeSimple (Hook)       │
│  Retorna cores adaptadas ao modo atual  │
└─────────────────────────────────────────┘
```

### Arquivos Principais

```
app-play/
├── contexts/
│   └── theme-context/
│       └── index.tsx               # ThemeContext com colorMode
├── hooks/
│   └── theme/
│       └── useThemeLoader.ts       # Hook useCompanyThemeSimple
├── tailwind.config.js              # Config do NativeWind (darkMode: "class")
└── app/
    └── _layout.tsx                 # Sincroniza Context com NativeWind
```

---

## Sistema de Cores Centralizado

### 📍 Local Único para Cores: `hooks/theme/useThemeLoader.ts`

Todas as cores do app estão definidas no hook `useCompanyThemeSimple`:

```typescript
// hooks/theme/useThemeLoader.ts
export const useCompanyThemeSimple = () => {
  const { theme } = useWhitelabelTheme()
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.colorMode === 'dark'

  const primaryColor = theme?.colors?.primary || '#cc3366'
  const secondaryColor = theme?.colors?.secondary || '#000000'

  return {
    isDark,
    colors: {
      // Cores principais do tema
      primary: primaryColor,
      primaryLight80: lightenHexColor(primaryColor, 80),
      primaryLight60: lightenHexColor(primaryColor, 60),
      primaryLight50: lightenHexColor(primaryColor, 50),
      secondary: secondaryColor,

      // Cores adaptadas ao dark mode
      text: isDark ? '#ffffff' : '#1c1c22',
      textButton: '#ffffff',
      subTitle: isDark ? '#b0b0b0' : '#666',

      background: isDark ? '#1a1a1a' : '#ffffff',
      backgroundSecondary: isDark ? '#2a2a2a' : '#f5f5f5',

      divider: isDark ? '#333333' : '#e0e0e0',
      disabled: isDark ? '#666666' : '#bdbdbd',

      // Cores fixas (não mudam com o tema)
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',

      // ... outras cores
    }
  }
}
```

### Como Adicionar Novas Cores

**1. Adicione a cor no hook:**

```typescript
// hooks/theme/useThemeLoader.ts
export const useCompanyThemeSimple = () => {
  // ... código existente

  return {
    colors: {
      // ... cores existentes

      // ✅ ADICIONE AQUI suas novas cores
      cardBackground: isDark ? '#2a2a2a' : '#f8f8f8',
      borderColor: isDark ? '#404040' : '#e0e0e0',
      highlightText: isDark ? '#ffd700' : '#ff6b00',
    }
  }
}
```

**2. Use em qualquer componente:**

```typescript
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const MyComponent = () => {
  const { colors } = useCompanyThemeSimple()

  return (
    <View style={{ backgroundColor: colors.cardBackground }}>
      <Text style={{ color: colors.highlightText }}>
        Texto destacado
      </Text>
    </View>
  )
}
```

---

## Como Implementar Dark Mode em Novas Telas

### Template Completo de Tela com Dark Mode

```typescript
import React, { useContext } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { StatusBar } from 'expo-status-bar'
import { ThemeContext } from '@/contexts/theme-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const MyNewScreen = () => {
  // 1. Obter colorMode do Context
  const { colorMode } = useContext(ThemeContext)

  // 2. Obter cores adaptadas
  const { colors, isDark } = useCompanyThemeSimple()

  return (
    <VStack className="flex-1 bg-white dark:bg-gray-900">
      {/* 3. StatusBar dinâmica */}
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />

      {/* 4. Usar cores do hook OU classes Tailwind dark: */}

      {/* Opção A: Inline styles com cores do hook */}
      <Box style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.text }}>
          Texto adaptado ao tema
        </Text>
      </Box>

      {/* Opção B: Classes Tailwind com dark: */}
      <Box className="bg-white dark:bg-gray-800 p-4">
        <Text className="text-gray-900 dark:text-white">
          Texto com classes Tailwind
        </Text>
      </Box>
    </VStack>
  )
}

export default MyNewScreen
```

### Checklist para Novas Telas

- [ ] Importar `ThemeContext` e `useCompanyThemeSimple`
- [ ] Adicionar classe `dark:` no background principal
- [ ] Configurar StatusBar dinâmica
- [ ] Usar `colors` do hook para elementos customizados
- [ ] Usar classes `dark:` do Tailwind para elementos padrão
- [ ] Testar em ambos os modos (light e dark)

---

## Boas Práticas

### ✅ DO (Faça)

**1. Use classes Tailwind sempre que possível**
```typescript
// ✅ BOM - Usa classes Tailwind
<VStack className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">
    Título
  </Text>
</VStack>
```

**2. Use o hook para cores customizadas/branding**
```typescript
// ✅ BOM - Cores do tema/branding via hook
const { colors } = useCompanyThemeSimple()

<TouchableOpacity style={{ backgroundColor: colors.primary }}>
  <Text style={{ color: colors.textButton }}>
    Botão com cor do parceiro
  </Text>
</TouchableOpacity>
```

**3. Centralize cores no hook**
```typescript
// ✅ BOM - Definir uma vez no hook
// hooks/theme/useThemeLoader.ts
cardShadow: isDark
  ? '0px 2px 8px rgba(255,255,255,0.1)'
  : '0px 2px 8px rgba(0,0,0,0.15)'
```

**4. StatusBar dinâmica por tela**
```typescript
// ✅ BOM - Adapta ao colorMode
<StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
```

### ❌ DON'T (Não Faça)

**1. Não use cores hardcoded**
```typescript
// ❌ RUIM - Cor fixa não adapta ao dark mode
<Text style={{ color: '#000000' }}>Texto</Text>

// ✅ BOM
<Text style={{ color: colors.text }}>Texto</Text>
// ou
<Text className="text-gray-900 dark:text-white">Texto</Text>
```

**2. Não duplique definições de cores**
```typescript
// ❌ RUIM - Definindo cor em cada componente
const MyComponent = () => {
  const bgColor = isDark ? '#1a1a1a' : '#ffffff'
  // ...
}

// ✅ BOM - Use a cor centralizada
const { colors } = useCompanyThemeSimple()
const bgColor = colors.background
```

**3. Não ignore o StatusBar**
```typescript
// ❌ RUIM - StatusBar fixo
<StatusBar style="dark" />

// ✅ BOM - StatusBar adaptado
<StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
```

---

## Exemplos Práticos

### Exemplo 1: Card Simples

```typescript
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const SimpleCard = ({ title, description }) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <Box
      className="rounded-lg p-4 bg-white dark:bg-gray-800"
      style={{
        shadowColor: colors.text,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-lg font-bold text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        {description}
      </Text>
    </Box>
  )
}
```

### Exemplo 2: Botão com Cor do Tema

```typescript
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const ThemedButton = ({ onPress, children }) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
      }}
    >
      <Text style={{ color: colors.textButton, fontWeight: '600' }}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
```

### Exemplo 3: Lista com Dividers

```typescript
const ThemedList = ({ items }) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <VStack className="bg-white dark:bg-gray-900">
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <Box className="p-4">
            <Text className="text-gray-900 dark:text-white">
              {item.name}
            </Text>
          </Box>

          {index < items.length - 1 && (
            <Box
              style={{
                height: 1,
                backgroundColor: colors.divider
              }}
            />
          )}
        </React.Fragment>
      ))}
    </VStack>
  )
}
```

### Exemplo 4: Modal com Background Overlay

```typescript
const ThemedModal = ({ visible, onClose, children }) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <Modal visible={visible} transparent>
      <View style={{
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View
          className="w-11/12 rounded-xl bg-white dark:bg-gray-800 p-6"
          style={{
            shadowColor: colors.text,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
          }}
        >
          {children}

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 16,
              backgroundColor: colors.primary,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.textButton, textAlign: 'center' }}>
              Fechar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
```

---

## Paleta de Cores Disponível

### Cores Adaptadas ao Dark Mode

| Nome | Light Mode | Dark Mode | Uso |
|------|-----------|-----------|-----|
| `text` | `#1c1c22` | `#ffffff` | Texto principal |
| `subTitle` | `#666` | `#b0b0b0` | Texto secundário |
| `background` | `#ffffff` | `#1a1a1a` | Fundo principal |
| `backgroundSecondary` | `#f5f5f5` | `#2a2a2a` | Fundo de cards |
| `divider` | `#e0e0e0` | `#333333` | Linhas divisórias |
| `disabled` | `#bdbdbd` | `#666666` | Elementos desabilitados |

### Cores do Tema (Whitelabel)

| Nome | Descrição |
|------|-----------|
| `primary` | Cor primária do parceiro |
| `primaryLight80` | Variação 80% mais clara |
| `primaryLight60` | Variação 60% mais clara |
| `primaryLight50` | Variação 50% mais clara |
| `secondary` | Cor secundária do parceiro |

### Cores Fixas (Semânticas)

| Nome | Cor | Uso |
|------|-----|-----|
| `success` | `#4caf50` | Mensagens de sucesso |
| `error` | `#f44336` | Mensagens de erro |
| `warning` | `#ff9800` | Avisos |
| `info` | `#2196f3` | Informações |

---

## Troubleshooting

### Problema 1: Dark mode não está funcionando

**Sintomas:** Cores não mudam ao alternar o modo

**Solução:**
1. Verifique se `tailwind.config.js` tem `darkMode: "class"`
2. Verifique se `_layout.tsx` está sincronizando:
```typescript
const { setColorScheme } = useColorScheme()
useEffect(() => {
  setColorScheme(colorMode)
}, [colorMode, setColorScheme])
```

### Problema 2: Algumas cores não adaptam

**Sintomas:** Partes da tela não mudam no dark mode

**Solução:**
1. Verifique se está usando `colors` do hook:
```typescript
const { colors } = useCompanyThemeSimple()
```
2. Ou use classes Tailwind `dark:`:
```typescript
className="bg-white dark:bg-gray-900"
```

### Problema 3: StatusBar com cor errada

**Sintomas:** Texto do StatusBar invisível em alguns fundos

**Solução:**
Use StatusBar dinâmica:
```typescript
const { colorMode } = useContext(ThemeContext)
<StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
```

### Problema 4: Performance ruim ao trocar tema

**Sintomas:** App trava ao alternar dark/light mode

**Solução:**
1. Use `useMemo` para valores calculados:
```typescript
const cardStyle = useMemo(() => ({
  backgroundColor: colors.background,
  borderColor: colors.divider,
}), [colors])
```

2. Use `React.memo` em componentes que usam cores:
```typescript
export default React.memo(MyComponent)
```

---

## Referência Rápida

### Imports Necessários

```typescript
import { useContext } from 'react'
import { ThemeContext } from '@/contexts/theme-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { StatusBar } from 'expo-status-bar'
```

### Setup Básico

```typescript
const MyScreen = () => {
  const { colorMode } = useContext(ThemeContext)
  const { colors, isDark } = useCompanyThemeSimple()

  return (
    <VStack className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      {/* Conteúdo */}
    </VStack>
  )
}
```

### Toggle Dark Mode

```typescript
import { ThemeContext } from '@/contexts/theme-context'

const SettingsScreen = () => {
  const { colorMode, setColorMode } = useContext(ThemeContext)

  return (
    <Button onPress={() => setColorMode('dark')}>
      Modo Escuro
    </Button>
  )
}
```

---

## Integração com Backend (Whitelabel)

### Como o Sistema Está Preparado

O app já está preparado para receber cores do backend através do sistema **Whitelabel**. O fluxo funciona assim:

```
Backend API
    │
    ▼
WhitelabelThemeProvider (carrega tema do parceiro)
    │
    ▼
useCompanyThemeSimple (usa cores do backend + dark mode)
    │
    ▼
Componentes (renderizam com cores corretas)
```

### Estrutura de Cores do Backend

O backend deve retornar as cores no seguinte formato:

```json
{
  "id": 46,
  "name": "PLAY MÓVEL",
  "slug": "playmovel",
  "appTheme": {
    "colors": {
      "primary": "#cc3366",
      "secondary": "#000000"
    },
    "darkLightMode": false
  }
}
```

### Como Adicionar Mais Cores do Backend

**1. Adicione as cores no backend:**

```json
{
  "appTheme": {
    "colors": {
      "primary": "#cc3366",
      "secondary": "#000000",

      // ✅ Adicione novas cores aqui
      "accent": "#ff6b00",
      "buttonBackground": "#1a73e8",
      "headerBackground": "#2c2c2e"
    }
  }
}
```

**2. Atualize o tipo TypeScript:**

```typescript
// contexts/theme-context/whitelabel-theme-context.tsx
export interface ThemeColors {
  primary: string
  secondary: string
  accent?: string              // ✅ Adicione aqui
  buttonBackground?: string
  headerBackground?: string
}
```

**3. Use no hook:**

```typescript
// hooks/theme/useThemeLoader.ts
export const useCompanyThemeSimple = () => {
  const { theme } = useWhitelabelTheme()
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.colorMode === 'dark'

  const primaryColor = theme?.colors?.primary || '#cc3366'
  const secondaryColor = theme?.colors?.secondary || '#000000'
  const accentColor = theme?.colors?.accent || '#ff6b00' // ✅ Nova cor

  return {
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor, // ✅ Expor para componentes

      // Cores adaptadas ao dark mode
      text: isDark ? '#ffffff' : '#1c1c22',
      background: isDark ? '#1a1a1a' : '#ffffff',
      // ... outras cores
    }
  }
}
```

### Exemplo: Cores do Backend com Dark Mode

```typescript
export const useCompanyThemeSimple = () => {
  const { theme } = useWhitelabelTheme()
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.colorMode === 'dark'

  // Cores do backend (whitelabel)
  const primaryColor = theme?.colors?.primary || '#cc3366'
  const secondaryColor = theme?.colors?.secondary || '#000000'
  const accentColor = theme?.colors?.accent || '#ff6b00'

  return {
    isDark,
    colors: {
      // ✅ Cores do backend (não mudam com dark mode)
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,

      // Variações da cor primária
      primaryLight: lightenHexColor(primaryColor, 80),
      primaryDark: lightenHexColor(primaryColor, -20),

      // ✅ Cores que adaptam ao dark mode
      text: isDark ? '#ffffff' : '#1c1c22',
      textSecondary: isDark ? '#b0b0b0' : '#666666',

      background: isDark ? '#1a1a1a' : '#ffffff',
      backgroundCard: isDark ? '#2a2a2a' : '#f8f8f8',

      border: isDark ? '#404040' : '#e0e0e0',
      divider: isDark ? '#333333' : '#e0e0e0',

      // ✅ Cores semânticas (fixas)
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
    }
  }
}
```

### Exemplo Prático: Botão com Cor do Backend

```typescript
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const BrandedButton = ({ children, onPress }) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        // Usa cor primária do backend (whitelabel)
        backgroundColor: colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
      }}
    >
      <Text style={{
        color: '#ffffff',
        fontWeight: '600',
        textAlign: 'center'
      }}>
        {children}
      </Text>
    </TouchableOpacity>
  )
}
```

### Exemplo: Card com Cores Mistas (Backend + Dark Mode)

```typescript
const BrandedCard = ({ title, description }) => {
  const { colors, isDark } = useCompanyThemeSimple()

  return (
    <Box
      style={{
        // Fundo adapta ao dark mode
        backgroundColor: colors.backgroundCard,
        borderRadius: 16,
        padding: 16,
        // Borda com cor primária do backend
        borderWidth: 2,
        borderColor: colors.primary,
      }}
    >
      {/* Título com cor primária do backend */}
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary
      }}>
        {title}
      </Text>

      {/* Descrição adapta ao dark mode */}
      <Text style={{
        fontSize: 14,
        marginTop: 8,
        color: colors.textSecondary
      }}>
        {description}
      </Text>
    </Box>
  )
}
```

### Cenários de Uso

#### Cenário 1: Parceiro A (Azul)
```json
{
  "name": "Parceiro A",
  "appTheme": {
    "colors": {
      "primary": "#1a73e8",  // Azul
      "secondary": "#000000"
    }
  }
}
```

**Resultado:**
- Botões: Azul (#1a73e8)
- Títulos principais: Azul (#1a73e8)
- Fundos/textos: Adaptam ao dark/light mode

#### Cenário 2: Parceiro B (Verde)
```json
{
  "name": "Parceiro B",
  "appTheme": {
    "colors": {
      "primary": "#00a86b",  // Verde
      "secondary": "#333333"
    }
  }
}
```

**Resultado:**
- Botões: Verde (#00a86b)
- Títulos principais: Verde (#00a86b)
- Fundos/textos: Adaptam ao dark/light mode

### Backend + Dark Mode na Prática

```typescript
const ProfileScreen = () => {
  const { colors, isDark } = useCompanyThemeSimple()

  return (
    <VStack className="flex-1 bg-white dark:bg-gray-900">
      {/* Header com cor do backend */}
      <Box style={{
        backgroundColor: colors.primary,  // Cor do parceiro
        padding: 20
      }}>
        <Text style={{ color: '#ffffff', fontSize: 24 }}>
          Meu Perfil
        </Text>
      </Box>

      {/* Conteúdo adapta ao dark mode */}
      <VStack className="p-4" style={{ gap: 16 }}>
        <Box style={{
          backgroundColor: colors.backgroundCard, // Adapta ao modo
          padding: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary // Cor do parceiro
        }}>
          <Text style={{
            color: colors.text,  // Adapta ao modo
            fontSize: 16
          }}>
            Nome do Usuário
          </Text>
          <Text style={{
            color: colors.textSecondary, // Adapta ao modo
            fontSize: 14,
            marginTop: 4
          }}>
            usuario@email.com
          </Text>
        </Box>

        {/* Botão com cor do backend */}
        <TouchableOpacity style={{
          backgroundColor: colors.primary, // Cor do parceiro
          padding: 14,
          borderRadius: 12
        }}>
          <Text style={{
            color: '#ffffff',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            Editar Perfil
          </Text>
        </TouchableOpacity>
      </VStack>
    </VStack>
  )
}
```

### Testando Cores do Backend Localmente

**1. Arquivo local do parceiro:**

```json
// partners/partner-46-playmovel/theme.json
{
  "colors": {
    "primary": "#cc3366",
    "secondary": "#000000",
    "accent": "#ff6b00"
  }
}
```

**2. WhitelabelThemeProvider carrega automaticamente:**

O provider já carrega as cores do arquivo local e depois busca da API para atualizar:

```typescript
// contexts/theme-context/whitelabel-theme-context.tsx
export const WhitelabelThemeProvider = ({ children }) => {
  useEffect(() => {
    // 1. Carrega tema local (imediato)
    loadLocalTheme()

    // 2. Busca tema da API (assíncrono)
    loadThemeFromAPI()
  }, [])
}
```

### Estrutura Completa de Cores Backend

```json
{
  "appTheme": {
    "colors": {
      // Cores principais (obrigatórias)
      "primary": "#cc3366",
      "secondary": "#000000",

      // Cores opcionais
      "accent": "#ff6b00",
      "success": "#4caf50",
      "error": "#f44336",
      "warning": "#ff9800",
      "info": "#2196f3",

      // Cores específicas do app
      "headerBackground": "#cc3366",
      "buttonBackground": "#cc3366",
      "linkColor": "#1a73e8",
      "badgeColor": "#ff6b00"
    },

    // Dark mode habilitado por padrão para este parceiro?
    "darkLightMode": false
  }
}
```

### Checklist: Adicionar Nova Cor do Backend

- [ ] Adicionar cor no backend (JSON de retorno da API)
- [ ] Atualizar tipo TypeScript `ThemeColors`
- [ ] Adicionar fallback no `useCompanyThemeSimple`
- [ ] Usar a cor nos componentes via `colors.suaCor`
- [ ] Testar com diferentes parceiros
- [ ] Testar em dark e light mode

---

## Conclusão

O sistema de dark mode do app está totalmente centralizado em:
- **Estado**: `ThemeContext` (`contexts/theme-context/index.tsx`)
- **Cores**: `useCompanyThemeSimple` hook (`hooks/theme/useThemeLoader.ts`)
- **Classes**: NativeWind com `dark:` prefix

Para adicionar dark mode em qualquer tela:
1. Importe o Context e o hook
2. Use classes `dark:` ou cores do hook
3. Configure StatusBar dinâmica
4. Teste em ambos os modos

✨ **Simples, centralizado e consistente!**
