/**
 * Responsive Utilities
 *
 * Utilitários para escalonamento responsivo de valores em React Native.
 * Baseados nas dimensões do dispositivo para criar layouts adaptáveis.
 *
 * Referências de design:
 * - Design base: iPhone 11 Pro (375 x 812)
 * - Escalona proporcionalmente para outros dispositivos
 */

import { Dimensions, Platform, StatusBar } from 'react-native'

/**
 * Dimensões de referência para cálculos de escala
 * Baseado no iPhone 11 Pro como design de referência
 */
const DESIGN_WIDTH = 375
const DESIGN_HEIGHT = 812

/**
 * Obtém as dimensões atuais da janela
 */
function getDimensions() {
  return Dimensions.get('window')
}

/**
 * Calcula a largura da tela atual
 */
export function getScreenWidth(): number {
  return getDimensions().width
}

/**
 * Calcula a altura da tela atual
 */
export function getScreenHeight(): number {
  return getDimensions().height
}

/**
 * Calcula a altura real disponível (excluindo status bar no Android)
 */
export function getAvailableHeight(): number {
  const windowHeight = getScreenHeight()

  if (Platform.OS === 'android' && StatusBar.currentHeight) {
    return windowHeight - StatusBar.currentHeight
  }

  return windowHeight
}

/**
 * Fatores de escala baseados nas dimensões do dispositivo
 */
export function getScaleFactors() {
  const { width, height } = getDimensions()

  return {
    widthScale: width / DESIGN_WIDTH,
    heightScale: height / DESIGN_HEIGHT,
    averageScale: (width / DESIGN_WIDTH + height / DESIGN_HEIGHT) / 2,
  }
}

/**
 * Escalona um valor baseado na largura da tela
 *
 * Útil para dimensões horizontais (width, marginHorizontal, paddingHorizontal)
 *
 * @param size Tamanho base do design (baseado em 375px de largura)
 * @returns Tamanho escalonado para a largura atual
 *
 * @example
 * ```tsx
 * const buttonWidth = scaleWidth(100); // 100px em iPhone 11, proporcional em outros
 * <View style={{ width: scaleWidth(200), paddingHorizontal: scaleWidth(16) }} />
 * ```
 */
export function scaleWidth(size: number): number {
  const { widthScale } = getScaleFactors()
  return size * widthScale
}

/**
 * Escalona um valor baseado na altura da tela
 *
 * Útil para dimensões verticais (height, marginVertical, paddingVertical)
 *
 * @param size Tamanho base do design (baseado em 812px de altura)
 * @returns Tamanho escalonado para a altura atual
 *
 * @example
 * ```tsx
 * const headerHeight = scaleHeight(60); // 60px em iPhone 11, proporcional em outros
 * <View style={{ height: scaleHeight(200), paddingVertical: scaleHeight(20) }} />
 * ```
 */
export function scaleHeight(size: number): number {
  const { heightScale } = getScaleFactors()
  return size * heightScale
}

/**
 * Escalona um valor baseado na média entre largura e altura
 *
 * Melhor opção para fontes e elementos que devem escalar proporcionalmente
 * em ambas as dimensões (textos, ícones, bordas)
 *
 * @param size Tamanho base do design
 * @returns Tamanho escalonado baseado na média das dimensões
 *
 * @example
 * ```tsx
 * const fontSize = scale(16); // Escala proporcionalmente
 * const iconSize = scale(24);
 * <Text style={{ fontSize: scale(14) }}>Texto responsivo</Text>
 * ```
 */
export function scale(size: number): number {
  const { averageScale } = getScaleFactors()
  return size * averageScale
}

/**
 * Escalona um valor de forma moderada (com fator de redução)
 *
 * Útil quando você não quer que elementos escalem demais em telas grandes.
 * O fator padrão de 0.5 significa que a escala é reduzida em 50%.
 *
 * @param size Tamanho base do design
 * @param factor Fator de moderação (0-1, padrão: 0.5)
 * @returns Tamanho escalonado moderadamente
 *
 * @example
 * ```tsx
 * // Em uma tela 2x maior, o padding só aumenta em 50% ao invés de 100%
 * const padding = moderateScale(20); // Escala mais suave
 * const borderRadius = moderateScale(8, 0.3); // Escala ainda mais suave
 *
 * <View style={{
 *   padding: moderateScale(16),
 *   borderRadius: moderateScale(12)
 * }} />
 * ```
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  const { averageScale } = getScaleFactors()
  return size + (averageScale - 1) * size * factor
}

/**
 * Escalona fontes de forma inteligente
 *
 * Aplica escala moderada para fontes, com limites min/max para evitar
 * textos muito pequenos ou muito grandes
 *
 * @param size Tamanho base da fonte
 * @param options Opções de configuração
 * @returns Tamanho da fonte escalonado com limites
 *
 * @example
 * ```tsx
 * const title = scaleFont(24, { minSize: 20, maxSize: 32 });
 * const body = scaleFont(16);
 * const caption = scaleFont(12, { factor: 0.3 });
 *
 * <Text style={{ fontSize: scaleFont(18) }}>Título</Text>
 * ```
 */
export function scaleFont(
  size: number,
  options: {
    factor?: number
    minSize?: number
    maxSize?: number
  } = {},
): number {
  const { factor = 0.4, minSize, maxSize } = options

  let scaledSize = moderateScale(size, factor)

  // Aplica limites se definidos
  if (minSize !== undefined && scaledSize < minSize) {
    scaledSize = minSize
  }

  if (maxSize !== undefined && scaledSize > maxSize) {
    scaledSize = maxSize
  }

  return Math.round(scaledSize)
}

/**
 * Cria um objeto de espaçamento responsivo
 *
 * @param spacing Valor base de espaçamento
 * @returns Objeto com valores de espaçamento escalonados
 *
 * @example
 * ```tsx
 * const spacing = createSpacing(16);
 * <View style={{
 *   padding: spacing.base,      // 16 escalonado
 *   marginTop: spacing.half,    // 8 escalonado
 *   gap: spacing.double         // 32 escalonado
 * }} />
 * ```
 */
export function createSpacing(spacing: number) {
  return {
    quarter: moderateScale(spacing * 0.25),
    half: moderateScale(spacing * 0.5),
    base: moderateScale(spacing),
    oneAndHalf: moderateScale(spacing * 1.5),
    double: moderateScale(spacing * 2),
    triple: moderateScale(spacing * 3),
  }
}

/**
 * Sistema de espaçamento padrão (base: 8px)
 */
export const SPACING = createSpacing(8)

/**
 * Cria valores de borda responsivos
 *
 * @param radius Raio base da borda
 * @returns Objeto com valores de border radius escalonados
 *
 * @example
 * ```tsx
 * const borders = createBorderRadius(8);
 * <View style={{
 *   borderRadius: borders.base,    // 8 escalonado
 *   borderRadius: borders.large,   // 16 escalonado
 * }} />
 * ```
 */
export function createBorderRadius(radius: number) {
  return {
    none: 0,
    small: moderateScale(radius * 0.5, 0.3),
    base: moderateScale(radius, 0.3),
    medium: moderateScale(radius * 1.5, 0.3),
    large: moderateScale(radius * 2, 0.3),
    xl: moderateScale(radius * 3, 0.3),
    full: 9999,
  }
}

/**
 * Sistema de border radius padrão (base: 8px)
 */
export const BORDER_RADIUS = createBorderRadius(8)

/**
 * Sistema de tipografia responsiva
 */
export const TYPOGRAPHY = {
  h1: scaleFont(32, { minSize: 28, maxSize: 40 }),
  h2: scaleFont(28, { minSize: 24, maxSize: 36 }),
  h3: scaleFont(22, { minSize: 20, maxSize: 32 }),
  h4: scaleFont(20, { minSize: 18, maxSize: 28 }),
  h5: scaleFont(18, { minSize: 16, maxSize: 24 }),
  h6: scaleFont(16, { minSize: 14, maxSize: 22 }),
  body: scaleFont(16, { minSize: 14, maxSize: 18 }),
  bodySmall: scaleFont(14, { minSize: 12, maxSize: 16 }),
  caption: scaleFont(12, { minSize: 11, maxSize: 14 }),
  overline: scaleFont(10, { minSize: 9, maxSize: 12 }),
} as const

/**
 * Verifica se o dispositivo é pequeno (largura < 375px)
 */
export function isSmallDevice(): boolean {
  return getScreenWidth() < 375
}

/**
 * Verifica se o dispositivo é médio (largura entre 375px e 414px)
 */
export function isMediumDevice(): boolean {
  const width = getScreenWidth()
  return width >= 375 && width < 414
}

/**
 * Verifica se o dispositivo é grande (largura >= 414px)
 */
export function isLargeDevice(): boolean {
  return getScreenWidth() >= 414
}

/**
 * Verifica se o dispositivo é um tablet (largura >= 768px)
 */
export function isTablet(): boolean {
  return getScreenWidth() >= 768
}

/**
 * Calcula porcentagem da largura da tela
 *
 * @param percentage Porcentagem desejada (0-100)
 * @returns Valor em pixels
 *
 * @example
 * ```tsx
 * const halfScreen = widthPercentage(50); // 50% da largura
 * <View style={{ width: widthPercentage(80) }} /> // 80% da largura
 * ```
 */
export function widthPercentage(percentage: number): number {
  return (getScreenWidth() * percentage) / 100
}

/**
 * Calcula porcentagem da altura da tela
 *
 * @param percentage Porcentagem desejada (0-100)
 * @returns Valor em pixels
 *
 * @example
 * ```tsx
 * const halfScreen = heightPercentage(50); // 50% da altura
 * <View style={{ height: heightPercentage(30) }} /> // 30% da altura
 * ```
 */
export function heightPercentage(percentage: number): number {
  return (getScreenHeight() * percentage) / 100
}

/**
 * Cria um valor responsivo com diferentes valores para mobile/tablet
 *
 * @param mobileValue Valor para dispositivos mobile (< 768px)
 * @param tabletValue Valor para tablets (>= 768px)
 * @returns Valor apropriado para o dispositivo atual
 *
 * @example
 * ```tsx
 * const columns = responsiveValue(1, 3); // 1 coluna em mobile, 3 em tablet
 * const fontSize = responsiveValue(14, 18);
 * <FlatList numColumns={responsiveValue(2, 4)} />
 * ```
 */
export function responsiveValue<T>(mobileValue: T, tabletValue: T): T {
  return isTablet() ? tabletValue : mobileValue
}

/**
 * Cria um valor responsivo com múltiplos breakpoints
 *
 * @param values Objeto com valores para cada breakpoint (xs, sm, md, lg, xl)
 * @returns Valor apropriado para o dispositivo atual
 *
 * @example
 * ```tsx
 * const padding = responsiveMultiValue({
 *   xs: 8,
 *   sm: 12,
 *   md: 16,
 *   lg: 20,
 *   xl: 24
 * });
 * ```
 */
export function responsiveMultiValue<T>(values: {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}): T | undefined {
  const width = getScreenWidth()

  if (width >= 1024 && values.xl !== undefined) return values.xl
  if (width >= 768 && values.lg !== undefined) return values.lg
  if (width >= 414 && values.md !== undefined) return values.md
  if (width >= 375 && values.sm !== undefined) return values.sm
  if (values.xs !== undefined) return values.xs

  // Fallback: retorna o primeiro valor disponível
  return values.xl || values.lg || values.md || values.sm || values.xs
}

/**
 * Normaliza um valor de padding/margin para ser consistente em diferentes dispositivos
 *
 * @param size Valor base
 * @param type Tipo de normalização ('spacing' | 'font' | 'size')
 * @returns Valor normalizado
 */
export function normalize(
  size: number,
  type: 'spacing' | 'font' | 'size' = 'size',
): number {
  switch (type) {
    case 'spacing':
      return moderateScale(size, 0.5)
    case 'font':
      return scaleFont(size)
    case 'size':
    default:
      return scale(size)
  }
}

/**
 * Informações sobre o dispositivo atual
 */
export function getDeviceInfo() {
  const { width, height } = getDimensions()
  const { widthScale, heightScale, averageScale } = getScaleFactors()

  return {
    width,
    height,
    widthScale,
    heightScale,
    averageScale,
    isSmall: isSmallDevice(),
    isMedium: isMediumDevice(),
    isLarge: isLargeDevice(),
    isTablet: isTablet(),
    aspectRatio: width / height,
    platform: Platform.OS,
  }
}
