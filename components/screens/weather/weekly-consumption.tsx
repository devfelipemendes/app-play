import React, { useEffect } from 'react'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { ScrollView } from '@/components/ui/scroll-view'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useGetConsumoMutation } from '@/src/api/endpoints/consumoApi'
import {
  getCurrentMonthYear,
  formatToWeeklyChart,
  normalizeMsisdn,
  type WeeklyChartData,
} from '@/src/utils/consumoFormatter'
import ForeCastCard from '@/components/screens/weather/forecast-card'
import { Globe, Radio } from 'lucide-react-native'

interface WeeklyConsumptionProps {
  msisdn: string
}

const WeeklyConsumption: React.FC<WeeklyConsumptionProps> = ({ msisdn }) => {
  const { colors } = useCompanyThemeSimple()
  const [getConsumo, { data, isLoading, error }] = useGetConsumoMutation()

  console.log('📊 WeeklyConsumption montado com msisdn:', msisdn)
  console.log('📊 WeeklyConsumption - data:', data)
  console.log('📊 WeeklyConsumption - isLoading:', isLoading)
  console.log('📊 WeeklyConsumption - error:', error)

  // Buscar dados de consumo ao montar componente ou quando msisdn mudar
  useEffect(() => {
    if (msisdn) {
      const { month, year } = getCurrentMonthYear()
      const normalizedMsisdn = normalizeMsisdn(msisdn)

      console.log('📊 Buscando consumo semanal:', {
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

  // Processar dados da API
  const weeklyData: WeeklyChartData[] = React.useMemo(() => {
    if (!data || data.length === 0 || !data[0]?.resultados) {
      console.log('📊 WeeklyConsumption - Sem dados para processar')
      return []
    }

    const resultados = data[0].resultados
    console.log(
      '📊 WeeklyConsumption - Resultados recebidos:',
      resultados.length,
      'dias',
    )

    const formatted = formatToWeeklyChart(resultados)
    console.log(
      '📊 WeeklyConsumption - Dados formatados (últimos 7 dias):',
      formatted.length,
      'dias',
    )
    console.log('📊 WeeklyConsumption - Amostra:', formatted.slice(0, 3))

    return formatted
  }, [data])

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
          Carregando consumo semanal...
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
          Não foi possível carregar o consumo semanal
        </Text>
      </VStack>
    )
  }

  // Sem dados disponíveis
  if (weeklyData.length === 0) {
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
          Sem dados de consumo nos últimos 7 dias
        </Text>
      </VStack>
    )
  }

  // Renderizar dados de consumo
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
          <Icon as={Radio} size="sm" style={{ color: colors.textButton }} />
        </Box>
        <Text
          style={{
            fontFamily: 'DM Sans',
            fontWeight: '400',
            color: colors.secondary,
          }}
        >
          Consumo Semanal (Últimos 7 dias)
        </Text>
      </HStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 32, paddingHorizontal: 12 }}
      >
        {weeklyData.map((item, index) => {
          // Mostrar em MB se for menor que 1 GB, senão em GB
          const displayValue =
            item.downloadGB < 1
              ? `${item.downloadMB.toFixed(0)} MB`
              : `${item.downloadGB.toFixed(2)} GB`

          return (
            <ForeCastCard
              key={`${item.date}-${index}`}
              time={item.day}
              imgUrl={require('@/assets/images/connectMobile.png')}
              temperature={displayValue}
            />
          )
        })}
      </ScrollView>
    </VStack>
  )
}

export default WeeklyConsumption
