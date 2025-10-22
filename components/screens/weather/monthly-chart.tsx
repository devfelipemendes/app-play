import React, { useEffect, useMemo } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { Globe, Signal } from 'lucide-react-native'
import { ScrollView, Dimensions } from 'react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useGetConsumoMutation } from '@/src/api/endpoints/consumoApi'
import {
  getCurrentMonthYear,
  formatToMonthlyChart,
  normalizeMsisdn,
} from '@/src/utils/consumoFormatter'
import { BarChart } from 'react-native-gifted-charts'

interface MonthlyChartProps {
  msisdn: string
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ msisdn }) => {
  const { colors } = useCompanyThemeSimple()
  const [getConsumo, { data: consumoData, isLoading, error }] =
    useGetConsumoMutation()

  console.log('📊 MonthlyChart montado com msisdn:', msisdn)

  // Buscar dados de consumo ao montar componente ou quando msisdn mudar
  useEffect(() => {
    if (msisdn) {
      const { month, year } = getCurrentMonthYear()
      const normalizedMsisdn = normalizeMsisdn(msisdn)

      console.log('📊 Buscando consumo mensal para chart:', {
        msisdnOriginal: msisdn,
        msisdnNormalizado: normalizedMsisdn,
        month,
        year,
      })

      getConsumo({
        msisdn: normalizedMsisdn,
        tipo: 'dados',
        mes: month,
        ano: year,
      })
    }
  }, [msisdn, getConsumo])

  // Processar dados para o gráfico
  const monthlyChartData = useMemo(() => {
    if (
      !consumoData ||
      consumoData.length === 0 ||
      !consumoData[0]?.resultados
    ) {
      console.log('📊 MonthlyChart - Sem dados para processar')
      return []
    }

    const resultados = consumoData[0].resultados
    const formattedData = formatToMonthlyChart(resultados)

    console.log('📊 MonthlyChart - Dados formatados:', {
      total: formattedData.length,
      primeiro: formattedData[0],
      ultimo: formattedData[formattedData.length - 1],
    })

    // Formatar para o BarChart (usando MB ao invés de GB)
    return formattedData.map((item) => ({
      value: item.downloadMB,
      label: String(item.day),
      frontColor: colors.primary,
    }))
  }, [consumoData, colors])

  // Estado de carregamento
  if (isLoading) {
    return (
      <VStack
        style={{
          paddingVertical: 24,
          paddingHorizontal: 12,
          borderRadius: 24,
          backgroundColor: colors.background,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.24,
          shadowRadius: 3,
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.secondary, fontSize: 14 }}>
          Carregando consumo mensal...
        </Text>
      </VStack>
    )
  }

  // Estado de erro
  if (error) {
    return (
      <VStack
        style={{
          paddingVertical: 24,
          paddingHorizontal: 12,
          borderRadius: 24,
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.24,
          shadowRadius: 3,
          elevation: 2,
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Icon as={Globe} size="md" style={{ color: colors.secondary }} />
        <Text
          style={{ color: colors.secondary, fontSize: 14, textAlign: 'center' }}
        >
          Não foi possível carregar o consumo mensal
        </Text>
      </VStack>
    )
  }

  // Sem dados disponíveis
  if (monthlyChartData.length === 0) {
    return (
      <VStack
        style={{
          paddingVertical: 24,
          paddingHorizontal: 12,
          borderRadius: 24,
          backgroundColor: colors.background,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.24,
          shadowRadius: 3,
          elevation: 2,
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Icon as={Signal} size="md" style={{ color: colors.secondary }} />
        <Text
          style={{ color: colors.secondary, fontSize: 14, textAlign: 'center' }}
        >
          Sem dados de consumo para este mês
        </Text>
      </VStack>
    )
  }

  const screenWidth = Dimensions.get('window').width

  console.log(
    '📊 MonthlyChart - Renderizando gráfico com',
    monthlyChartData.length,
    'dias',
  )

  // Renderizar gráfico
  return (
    <VStack
      style={{
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 24,
        backgroundColor: colors.background,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.24,
        shadowRadius: 3,
        gap: 12,
      }}
    >
      {/* Header */}
      <HStack style={{ gap: 8, alignItems: 'center' }}>
        <Box
          style={{
            width: 28,
            height: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 14,
          }}
        >
          <Icon as={Signal} size="sm" style={{ color: 'white' }} />
        </Box>
        <Text
          style={{
            fontFamily: 'DM Sans',
            fontWeight: '400',
            color: colors.secondary,
          }}
        >
          Consumo Mensal (MB)
        </Text>
      </HStack>

      {/* Gráfico */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={monthlyChartData}
          width={Math.max(screenWidth - 80, monthlyChartData.length * 25)}
          height={220}
          barWidth={18}
          spacing={10}
          roundedTop
          hideRules={false}
          xAxisThickness={0}
          yAxisThickness={0}
          yAxisTextStyle={{ color: colors.secondary, fontSize: 10 }}
          noOfSections={4}
          isAnimated
        />
      </ScrollView>

      {/* Legenda */}
      <HStack style={{ gap: 8, alignItems: 'center', paddingHorizontal: 8 }}>
        <Box
          style={{
            width: 12,
            height: 12,
            backgroundColor: colors.primary,
            borderRadius: 3,
          }}
        />
        <Text style={{ fontSize: 12, color: colors.text }}>Download (MB)</Text>
      </HStack>
    </VStack>
  )
}

export default MonthlyChart
