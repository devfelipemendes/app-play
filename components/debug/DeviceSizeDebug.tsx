import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { useDeviceSize } from '@/hooks/useDeviceSize'

/**
 * Componente de debug para visualizar as dimensões da tela
 * Use temporariamente em qualquer tela para testar
 */
export function DeviceSizeDebug() {
  const {
    width,
    height,
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isTablet,
    isLargeTablet,
    isSmallHeight,
    isMediumHeight,
    isLargeHeight,
    isXLargeHeight,
    isPortrait,
    isLandscape,
  } = useDeviceSize()

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🔍 Debug: Dimensões da Tela</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Dimensões Atuais</Text>
          <Text style={styles.value}>Largura: {width} DIP</Text>
          <Text style={styles.value}>Altura: {height} DIP</Text>
          <Text style={styles.value}>
            Orientação: {isPortrait ? 'Portrait 📱' : 'Landscape 📱'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Breakpoints de Largura</Text>
          <View style={styles.row}>
            <Text style={styles.label}>isSmallPhone (≤360):</Text>
            <Text style={[styles.badge, isSmallPhone ? styles.true : styles.false]}>
              {isSmallPhone ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isMediumPhone (≤400):</Text>
            <Text style={[styles.badge, isMediumPhone ? styles.true : styles.false]}>
              {isMediumPhone ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isLargePhone (≤500):</Text>
            <Text style={[styles.badge, isLargePhone ? styles.true : styles.false]}>
              {isLargePhone ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isTablet (≤768):</Text>
            <Text style={[styles.badge, isTablet ? styles.true : styles.false]}>
              {isTablet ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isLargeTablet (≤1024):</Text>
            <Text style={[styles.badge, isLargeTablet ? styles.true : styles.false]}>
              {isLargeTablet ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📏 Breakpoints de Altura</Text>
          <View style={styles.row}>
            <Text style={styles.label}>isSmallHeight (≤640):</Text>
            <Text style={[styles.badge, isSmallHeight ? styles.true : styles.false]}>
              {isSmallHeight ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isMediumHeight (≤800):</Text>
            <Text style={[styles.badge, isMediumHeight ? styles.true : styles.false]}>
              {isMediumHeight ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isLargeHeight (≤1024):</Text>
            <Text style={[styles.badge, isLargeHeight ? styles.true : styles.false]}>
              {isLargeHeight ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>isXLargeHeight (≤1366):</Text>
            <Text style={[styles.badge, isXLargeHeight ? styles.true : styles.false]}>
              {isXLargeHeight ? '✅ TRUE' : '❌ FALSE'}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>ℹ️ Sobre DIP (Device Independent Pixels):</Text>
          <Text style={styles.infoText}>
            • React Native usa DIP, não pixels físicos
          </Text>
          <Text style={styles.infoText}>
            • DIP = Pixels Físicos ÷ PixelRatio (densidade da tela)
          </Text>
          <Text style={styles.infoText}>
            • Um celular Full HD (1920x1080) com scale 3x = 640x360 DIP
          </Text>
          <Text style={styles.infoText}>
            • Breakpoints em DIP são consistentes entre dispositivos
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: '600',
    fontSize: 12,
  },
  true: {
    backgroundColor: '#10B981',
    color: 'white',
  },
  false: {
    backgroundColor: '#EF4444',
    color: 'white',
  },
  info: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 12,
    color: '#424242',
    marginBottom: 4,
  },
})
