/**
 * useBreakpoint Hook
 *
 * Hook para detectar breakpoints responsivos em React Native.
 * Suporta diferentes tamanhos de tela de dispositivos Android e iOS.
 *
 * @example
 * ```tsx
 * const { breakpoint, isSmall, isMedium, isLarge, width, height } = useBreakpoint();
 *
 * // Uso condicional
 * if (isSmall) {
 *   return <CompactView />;
 * }
 *
 * // Uso com valores responsivos
 * <View style={{ padding: isSmall ? 10 : 20 }} />
 * ```
 */

import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

/**
 * Definição de breakpoints baseados em larguras comuns de dispositivos
 *
 * Referências de dispositivos:
 * - xs (extra small): 0-374px
 *   - iPhone SE (375x667)
 *   - Pequenos Android
 *
 * - sm (small): 375-413px
 *   - iPhone 12/13/14 (390x844)
 *   - iPhone 12/13/14 Pro (393x852)
 *   - Pixel 5 (393x851)
 *
 * - md (medium): 414-767px
 *   - iPhone 14 Plus/Pro Max (428x926)
 *   - Samsung Galaxy S21 (412x915)
 *   - OnePlus 9 (412x919)
 *
 * - lg (large): 768-1023px
 *   - iPad Mini (768x1024)
 *   - Tablets Android pequenos
 *
 * - xl (extra large): 1024+px
 *   - iPad Air/Pro (1024x1366 / 1024x1366)
 *   - Tablets grandes
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
} as const;

/**
 * Tipo para os nomes dos breakpoints
 */
export type BreakpointName = keyof typeof BREAKPOINTS;

/**
 * Interface de retorno do hook useBreakpoint
 */
export interface UseBreakpointReturn {
  /** Nome do breakpoint atual (xs, sm, md, lg, xl) */
  breakpoint: BreakpointName;

  /** Largura atual da tela */
  width: number;

  /** Altura atual da tela */
  height: number;

  /** Indica se a tela está em orientação portrait (vertical) */
  isPortrait: boolean;

  /** Indica se a tela está em orientação landscape (horizontal) */
  isLandscape: boolean;

  /** Indica se é um dispositivo extra pequeno (< 375px) */
  isXSmall: boolean;

  /** Indica se é um dispositivo pequeno (375-413px) */
  isSmall: boolean;

  /** Indica se é um dispositivo médio (414-767px) */
  isMedium: boolean;

  /** Indica se é um dispositivo grande/tablet (768-1023px) */
  isLarge: boolean;

  /** Indica se é um dispositivo extra grande/tablet (>= 1024px) */
  isXLarge: boolean;

  /** Indica se é um dispositivo móvel (< 768px) */
  isMobile: boolean;

  /** Indica se é um tablet (>= 768px) */
  isTablet: boolean;
}

/**
 * Determina o breakpoint atual baseado na largura da tela
 */
function getBreakpoint(width: number): BreakpointName {
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook personalizado para detectar breakpoints e dimensões da tela
 *
 * @returns {UseBreakpointReturn} Objeto com informações do breakpoint atual
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { breakpoint, isSmall, isMobile, width } = useBreakpoint();
 *
 *   return (
 *     <View>
 *       <Text>Breakpoint atual: {breakpoint}</Text>
 *       <Text>Largura: {width}px</Text>
 *       {isSmall && <Text>Você está em um celular pequeno!</Text>}
 *       {isMobile && <SmallScreenLayout />}
 *       {!isMobile && <LargeScreenLayout />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useBreakpoint(): UseBreakpointReturn {
  const [dimensions, setDimensions] = useState<ScaledSize>(() =>
    Dimensions.get('window')
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const breakpoint = getBreakpoint(width);
  const isPortrait = height >= width;
  const isLandscape = width > height;

  return {
    breakpoint,
    width,
    height,
    isPortrait,
    isLandscape,
    isXSmall: breakpoint === 'xs',
    isSmall: breakpoint === 'sm',
    isMedium: breakpoint === 'md',
    isLarge: breakpoint === 'lg',
    isXLarge: breakpoint === 'xl',
    isMobile: width < BREAKPOINTS.lg, // < 768px
    isTablet: width >= BREAKPOINTS.lg, // >= 768px
  };
}

/**
 * Hook para obter valores responsivos baseados no breakpoint atual
 *
 * @template T Tipo do valor a ser retornado
 * @param values Objeto com valores para cada breakpoint
 * @returns Valor correspondente ao breakpoint atual
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const padding = useBreakpointValue({
 *     xs: 8,
 *     sm: 12,
 *     md: 16,
 *     lg: 20,
 *     xl: 24,
 *   });
 *
 *   const columns = useBreakpointValue({
 *     xs: 1,
 *     sm: 1,
 *     md: 2,
 *     lg: 3,
 *     xl: 4,
 *   });
 *
 *   return (
 *     <View style={{ padding }}>
 *       <FlatList numColumns={columns} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useBreakpointValue<T>(
  values: Partial<Record<BreakpointName, T>>
): T | undefined {
  const { breakpoint } = useBreakpoint();

  // Tenta encontrar o valor exato do breakpoint atual
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }

  // Se não encontrar, procura o breakpoint mais próximo abaixo
  const breakpointOrder: BreakpointName[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  // Se não encontrar nenhum, retorna o primeiro valor disponível
  for (const bp of breakpointOrder) {
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  return undefined;
}

/**
 * Hook para criar valores responsivos com base em mobile/tablet
 * Similar ao useBreakpointValue, mas simplificado para 2 casos
 *
 * @template T Tipo do valor a ser retornado
 * @param mobileValue Valor para dispositivos mobile (< 768px)
 * @param tabletValue Valor para tablets (>= 768px)
 * @returns Valor correspondente ao tipo de dispositivo
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const fontSize = useResponsiveValue(14, 18);
 *   const gridColumns = useResponsiveValue(1, 2);
 *
 *   return (
 *     <View>
 *       <Text style={{ fontSize }}>Texto responsivo</Text>
 *       <FlatList numColumns={gridColumns} />
 *     </View>
 *   );
 * }
 * ```
 */
export function useResponsiveValue<T>(mobileValue: T, tabletValue: T): T {
  const { isMobile } = useBreakpoint();
  return isMobile ? mobileValue : tabletValue;
}
