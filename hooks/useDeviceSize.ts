
/**
 * useDeviceSize Hook
 *
 * Hook para detectar breakpoints específicos de largura e altura da tela.
 * Útil para ajustar layouts com base em dimensões exatas do dispositivo.
 *
 * @example
 * ```tsx
 * const { width, height, isWidth720, isWidth1080, isHeight1280, isHeight2400 } = useDeviceSize();
 *
 * // Uso condicional
 * if (isWidth720) {
 *   return <CompactLayout />;
 * }
 *
 * // Uso com valores responsivos
 * <View style={{ padding: isWidth720 ? 10 : 20 }} />
 * ```
 */

import { useState, useEffect } from 'react'
import { Dimensions, ScaledSize } from 'react-native'

/**
 * Interface de retorno do hook useDeviceSize
 */
export interface UseDeviceSizeReturn {
  /** Largura atual da tela em DIP (Device Independent Pixels) */
  width: number

  /** Altura atual da tela em DIP (Device Independent Pixels) */
  height: number

  /** Indica se a tela está em orientação portrait (vertical) */
  isPortrait: boolean

  /** Indica se a tela está em orientação landscape (horizontal) */
  isLandscape: boolean

  // ===== BREAKPOINTS DE LARGURA (DIP) =====

  /** Celulares compactos: largura ≤ 360 DIP (iPhone SE, pequenos Android) */
  isSmallPhone: boolean

  /** Celulares normais: largura ≤ 400 DIP (maioria dos celulares) */
  isMediumPhone: boolean

  /** Celulares grandes/phablets: largura ≤ 500 DIP */
  isLargePhone: boolean

  /** Tablets pequenos: largura ≤ 768 DIP (iPad Mini) */
  isTablet: boolean

  /** Tablets grandes: largura ≤ 1024 DIP (iPad Pro) */
  isLargeTablet: boolean

  // ===== BREAKPOINTS DE ALTURA (DIP) =====

  /** Altura pequena: altura ≤ 640 DIP (celulares compactos) */
  isSmallHeight: boolean

  /** Altura média: altura ≤ 800 DIP (celulares normais) */
  isMediumHeight: boolean

  /** Altura grande: altura ≤ 1024 DIP (celulares grandes/tablets pequenos) */
  isLargeHeight: boolean

  /** Altura muito grande: altura ≤ 1366 DIP (tablets) */
  isXLargeHeight: boolean
}

/**
 * Hook personalizado para detectar dimensões específicas da tela
 *
 * Detecta breakpoints DIP (Device Independent Pixels) realistas:
 *
 * **Largura:**
 * - isSmallPhone: ≤ 360 DIP (celulares compactos)
 * - isMediumPhone: ≤ 400 DIP (maioria dos celulares)
 * - isLargePhone: ≤ 500 DIP (phablets)
 * - isTablet: ≤ 768 DIP (tablets pequenos)
 * - isLargeTablet: ≤ 1024 DIP (tablets grandes)
 *
 * **Altura:**
 * - isSmallHeight: ≤ 640 DIP (celulares compactos)
 * - isMediumHeight: ≤ 800 DIP (celulares normais)
 * - isLargeHeight: ≤ 1024 DIP (celulares grandes/tablets pequenos)
 * - isXLargeHeight: ≤ 1366 DIP (tablets)
 *
 * @returns {UseDeviceSizeReturn} Objeto com informações das dimensões da tela
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { width, height, isSmallPhone, isMediumPhone } = useDeviceSize();
 *
 *   return (
 *     <View>
 *       <Text>Largura: {width} DIP</Text>
 *       <Text>Altura: {height} DIP</Text>
 *       {isSmallPhone && <Text>Celular compacto!</Text>}
 *       {isMediumPhone && <Text>Celular normal!</Text>}
 *     </View>
 *   );
 * }
 * ```
 */
export function useDeviceSize(): UseDeviceSizeReturn {
  const [dimensions, setDimensions] = useState<ScaledSize>(() =>
    Dimensions.get('window'),
  )

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window)
    })

    return () => subscription?.remove()
  }, [])

  const { width, height } = dimensions

  // Calcular breakpoints de largura
  const isSmallPhone = width <= 360
  const isMediumPhone = width <= 400
  const isLargePhone = width <= 500
  const isTablet = width <= 768
  const isLargeTablet = width <= 1024

  // Calcular breakpoints de altura
  const isSmallHeight = height <= 640
  const isMediumHeight = height <= 800
  const isLargeHeight = height <= 1024
  const isXLargeHeight = height <= 1366

  // 🔍 DEBUG: Log das dimensões reais
  useEffect(() => {
    console.log('📱 [useDeviceSize] ===== DIMENSÕES DA TELA (DIP) =====')
    console.log('📱 [useDeviceSize] Largura:', width, 'DIP')
    console.log('📱 [useDeviceSize] Altura:', height, 'DIP')
    console.log('📱 [useDeviceSize] ---')
    console.log('📱 [useDeviceSize] isSmallPhone (≤360):', isSmallPhone)
    console.log('📱 [useDeviceSize] isMediumPhone (≤400):', isMediumPhone)
    console.log('📱 [useDeviceSize] isLargePhone (≤500):', isLargePhone)
    console.log('📱 [useDeviceSize] isTablet (≤768):', isTablet)
    console.log('📱 [useDeviceSize] ---')
    console.log('📱 [useDeviceSize] isSmallHeight (≤640):', isSmallHeight)
    console.log('📱 [useDeviceSize] isMediumHeight (≤800):', isMediumHeight)
    console.log('📱 [useDeviceSize] isLargeHeight (≤1024):', isLargeHeight)
    console.log('📱 [useDeviceSize] ==============================')
  }, [width, height, isSmallPhone, isMediumPhone, isLargePhone, isTablet, isSmallHeight, isMediumHeight, isLargeHeight])

  return {
    width,
    height,
    isPortrait: height >= width,
    isLandscape: width > height,
    // Breakpoints de largura
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isTablet,
    isLargeTablet,
    // Breakpoints de altura
    isSmallHeight,
    isMediumHeight,
    isLargeHeight,
    isXLargeHeight,
  }
}

/**
 * Hook para obter um valor específico baseado nos breakpoints de largura
 *
 * @template T Tipo do valor a ser retornado
 * @param defaultValue Valor padrão (para telas maiores que celulares)
 * @param phoneValue Valor para celulares grandes (≤500 DIP)
 * @param mediumPhoneValue Valor para celulares normais (≤400 DIP)
 * @param smallPhoneValue Valor para celulares compactos (≤360 DIP)
 * @returns Valor correspondente ao breakpoint de largura
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Retorna 24 para tablets, 16 para celulares grandes, 12 para médios, 8 para pequenos
 *   const padding = useWidthValue(24, 16, 12, 8);
 *
 *   return <View style={{ padding }}>{content}</View>;
 * }
 * ```
 */
export function useWidthValue<T>(
  defaultValue: T,
  phoneValue?: T,
  mediumPhoneValue?: T,
  smallPhoneValue?: T,
): T {
  const { isSmallPhone, isMediumPhone, isLargePhone } = useDeviceSize()

  if (isSmallPhone && smallPhoneValue !== undefined) {
    return smallPhoneValue
  }

  if (isMediumPhone && mediumPhoneValue !== undefined) {
    return mediumPhoneValue
  }

  if (isLargePhone && phoneValue !== undefined) {
    return phoneValue
  }

  return defaultValue
}

/**
 * Hook para obter um valor específico baseado nos breakpoints de altura
 *
 * @template T Tipo do valor a ser retornado
 * @param defaultValue Valor padrão (para telas maiores)
 * @param largeHeightValue Valor para altura ≤1024 DIP
 * @param mediumHeightValue Valor para altura ≤800 DIP
 * @param smallHeightValue Valor para altura ≤640 DIP
 * @returns Valor correspondente ao breakpoint de altura
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Retorna 200 para tablets, 150 para celulares grandes, 100 para normais, 80 para compactos
 *   const cardHeight = useHeightValue(200, 150, 100, 80);
 *
 *   return <Card style={{ height: cardHeight }}>{content}</Card>;
 * }
 * ```
 */
export function useHeightValue<T>(
  defaultValue: T,
  largeHeightValue?: T,
  mediumHeightValue?: T,
  smallHeightValue?: T,
): T {
  const { isSmallHeight, isMediumHeight, isLargeHeight } = useDeviceSize()

  if (isSmallHeight && smallHeightValue !== undefined) {
    return smallHeightValue
  }

  if (isMediumHeight && mediumHeightValue !== undefined) {
    return mediumHeightValue
  }

  if (isLargeHeight && largeHeightValue !== undefined) {
    return largeHeightValue
  }

  return defaultValue
}

/**
 * Hook para obter um valor baseado em largura E altura simultaneamente
 *
 * @template T Tipo do valor a ser retornado
 * @param values Objeto com valores para diferentes combinações de largura/altura
 * @returns Valor correspondente às dimensões atuais
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const fontSize = useDimensionsValue({
 *     default: 18,
 *     largePhone: 16,
 *     mediumPhone: 14,
 *     smallPhone: 12,
 *     smallHeight: 12,
 *     compactDevice: 10, // smallPhone && smallHeight
 *   });
 *
 *   return <Text style={{ fontSize }}>Texto responsivo</Text>;
 * }
 * ```
 */
export function useDimensionsValue<T>(values: {
  default: T
  largePhone?: T
  mediumPhone?: T
  smallPhone?: T
  largeHeight?: T
  mediumHeight?: T
  smallHeight?: T
  compactDevice?: T // smallPhone && smallHeight
}): T {
  const {
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isSmallHeight,
    isMediumHeight,
    isLargeHeight,
  } = useDeviceSize()

  // Caso especial: dispositivo compacto (largura E altura pequenas)
  if (isSmallPhone && isSmallHeight && values.compactDevice !== undefined) {
    return values.compactDevice
  }

  // Prioridade para casos mais específicos (menor para maior)
  if (isSmallPhone && values.smallPhone !== undefined) {
    return values.smallPhone
  }

  if (isSmallHeight && values.smallHeight !== undefined) {
    return values.smallHeight
  }

  if (isMediumPhone && values.mediumPhone !== undefined) {
    return values.mediumPhone
  }

  if (isMediumHeight && values.mediumHeight !== undefined) {
    return values.mediumHeight
  }

  if (isLargePhone && values.largePhone !== undefined) {
    return values.largePhone
  }

  if (isLargeHeight && values.largeHeight !== undefined) {
    return values.largeHeight
  }

  return values.default
}
