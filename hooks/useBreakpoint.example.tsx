/**
 * Exemplos de uso do hook useBreakpoint e utilitários responsive
 *
 * Este arquivo demonstra diferentes casos de uso para criar layouts responsivos
 * em React Native.
 */

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
} from 'react-native'
import {
  useBreakpoint,
  useBreakpointValue,
  useResponsiveValue,
} from './useBreakpoint'
import {
  scale,
  scaleWidth,
  scaleHeight,
  moderateScale,
  scaleFont,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  widthPercentage,
  heightPercentage,
  responsiveValue,
  responsiveMultiValue,
  normalize,
} from '../utils/responsive'

// ============================================================================
// EXEMPLO 1: Layout básico responsivo
// ============================================================================
export function ResponsiveLayoutExample() {
  const { isSmall, isMobile, isTablet, breakpoint } = useBreakpoint()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Layout Responsivo</Text>
      <Text style={styles.info}>Breakpoint atual: {breakpoint}</Text>
      <Text style={styles.info}>Tipo: {isMobile ? 'Mobile' : 'Tablet'}</Text>

      {/* Renderização condicional baseada no tamanho */}
      {isSmall ? (
        <Text>Você está em um dispositivo pequeno</Text>
      ) : (
        <Text>Você está em um dispositivo maior</Text>
      )}

      {/* Layout diferente para mobile vs tablet */}
      {isMobile ? <MobileLayout /> : <TabletLayout />}
    </View>
  )
}

function MobileLayout() {
  return (
    <View>
      <Text>Layout compacto para mobile</Text>
      {/* Conteúdo em coluna única */}
    </View>
  )
}

function TabletLayout() {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View style={{ flex: 1 }}>
        <Text>Sidebar</Text>
      </View>
      <View style={{ flex: 2 }}>
        <Text>Conteúdo principal em 2 colunas</Text>
      </View>
    </View>
  )
}

// ============================================================================
// EXEMPLO 2: Grid responsivo com número de colunas variável
// ============================================================================
export function ResponsiveGridExample() {
  // Número de colunas baseado no breakpoint
  const numColumns = useBreakpointValue({
    xs: 2, // 2 colunas em celulares pequenos
    sm: 2, // 2 colunas em celulares médios
    md: 3, // 3 colunas em celulares grandes
    lg: 4, // 4 colunas em tablets pequenos
    xl: 6, // 6 colunas em tablets grandes
  })

  const data = Array.from({ length: 20 }, (_, i) => ({ id: i }))

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      key={numColumns} // Force re-render quando numColumns muda
      renderItem={({ item }) => (
        <View
          style={{
            flex: 1 / (numColumns || 2),
            aspectRatio: 1,
            padding: SPACING.half,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: '#007AFF',
              borderRadius: BORDER_RADIUS.base,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white' }}>Item {item.id}</Text>
          </View>
        </View>
      )}
    />
  )
}

// ============================================================================
// EXEMPLO 3: Tipografia responsiva
// ============================================================================
export function ResponsiveTypographyExample() {
  return (
    <View style={{ padding: SPACING.base }}>
      {/* Usando sistema de tipografia predefinido */}
      <Text style={{ fontSize: TYPOGRAPHY.h1, fontWeight: 'bold' }}>
        Título H1
      </Text>
      <Text style={{ fontSize: TYPOGRAPHY.h2, fontWeight: 'bold' }}>
        Título H2
      </Text>
      <Text style={{ fontSize: TYPOGRAPHY.body, marginTop: SPACING.base }}>
        Este é um texto de corpo que escala automaticamente baseado no tamanho
        da tela. Em dispositivos maiores, a fonte será maior, mas sem exageros.
      </Text>
      <Text style={{ fontSize: TYPOGRAPHY.caption, marginTop: SPACING.half }}>
        Texto de legenda menor
      </Text>

      {/* Usando scaleFont com limites personalizados */}
      <Text
        style={{
          fontSize: scaleFont(20, { minSize: 18, maxSize: 28 }),
          marginTop: SPACING.double,
        }}
      >
        Texto com limites customizados
      </Text>
    </View>
  )
}

// ============================================================================
// EXEMPLO 4: Espaçamento responsivo
// ============================================================================
export function ResponsiveSpacingExample() {
  // Espaçamento que varia por breakpoint
  const padding = useBreakpointValue({
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  })

  const gap = useResponsiveValue(8, 16) // 8 em mobile, 16 em tablet

  return (
    <View style={{ padding }}>
      <View style={{ gap }}>
        <View style={{ backgroundColor: '#e0e0e0', padding: SPACING.base }}>
          <Text>Card 1</Text>
        </View>
        <View style={{ backgroundColor: '#e0e0e0', padding: SPACING.base }}>
          <Text>Card 2</Text>
        </View>
        <View style={{ backgroundColor: '#e0e0e0', padding: SPACING.base }}>
          <Text>Card 3</Text>
        </View>
      </View>

      {/* Usando sistema de espaçamento */}
      <View
        style={{
          marginTop: SPACING.double,
          padding: SPACING.base,
          gap: SPACING.half,
        }}
      >
        <Text>Usando SPACING constantes</Text>
      </View>
    </View>
  )
}

// ============================================================================
// EXEMPLO 5: Card responsivo com dimensões adaptáveis
// ============================================================================
export function ResponsiveCardExample() {
  const { isMobile } = useBreakpoint()

  // Largura do card baseada em porcentagem
  const cardWidth = isMobile ? widthPercentage(90) : widthPercentage(45)

  return (
    <View
      style={{
        width: cardWidth,
        height: scaleHeight(200),
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
        Card Responsivo
      </Text>
      <Text
        style={{
          fontSize: TYPOGRAPHY.body,
          marginTop: SPACING.base,
          color: '#666',
        }}
      >
        Este card adapta sua largura e espaçamento baseado no tamanho da tela.
      </Text>
    </View>
  )
}

// ============================================================================
// EXEMPLO 6: Imagem responsiva
// ============================================================================
export function ResponsiveImageExample() {
  const { isMobile } = useBreakpoint()

  // Tamanho da imagem baseado no dispositivo
  const imageSize = responsiveMultiValue({
    xs: 80,
    sm: 100,
    md: 120,
    lg: 150,
    xl: 200,
  })

  return (
    <View style={{ alignItems: 'center', padding: SPACING.base }}>
      <Image
        source={{ uri: 'https://via.placeholder.com/200' }}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: BORDER_RADIUS.large,
        }}
      />
      <Text
        style={{
          fontSize: TYPOGRAPHY.body,
          marginTop: SPACING.base,
          textAlign: 'center',
        }}
      >
        Imagem {imageSize}x{imageSize}
      </Text>
    </View>
  )
}

// ============================================================================
// EXEMPLO 7: Botão responsivo
// ============================================================================
export function ResponsiveButtonExample() {
  const { isSmall } = useBreakpoint()

  // Altura do botão
  const buttonHeight = responsiveMultiValue({
    xs: 40,
    sm: 44,
    md: 48,
    lg: 52,
    xl: 56,
  })

  // Padding horizontal
  const buttonPaddingX = useResponsiveValue(16, 24)

  return (
    <View
      style={{
        height: buttonHeight,
        paddingHorizontal: buttonPaddingX,
        backgroundColor: '#007AFF',
        borderRadius: BORDER_RADIUS.medium,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: TYPOGRAPHY.body,
          fontWeight: '600',
        }}
      >
        {isSmall ? 'OK' : 'Continuar'}
      </Text>
    </View>
  )
}

// ============================================================================
// EXEMPLO 8: Form responsivo
// ============================================================================
export function ResponsiveFormExample() {
  const { isMobile, isTablet } = useBreakpoint()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        padding: isMobile ? SPACING.base : SPACING.double,
      }}
    >
      <View
        style={{
          maxWidth: isTablet ? 600 : '100%',
          alignSelf: 'center',
          width: '100%',
        }}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.h2,
            fontWeight: 'bold',
            marginBottom: SPACING.base,
          }}
        >
          Formulário Responsivo
        </Text>

        {/* Campos em linha no tablet, empilhados no mobile */}
        <View
          style={{
            flexDirection: isTablet ? 'row' : 'column',
            gap: SPACING.base,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.bodySmall,
                marginBottom: SPACING.quarter,
              }}
            >
              Nome
            </Text>
            <View
              style={{
                height: responsiveValue(44, 48),
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: BORDER_RADIUS.base,
                paddingHorizontal: SPACING.base,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.bodySmall,
                marginBottom: SPACING.quarter,
              }}
            >
              Email
            </Text>
            <View
              style={{
                height: responsiveValue(44, 48),
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: BORDER_RADIUS.base,
                paddingHorizontal: SPACING.base,
              }}
            />
          </View>
        </View>

        {/* Botão de submit */}
        <View
          style={{
            marginTop: SPACING.double,
            height: responsiveValue(48, 56),
            backgroundColor: '#007AFF',
            borderRadius: BORDER_RADIUS.medium,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: TYPOGRAPHY.body,
              fontWeight: '600',
            }}
          >
            Enviar
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

// ============================================================================
// EXEMPLO 9: Navegação responsiva
// ============================================================================
export function ResponsiveNavigationExample() {
  const { isMobile, isTablet } = useBreakpoint()

  return (
    <View style={{ flex: 1 }}>
      {isMobile ? (
        // Navegação em tabs na parte inferior (mobile)
        <View style={{ flex: 1 }}>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>Conteúdo</Text>
          </View>
          <View
            style={{
              height: normalize(60, 'spacing'),
              flexDirection: 'row',
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: '#e0e0e0',
            }}
          >
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Home</Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Buscar</Text>
            </View>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Perfil</Text>
            </View>
          </View>
        </View>
      ) : (
        // Navegação em sidebar lateral (tablet)
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
            <Text
              style={{ fontSize: TYPOGRAPHY.h3, marginBottom: SPACING.base }}
            >
              Menu
            </Text>
            <Text
              style={{ fontSize: TYPOGRAPHY.body, marginBottom: SPACING.base }}
            >
              Home
            </Text>
            <Text
              style={{ fontSize: TYPOGRAPHY.body, marginBottom: SPACING.base }}
            >
              Buscar
            </Text>
            <Text style={{ fontSize: TYPOGRAPHY.body }}>Perfil</Text>
          </View>
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text>Conteúdo</Text>
          </View>
        </View>
      )}
    </View>
  )
}

// ============================================================================
// EXEMPLO 10: Debug - Informações do dispositivo
// ============================================================================
export function ResponsiveDebugExample() {
  const {
    breakpoint,
    width,
    height,
    isPortrait,
    isLandscape,
    isMobile,
    isTablet,
  } = useBreakpoint()

  return (
    <ScrollView style={{ padding: SPACING.base }}>
      <Text
        style={{
          fontSize: TYPOGRAPHY.h3,
          fontWeight: 'bold',
          marginBottom: SPACING.base,
        }}
      >
        Informações do Dispositivo
      </Text>

      <View style={{ gap: SPACING.half }}>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Breakpoint:</Text> {breakpoint}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Dimensões:</Text>{' '}
          {Math.round(width)}x{Math.round(height)}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Orientação:</Text>{' '}
          {isPortrait ? 'Portrait' : 'Landscape'}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Tipo:</Text>{' '}
          {isMobile ? 'Mobile' : 'Tablet'}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Scale factor:</Text>{' '}
          {scale(1).toFixed(2)}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Width scale:</Text>{' '}
          {scaleWidth(1).toFixed(2)}
        </Text>
        <Text style={{ fontSize: TYPOGRAPHY.body }}>
          <Text style={{ fontWeight: 'bold' }}>Height scale:</Text>{' '}
          {scaleHeight(1).toFixed(2)}
        </Text>
      </View>
    </ScrollView>
  )
}

// ============================================================================
// Estilos
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.base,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: TYPOGRAPHY.h2,
    fontWeight: 'bold',
    marginBottom: SPACING.base,
  },
  info: {
    fontSize: TYPOGRAPHY.body,
    color: '#666',
    marginBottom: SPACING.quarter,
  },
})
