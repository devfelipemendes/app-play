# useBreakpoint - Hook de Responsividade

Sistema completo de breakpoints e responsividade para React Native, permitindo criar layouts adaptáveis para diferentes tamanhos de tela em Android e iOS.

## 📱 Breakpoints Suportados

O sistema usa 5 breakpoints baseados em dispositivos reais:

| Breakpoint | Largura       | Dispositivos Exemplo                                    |
|------------|---------------|---------------------------------------------------------|
| **xs**     | 0 - 374px     | iPhone SE (375x667), celulares Android pequenos         |
| **sm**     | 375 - 413px   | iPhone 12/13/14 (390x844), Pixel 5 (393x851)           |
| **md**     | 414 - 767px   | iPhone 14 Plus/Pro Max (428x926), Galaxy S21 (412x915) |
| **lg**     | 768 - 1023px  | iPad Mini (768x1024), tablets Android pequenos          |
| **xl**     | 1024px+       | iPad Air/Pro (1024x1366), tablets grandes               |

## 🎯 Instalação

Os arquivos já estão no projeto:

```
hooks/
  ├── useBreakpoint.ts         # Hook principal
  ├── useBreakpoint.example.tsx # Exemplos de uso
  └── useBreakpoint.README.md  # Esta documentação

utils/
  └── responsive.ts            # Utilitários de escala
```

## 🚀 Uso Básico

### 1. Detectar Breakpoint Atual

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';

function MyComponent() {
  const { breakpoint, isSmall, isMobile, width, height } = useBreakpoint();

  return (
    <View>
      <Text>Breakpoint: {breakpoint}</Text>
      <Text>Largura: {width}px</Text>
      {isSmall && <Text>Tela pequena detectada!</Text>}
    </View>
  );
}
```

### 2. Renderização Condicional

```tsx
function MyComponent() {
  const { isMobile, isTablet } = useBreakpoint();

  if (isMobile) {
    return <MobileLayout />;
  }

  return <TabletLayout />;
}
```

### 3. Valores Responsivos por Breakpoint

```tsx
import { useBreakpointValue } from '@/hooks/useBreakpoint';

function MyComponent() {
  // Retorna valores diferentes por breakpoint
  const columns = useBreakpointValue({
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
  });

  const padding = useBreakpointValue({
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  });

  return (
    <View style={{ padding }}>
      <FlatList numColumns={columns} />
    </View>
  );
}
```

### 4. Valores Mobile vs Tablet (Simplificado)

```tsx
import { useResponsiveValue } from '@/hooks/useBreakpoint';

function MyComponent() {
  // Apenas 2 valores: mobile (< 768px) e tablet (>= 768px)
  const fontSize = useResponsiveValue(14, 18);
  const columns = useResponsiveValue(1, 3);

  return (
    <View>
      <Text style={{ fontSize }}>Texto responsivo</Text>
      <FlatList numColumns={columns} />
    </View>
  );
}
```

## 📏 Utilitários de Escala Responsiva

### Funções de Escala Básicas

```tsx
import {
  scale,
  scaleWidth,
  scaleHeight,
  moderateScale,
  scaleFont,
} from '@/utils/responsive';

// scale() - Escala baseada na média de largura e altura
// Melhor para: fontes, ícones, elementos gerais
const iconSize = scale(24);
const fontSize = scale(16);

// scaleWidth() - Escala baseada apenas na largura
// Melhor para: width, marginHorizontal, paddingHorizontal
const buttonWidth = scaleWidth(200);
const paddingX = scaleWidth(16);

// scaleHeight() - Escala baseada apenas na altura
// Melhor para: height, marginVertical, paddingVertical
const headerHeight = scaleHeight(60);
const paddingY = scaleHeight(20);

// moderateScale() - Escala moderada (não escala demais)
// Melhor para: padding, margin, borderRadius
const padding = moderateScale(16); // Escala 50% por padrão
const borderRadius = moderateScale(8, 0.3); // Escala apenas 30%

// scaleFont() - Escala específica para fontes com limites
const title = scaleFont(24, { minSize: 20, maxSize: 32 });
const body = scaleFont(16); // Limites automáticos
```

### Design Base

Todas as escalas são baseadas no **iPhone 11 Pro (375x812)** como referência de design:

```tsx
// Em um iPhone 11 Pro (375x812)
scale(16) // = 16px (referência)
scaleWidth(100) // = 100px
scaleHeight(50) // = 50px

// Em um iPhone 14 Plus (428x926) - Tela maior
scale(16) // ≈ 18.5px (escala proporcional)
scaleWidth(100) // ≈ 114px
scaleHeight(50) // ≈ 57px

// Em um iPad Pro (1024x1366) - Tela muito maior
scale(16) // ≈ 28px
scaleWidth(100) // ≈ 273px
```

## 🎨 Sistemas Pré-definidos

### Sistema de Espaçamento

```tsx
import { SPACING } from '@/utils/responsive';

<View
  style={{
    padding: SPACING.base,        // 8 escalonado
    marginTop: SPACING.double,    // 16 escalonado
    gap: SPACING.half,            // 4 escalonado
  }}
/>

// Valores disponíveis:
SPACING.quarter  // base * 0.25 (2px escalonado)
SPACING.half     // base * 0.5  (4px escalonado)
SPACING.base     // base        (8px escalonado)
SPACING.oneAndHalf // base * 1.5 (12px escalonado)
SPACING.double   // base * 2    (16px escalonado)
SPACING.triple   // base * 3    (24px escalonado)
```

### Sistema de Border Radius

```tsx
import { BORDER_RADIUS } from '@/utils/responsive';

<View
  style={{
    borderRadius: BORDER_RADIUS.medium,
  }}
/>

// Valores disponíveis:
BORDER_RADIUS.none    // 0
BORDER_RADIUS.small   // 4px escalonado
BORDER_RADIUS.base    // 8px escalonado
BORDER_RADIUS.medium  // 12px escalonado
BORDER_RADIUS.large   // 16px escalonado
BORDER_RADIUS.xl      // 24px escalonado
BORDER_RADIUS.full    // 9999 (círculo completo)
```

### Sistema de Tipografia

```tsx
import { TYPOGRAPHY } from '@/utils/responsive';

<View>
  <Text style={{ fontSize: TYPOGRAPHY.h1 }}>Título Grande</Text>
  <Text style={{ fontSize: TYPOGRAPHY.h2 }}>Título Médio</Text>
  <Text style={{ fontSize: TYPOGRAPHY.body }}>Texto Normal</Text>
  <Text style={{ fontSize: TYPOGRAPHY.caption }}>Legenda</Text>
</View>

// Tamanhos disponíveis (com limites min/max):
TYPOGRAPHY.h1         // 32px (min: 28, max: 40)
TYPOGRAPHY.h2         // 28px (min: 24, max: 36)
TYPOGRAPHY.h3         // 24px (min: 20, max: 32)
TYPOGRAPHY.h4         // 20px (min: 18, max: 28)
TYPOGRAPHY.h5         // 18px (min: 16, max: 24)
TYPOGRAPHY.h6         // 16px (min: 14, max: 22)
TYPOGRAPHY.body       // 16px (min: 14, max: 18)
TYPOGRAPHY.bodySmall  // 14px (min: 12, max: 16)
TYPOGRAPHY.caption    // 12px (min: 11, max: 14)
TYPOGRAPHY.overline   // 10px (min: 9, max: 12)
```

## 🧩 Utilitários Adicionais

### Porcentagens

```tsx
import { widthPercentage, heightPercentage } from '@/utils/responsive';

// 80% da largura da tela
const cardWidth = widthPercentage(80);

// 30% da altura da tela
const modalHeight = heightPercentage(30);

<View style={{ width: widthPercentage(90), height: heightPercentage(50) }} />
```

### Valores Responsivos Multi-breakpoint

```tsx
import { responsiveMultiValue } from '@/utils/responsive';

const imageSize = responsiveMultiValue({
  xs: 80,
  sm: 100,
  md: 120,
  lg: 150,
  xl: 200,
});

<Image
  source={{ uri: '...' }}
  style={{ width: imageSize, height: imageSize }}
/>
```

### Normalização

```tsx
import { normalize } from '@/utils/responsive';

// Normaliza com escala moderada
const padding = normalize(16, 'spacing');  // Para espaçamento
const fontSize = normalize(14, 'font');    // Para fontes
const iconSize = normalize(24, 'size');    // Para tamanhos gerais
```

### Informações do Dispositivo

```tsx
import { getDeviceInfo } from '@/utils/responsive';

const info = getDeviceInfo();
console.log(info);
/*
{
  width: 390,
  height: 844,
  widthScale: 1.04,
  heightScale: 1.04,
  averageScale: 1.04,
  isSmall: false,
  isMedium: false,
  isLarge: false,
  isTablet: false,
  aspectRatio: 0.46,
  platform: 'ios'
}
*/
```

## 💡 Casos de Uso Práticos

### Grid Responsivo

```tsx
import { useBreakpointValue } from '@/hooks/useBreakpoint';
import { SPACING } from '@/utils/responsive';

function ProductGrid() {
  const numColumns = useBreakpointValue({
    xs: 2,  // 2 colunas em celulares pequenos
    sm: 2,  // 2 colunas em celulares médios
    md: 3,  // 3 colunas em celulares grandes
    lg: 4,  // 4 colunas em tablets pequenos
    xl: 6,  // 6 colunas em tablets grandes
  });

  return (
    <FlatList
      data={products}
      numColumns={numColumns}
      key={numColumns} // Force re-render
      renderItem={({ item }) => (
        <View style={{ flex: 1 / (numColumns || 2), padding: SPACING.half }}>
          <ProductCard product={item} />
        </View>
      )}
    />
  );
}
```

### Card Responsivo

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import {
  moderateScale,
  scale,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  widthPercentage,
} from '@/utils/responsive';

function ResponsiveCard() {
  const { isMobile } = useBreakpoint();

  return (
    <View
      style={{
        width: isMobile ? widthPercentage(90) : widthPercentage(45),
        backgroundColor: 'white',
        borderRadius: BORDER_RADIUS.large,
        padding: moderateScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
        elevation: 3,
      }}
    >
      <Text style={{ fontSize: TYPOGRAPHY.h3, fontWeight: 'bold' }}>
        Título
      </Text>
      <Text style={{ fontSize: TYPOGRAPHY.body, marginTop: SPACING.base }}>
        Conteúdo do card
      </Text>
    </View>
  );
}
```

### Form Responsivo

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/utils/responsive';

function ResponsiveForm() {
  const { isTablet } = useBreakpoint();

  return (
    <View
      style={{
        maxWidth: isTablet ? 600 : '100%',
        alignSelf: 'center',
        width: '100%',
      }}
    >
      {/* Campos em linha no tablet, empilhados no mobile */}
      <View
        style={{
          flexDirection: isTablet ? 'row' : 'column',
          gap: SPACING.base,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: TYPOGRAPHY.bodySmall }}>Nome</Text>
          <TextInput
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: BORDER_RADIUS.base,
              paddingHorizontal: SPACING.base,
            }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: TYPOGRAPHY.bodySmall }}>Email</Text>
          <TextInput
            style={{
              height: 48,
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: BORDER_RADIUS.base,
              paddingHorizontal: SPACING.base,
            }}
          />
        </View>
      </View>
    </View>
  );
}
```

### Navegação Responsiva

```tsx
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { scaleWidth, SPACING, TYPOGRAPHY } from '@/utils/responsive';

function ResponsiveNavigation() {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    // Navegação em bottom tabs (mobile)
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{/* Conteúdo */}</View>
        <View
          style={{
            height: 60,
            flexDirection: 'row',
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
          }}
        >
          <TabButton label="Home" />
          <TabButton label="Buscar" />
          <TabButton label="Perfil" />
        </View>
      </View>
    );
  }

  // Navegação em sidebar (tablet)
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View
        style={{
          width: scaleWidth(250),
          backgroundColor: 'white',
          borderRightWidth: 1,
          borderRightColor: '#e0e0e0',
          padding: SPACING.base,
        }}
      >
        <Text style={{ fontSize: TYPOGRAPHY.h3 }}>Menu</Text>
        <MenuItem label="Home" />
        <MenuItem label="Buscar" />
        <MenuItem label="Perfil" />
      </View>
      <View style={{ flex: 1 }}>{/* Conteúdo */}</View>
    </View>
  );
}
```

## 📊 API Completa

### useBreakpoint()

Retorna um objeto com as seguintes propriedades:

```typescript
{
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl',
  width: number,
  height: number,
  isPortrait: boolean,
  isLandscape: boolean,
  isXSmall: boolean,    // < 375px
  isSmall: boolean,     // 375-413px
  isMedium: boolean,    // 414-767px
  isLarge: boolean,     // 768-1023px
  isXLarge: boolean,    // >= 1024px
  isMobile: boolean,    // < 768px
  isTablet: boolean,    // >= 768px
}
```

### useBreakpointValue(values)

```typescript
useBreakpointValue<T>(values: Partial<Record<BreakpointName, T>>): T | undefined
```

### useResponsiveValue(mobileValue, tabletValue)

```typescript
useResponsiveValue<T>(mobileValue: T, tabletValue: T): T
```

### Funções de Escala

```typescript
scale(size: number): number
scaleWidth(size: number): number
scaleHeight(size: number): number
moderateScale(size: number, factor?: number): number
scaleFont(size: number, options?: { factor?: number; minSize?: number; maxSize?: number }): number
```

### Funções de Porcentagem

```typescript
widthPercentage(percentage: number): number
heightPercentage(percentage: number): number
```

### Funções de Valor Responsivo

```typescript
responsiveValue<T>(mobileValue: T, tabletValue: T): T
responsiveMultiValue<T>(values: { xs?: T; sm?: T; md?: T; lg?: T; xl?: T }): T | undefined
```

## 🎯 Boas Práticas

### 1. Use o sistema de tipografia predefinido

```tsx
// ✅ Bom
<Text style={{ fontSize: TYPOGRAPHY.body }}>Texto</Text>

// ❌ Evite
<Text style={{ fontSize: scale(16) }}>Texto</Text>
```

### 2. Use SPACING para consistência

```tsx
// ✅ Bom
<View style={{ padding: SPACING.base, gap: SPACING.half }} />

// ❌ Evite
<View style={{ padding: moderateScale(8), gap: moderateScale(4) }} />
```

### 3. Use moderateScale para espaçamento

```tsx
// ✅ Bom - não escala demais
const padding = moderateScale(16);

// ❌ Evite - pode ficar muito grande em tablets
const padding = scale(16);
```

### 4. Prefira useBreakpointValue para múltiplos valores

```tsx
// ✅ Bom - controle fino
const columns = useBreakpointValue({
  xs: 1,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 6,
});

// ⚠️ OK para casos simples
const columns = useResponsiveValue(2, 4);
```

### 5. Use scaleWidth/scaleHeight apropriadamente

```tsx
// ✅ Bom
<View
  style={{
    width: scaleWidth(200),        // Escala horizontal
    height: scaleHeight(100),      // Escala vertical
    padding: moderateScale(16),    // Escala moderada
    borderRadius: BORDER_RADIUS.base,
  }}
/>
```

## 🐛 Troubleshooting

### O layout não atualiza ao rotacionar o dispositivo

Certifique-se de que o hook está sendo usado dentro de um componente funcional e que o componente não está sendo memoizado de forma incorreta.

### Fontes ficam muito grandes em tablets

Use `scaleFont()` com limites min/max:

```tsx
const fontSize = scaleFont(16, { minSize: 14, maxSize: 20 });
```

### FlatList não atualiza o número de colunas

Adicione a prop `key` com o valor de `numColumns`:

```tsx
<FlatList
  numColumns={numColumns}
  key={numColumns} // ← Importante!
  ...
/>
```

## 📚 Referências

- [React Native Dimensions API](https://reactnative.dev/docs/dimensions)
- [Material Design - Layout](https://m3.material.io/foundations/layout/understanding-layout/overview)
- [iOS Human Interface Guidelines - Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Tailwind CSS Breakpoints](https://tailwindcss.com/docs/responsive-design)

## 📄 Licença

Este código faz parte do projeto app-play e segue a mesma licença do projeto.

---

**Criado por**: DevFelipe
**Última atualização**: 2025-01-16
