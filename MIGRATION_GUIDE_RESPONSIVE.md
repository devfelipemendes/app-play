# Guia de Migração para Responsividade

Este guia detalha como migrar os componentes restantes do app para usar o sistema de responsividade implementado.

## ✅ Componentes Já Migrados (Top 4)

1. ✅ **BiometricLockScreen.tsx** - Completo
2. ✅ **bottom-tab-bar/index.tsx** - Completo
3. ✅ **hourly-card/index.tsx** - Completo
4. ✅ **CustomInput.tsx** - Completo

## 📋 Sistema de Responsividade Disponível

### Imports Necessários

```typescript
// Funções de escala básicas
import {
  scale,           // Escala média (width + height)
  scaleWidth,      // Escala horizontal
  scaleHeight,     // Escala vertical
  moderateScale,   // Escala moderada (para padding/margin)
  widthPercentage, // Porcentagem da largura
  heightPercentage // Porcentagem da altura
} from '@/utils/responsive'

// Constantes pré-definidas
import {
  TYPOGRAPHY,     // Tamanhos de fonte
  SPACING,        // Espaçamentos
  BORDER_RADIUS,  // Border radius
} from '@/utils/responsive'

// Constantes de componentes
import {
  BUTTON,
  CARD,
  INPUT,
  TAB_BAR,
  SHADOW,
  ICON,
  MODAL,
  // ... veja config/responsiveDimensions.ts para lista completa
} from '@/config/responsiveDimensions'

// Hook de breakpoints (para layouts condicionais)
import { useBreakpoint, useBreakpointValue, useResponsiveValue } from '@/hooks/useBreakpoint'
```

## 🔄 Padrões de Migração

### 1. FontSize → TYPOGRAPHY

| ❌ Antes | ✅ Depois |
|---------|----------|
| `fontSize: 32` | `fontSize: TYPOGRAPHY.h1` |
| `fontSize: 28` | `fontSize: TYPOGRAPHY.h2` |
| `fontSize: 24` | `fontSize: TYPOGRAPHY.h3` |
| `fontSize: 20` | `fontSize: TYPOGRAPHY.h4` |
| `fontSize: 18` | `fontSize: TYPOGRAPHY.h5` |
| `fontSize: 16` | `fontSize: TYPOGRAPHY.body` |
| `fontSize: 14` | `fontSize: TYPOGRAPHY.bodySmall` |
| `fontSize: 12` | `fontSize: TYPOGRAPHY.caption` |
| `fontSize: 10` | `fontSize: TYPOGRAPHY.overline` |

### 2. Padding/Margin → SPACING

| ❌ Antes | ✅ Depois |
|---------|----------|
| `padding: 2` | `padding: SPACING.quarter` |
| `padding: 4` | `padding: SPACING.half` |
| `padding: 8` | `padding: SPACING.base` |
| `padding: 12` | `padding: SPACING.oneAndHalf` |
| `padding: 16` | `padding: SPACING.double` |
| `padding: 24` | `padding: SPACING.triple` |
| `padding: 32` | `padding: moderateScale(32)` |

### 3. BorderRadius → BORDER_RADIUS

| ❌ Antes | ✅ Depois |
|---------|----------|
| `borderRadius: 0` | `borderRadius: BORDER_RADIUS.none` |
| `borderRadius: 4` | `borderRadius: BORDER_RADIUS.small` |
| `borderRadius: 8` | `borderRadius: BORDER_RADIUS.base` |
| `borderRadius: 12` | `borderRadius: BORDER_RADIUS.medium` |
| `borderRadius: 16` | `borderRadius: BORDER_RADIUS.large` |
| `borderRadius: 24` | `borderRadius: BORDER_RADIUS.xl` |
| `borderRadius: 999` | `borderRadius: BORDER_RADIUS.full` |

### 4. Dimensões Fixas → scale()

| ❌ Antes | ✅ Depois |
|---------|----------|
| `width: 100` | `width: scaleWidth(100)` |
| `height: 50` | `height: scaleHeight(50)` |
| `width: 24, height: 24` | `width: scale(24), height: scale(24)` |

### 5. Shadows → SHADOW

| ❌ Antes | ✅ Depois |
|---------|----------|
| `shadowOffset: { width: 0, height: 1 }` | `...SHADOW.small` |
| `shadowOffset: { width: 0, height: 2 }` | `...SHADOW.medium` |
| `shadowOffset: { width: 0, height: 4 }` | `...SHADOW.large` |
| `shadowOffset: { width: 0, height: 6 }` | `...SHADOW.xl` |

## 📦 Componentes Pendentes por Prioridade

### 🔴 ALTA PRIORIDADE (Impacto Visual Alto)

#### 1. days-card/index.tsx (12 problemas)
```typescript
// ANTES
style={{
  borderRadius: 16,
  padding: 16,
  shadowOffset: { width: 0, height: 4 },
}}

// DEPOIS
import { CARD, BORDER_RADIUS, SHADOW } from '@/config/responsiveDimensions'

style={{
  borderRadius: BORDER_RADIUS.medium,
  padding: CARD.padding,
  ...SHADOW.medium,
}}
```

#### 2. weekly-consumption.tsx (15 problemas)
```typescript
// ANTES
style={{
  paddingVertical: 24,
  paddingHorizontal: 12,
  borderRadius: 24,
  gap: 12,
  fontSize: 14,
}}

// DEPOIS
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, moderateScale } from '@/utils/responsive'

style={{
  paddingVertical: SPACING.triple,
  paddingHorizontal: SPACING.half,
  borderRadius: BORDER_RADIUS.large,
  gap: SPACING.half,
  fontSize: TYPOGRAPHY.bodySmall,
}}
```

#### 3. app/(tabs)/(home)/index.tsx (20+ problemas)
**Localização**: Tela principal do app
**Mudanças principais**:
- Line 290-297: VStack padding
- Line 302: fontSize 16 → TYPOGRAPHY.body
- Line 312: fontSize 14 → TYPOGRAPHY.bodySmall
- Line 342-353: Box padding/borderRadius
- Line 362: fontSize 20 → TYPOGRAPHY.h4

```typescript
// Exemplo de migração
// ANTES
<VStack
  style={{
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 24
  }}
>

// DEPOIS
import { SPACING, moderateScale } from '@/utils/responsive'

<VStack
  style={{
    paddingHorizontal: SPACING.double,
    paddingVertical: moderateScale(32),
    gap: SPACING.triple
  }}
>
```

#### 4. app/(tabs)/settings.tsx (25+ problemas)
**Principais mudanças**:
- Substituir todos `fontSize: 16` por `TYPOGRAPHY.body`
- Substituir `fontSize: 12` por `TYPOGRAPHY.caption`
- Substituir `borderRadius: 12` por `BORDER_RADIUS.base`
- Substituir `padding: 16` por `SPACING.double`

#### 5. app/(tabs)/support.tsx (20+ problemas)
**Principais mudanças**:
- Icon boxes: `width: 48, height: 48, borderRadius: 24` → `width: scale(48), height: scale(48), borderRadius: BORDER_RADIUS.large`
- Botões: padding/borderRadius
- Cards: padding/shadow

#### 6. PlansCarousel.tsx (PARCIALMENTE FEITO)
**Status**: Já tem objeto RESPONSIVE, mas precisa refinamento
**Mudanças**:
- Line 144: `borderRadius={20}` → `borderRadius={BORDER_RADIUS.large}`
- Line 233: `borderRadius: 12` → `borderRadius: BORDER_RADIUS.base`
- Line 314: `borderRadius: 16` → `borderRadius: BORDER_RADIUS.medium`

### 🟡 MÉDIA PRIORIDADE (Bottom Sheets e Modals)

#### 7. PortabilityBottomSheet.tsx (35+ problemas)
**Volume alto de mudanças**. Sugestão:
```typescript
// Adicionar imports
import { TYPOGRAPHY, SPACING, BORDER_RADIUS, moderateScale } from '@/utils/responsive'
import { INPUT, BOTTOM_SHEET, ALERT } from '@/config/responsiveDimensions'

// Substituir em massa:
// fontSize: 16 → TYPOGRAPHY.body
// fontSize: 14 → TYPOGRAPHY.bodySmall
// fontSize: 12 → TYPOGRAPHY.caption
// padding: 16 → SPACING.double ou BOTTOM_SHEET.padding
// borderRadius: 12 → BORDER_RADIUS.base
```

#### 8. ActivateLineBottomSheetWithSteps.tsx (50+ problemas)
**Alto volume**. Recomenda-se:
1. Criar StyleSheet separado com valores responsivos
2. Migrar inline styles para o StyleSheet
3. Usar constantes BOTTOM_SHEET

#### 9. ActivateLineBottomSheet.tsx (40+ problemas)
#### 10. AdditionalRechargeBottomSheet.tsx (40+ problemas)
#### 11. ChangePlanBottomSheet.tsx (30-40 problemas estimados)
#### 12. ActivateLineModal.tsx (40+ problemas)

### 🟢 BAIXA PRIORIDADE (Componentes Menores)

#### 13. CustomInputDatePicker.tsx (5 problemas)
```typescript
// ANTES
style={{
  fontSize: 14,
  color: 'red',
  fontSize: 12,
  marginTop: 4,
}}

// DEPOIS
import { TYPOGRAPHY, SPACING, moderateScale } from '@/utils/responsive'

style={{
  fontSize: TYPOGRAPHY.bodySmall,
  color: 'red',
  fontSize: TYPOGRAPHY.caption,
  marginTop: moderateScale(4),
}}
```

#### 14. app/(tabs)/(home)/days.tsx (15+ problemas)
#### 15. app/(tabs)/(home)/monthly.tsx (20+ problemas)

## 🎯 Estratégias de Migração

### Estratégia 1: Migração Incremental (Recomendado)
Migrar componentes um por um seguindo a ordem de prioridade.

### Estratégia 2: Find & Replace Inteligente
Para componentes com muitos problemas similares:

```bash
# Exemplo: Substituir fontSize: 16 por TYPOGRAPHY.body
# 1. Adicionar import no topo do arquivo
# 2. Find: fontSize: 16
# 3. Replace: fontSize: TYPOGRAPHY.body
```

### Estratégia 3: Refatoração Completa
Para bottom sheets com 40+ problemas:
1. Criar novo arquivo com estrutura limpa
2. Copiar lógica de negócio
3. Reescrever JSX com responsividade desde o início

## 📊 Template de Migração

Para cada arquivo a ser migrado:

### Passo 1: Adicionar Imports
```typescript
import {
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  moderateScale,
  scale,
  scaleWidth,
  scaleHeight,
  widthPercentage,
} from '@/utils/responsive'

import {
  CARD,
  BUTTON,
  INPUT,
  SHADOW,
  // ... outros conforme necessário
} from '@/config/responsiveDimensions'
```

### Passo 2: Identificar Padrões
Procure no arquivo por:
- `fontSize: <número>`
- `padding: <número>` ou `paddingVertical/Horizontal: <número>`
- `margin: <número>` ou `marginTop/Bottom: <número>`
- `borderRadius: <número>`
- `width: <número>` ou `height: <número>`
- `shadowOffset:`, `shadowRadius:`, `shadowOpacity:`

### Passo 3: Substituir
Use a tabela de padrões acima para fazer as substituições.

### Passo 4: Testar
```bash
# Rodar o app
npm start

# Testar em diferentes tamanhos
# - iPhone SE (375x667)
# - iPhone 14 (390x844)
# - iPad Pro (1024x1366)
```

## 🔍 Checklist por Componente

Para cada componente migrado:
- [ ] Imports adicionados
- [ ] FontSizes migrados para TYPOGRAPHY
- [ ] Paddings/Margins migrados para SPACING ou moderateScale
- [ ] BorderRadius migrado para BORDER_RADIUS
- [ ] Dimensões fixas migradas para scale/scaleWidth/scaleHeight
- [ ] Shadows migrados para SHADOW
- [ ] Colors hardcoded removidos (usar colors.* do tema)
- [ ] Testado em mobile
- [ ] Testado em tablet (se aplicável)

## 🚀 Scripts Úteis

### Script de Análise Rápida
```bash
# Contar ocorrências de fontSize hardcoded
grep -r "fontSize: [0-9]" components/ --include="*.tsx" | wc -l

# Encontrar todos borderRadius hardcoded
grep -r "borderRadius: [0-9]" components/ --include="*.tsx"
```

## 📈 Progresso Atual

| Categoria | Total | Migrados | Pendentes | % Completo |
|-----------|-------|----------|-----------|------------|
| Shared Components | 4 | 2 | 2 | 50% |
| Layout Components | 9 | 1 | 8 | 11% |
| Screen Components | 5 | 1 | 4 | 20% |
| Pages/Screens | 6 | 0 | 6 | 0% |
| **TOTAL** | **24** | **4** | **20** | **17%** |

## 💡 Dicas e Boas Práticas

### 1. Sempre use TYPOGRAPHY para texto
```typescript
// ❌ Evite
<Text style={{ fontSize: 16 }}>

// ✅ Prefira
<Text style={{ fontSize: TYPOGRAPHY.body }}>
```

### 2. Use moderateScale para espaçamento
```typescript
// ❌ Evite escalar demais
<View style={{ padding: scale(16) }}>

// ✅ Melhor - escala moderada
<View style={{ padding: moderateScale(16) }}>

// ✅ Ainda melhor - use constantes
<View style={{ padding: SPACING.double }}>
```

### 3. Use scale() para ícones e elementos quadrados
```typescript
// ✅ Correto
<Box style={{ width: scale(32), height: scale(32) }}>
```

### 4. Use scaleWidth/scaleHeight separadamente quando necessário
```typescript
// Para elementos que devem escalar diferente em cada dimensão
<View style={{
  width: scaleWidth(200),
  height: scaleHeight(100)
}}>
```

### 5. Use widthPercentage/heightPercentage para layouts fluidos
```typescript
// ✅ Responsivo
<View style={{ width: widthPercentage(90) }}>

// ❌ Fixo
<View style={{ width: 300 }}>
```

### 6. Use useBreakpoint para layouts condicionais
```typescript
const { isMobile, isTablet } = useBreakpoint()

return isMobile ? <MobileLayout /> : <TabletLayout />
```

### 7. Use SHADOW ao invés de criar shadows manualmente
```typescript
// ❌ Evite
style={{
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
}}

// ✅ Prefira
style={{
  ...SHADOW.medium,
}}
```

## 🐛 Troubleshooting

### Problema: Texto muito grande em tablets
**Solução**: Use TYPOGRAPHY ao invés de scale() direto para fontes

### Problema: Padding muito grande em tablets
**Solução**: Use moderateScale() ao invés de scale()

### Problema: Layout quebrado em orientação landscape
**Solução**: Use useBreakpoint() e ajuste condicionalmente

## 📞 Suporte

Para dúvidas:
- Veja exemplos em: `hooks/useBreakpoint.example.tsx`
- Documentação completa: `hooks/useBreakpoint.README.md`
- Lista de constantes: `config/responsiveDimensions.ts`

---

**Última atualização**: 2025-01-20
**Status**: 17% completo (4 de 24 componentes principais)
**Próximo componente**: days-card/index.tsx
