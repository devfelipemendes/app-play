import React, { useContext, useEffect, useMemo } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Icon } from '@/components/ui/icon'
import { Globe, Signal } from 'lucide-react-native'
import { ScrollView } from 'react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppSelector } from '@/src/store/hooks'
import { selectDet2Data, selectDet2Error } from '@/src/store/slices/det2Slice'
import { useGetConsumoMutation } from '@/src/api/endpoints/consumoApi'
import {
  getCurrentMonthYear,
  formatToMonthlyChart,
  normalizeMsisdn,
} from '@/src/utils/consumoFormatter'
import { BarChart } from 'react-native-gifted-charts'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import { useApiRetry } from '@/hooks/useApiRetry'

const Monthly = () => {
  const { colors } = useCompanyThemeSimple()
  const { registerRefreshCallback }: any = useContext(WeatherTabContext)
  const { retryApiCall } = useApiRetry()

  // Pegar dados da linha selecionada do Redux
  const det2Data = useAppSelector(selectDet2Data)
  const det2Error = useAppSelector(selectDet2Error)

  console.log('📊 Monthly montado - det2Data:', det2Data)
  console.log('📊 Monthly montado - det2Error:', det2Error)

  // Hook da API
  const [getConsumo, { data: consumoData, isLoading, error, refetch }] =
    useGetConsumoMutation()

  // Verificar se tem MSISDN ativo
  const isNoMsisdn = det2Error === 'NO_MSISDN'
  const msisdn = det2Data?.msisdn

  console.log('📊 Monthly - msisdn extraído:', msisdn)

  // Buscar dados de consumo quando componente montar ou msisdn mudar
  useEffect(() => {
    if (msisdn && !isNoMsisdn) {
      const fetchConsumo = async () => {
        const { month, year } = getCurrentMonthYear()
        const normalizedMsisdn = normalizeMsisdn(msisdn)

        console.log('📊 Buscando consumo mensal:', {
          msisdnOriginal: msisdn,
          msisdnNormalizado: normalizedMsisdn,
          month,
          year,
        })

        try {
          await retryApiCall(
            () =>
              getConsumo({
                msisdn: normalizedMsisdn,
                tipo: 'dados',
                mes: month,
                ano: year,
              }).unwrap(),
            {
              onAttempt: (attempt, max) => {
                console.log(
                  `🔄 Tentativa ${attempt}/${max} de buscar consumo mensal...`,
                )
              },
              onError: (attempt, err) => {
                console.log(`❌ Tentativa ${attempt} falhou:`, err)
              },
            },
          )
        } catch (err) {
          console.error('❌ Erro ao buscar consumo mensal:', err)
        }
      }

      fetchConsumo()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msisdn, isNoMsisdn])

  // Registrar função de refresh no contexto (tab 2 = monthly)
  useEffect(() => {
    if (registerRefreshCallback) {
      const refreshConsumo = async () => {
        console.log('🔄 Atualizando consumo mensal...')
        if (msisdn && !isNoMsisdn) {
          await refetch()
        }
      }
      registerRefreshCallback(2, refreshConsumo)
    }
  }, [registerRefreshCallback, msisdn, isNoMsisdn, refetch])

  // Processar dados para o gráfico
  const monthlyChartData = useMemo(() => {
    if (
      !consumoData ||
      consumoData.length === 0 ||
      !consumoData[0]?.resultados
    ) {
      console.log('📊 Sem dados de consumo mensal:', { consumoData })
      return []
    }

    const resultados = consumoData[0].resultados
    const formattedData = formatToMonthlyChart(resultados)

    console.log('📊 Dados formatados para gráfico:', {
      total: formattedData.length,
      primeiro: formattedData[0],
      ultimo: formattedData[formattedData.length - 1],
    })

    // Formatar para o BarChart (usando MB ao invés de GB)
    const chartData = formattedData.map((item) => ({
      value: item.downloadMB,
      label: String(item.day),
      frontColor: colors.primary,
    }))

    console.log('📊 Chart data pronto:', {
      total: chartData.length,
      amostra: chartData.slice(0, 3),
    })

    return chartData
  }, [consumoData, colors])

  // Debug: Log estado atual
  console.log('📊 Monthly - Estado:', {
    isNoMsisdn,
    isLoading,
    hasError: !!error,
    hasData: monthlyChartData.length > 0,
    msisdn,
  })

  // Estado: Sem MSISDN ativo
  if (isNoMsisdn) {
    console.log('📊 Exibindo: Sem MSISDN')
    return (
      <VStack
        className="px-5 pb-5 justify-center items-center"
        style={{ paddingTop: 40 }}
      >
        <Box
          style={{
            padding: 32,
            borderRadius: 16,
            backgroundColor: colors.background,
            alignItems: 'center',
            gap: 16,
            elevation: 2,
          }}
        >
          <Icon as={Globe} size="xl" style={{ color: colors.primary }} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
            }}
          >
            ICCID sem linha ativa
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Ative uma linha para visualizar o consumo mensal
          </Text>
        </Box>
      </VStack>
    )
  }

  // Estado: Carregando
  if (isLoading) {
    console.log('📊 Exibindo: Carregando')
    return (
      <VStack
        className="px-5 pb-5 justify-center items-center"
        style={{ paddingTop: 40 }}
      >
        <Text style={{ fontSize: 16, color: colors.secondary }}>
          Carregando consumo mensal...
        </Text>
      </VStack>
    )
  }

  // Estado: Erro ao carregar
  if (error) {
    console.log('📊 Exibindo: Erro', error)
    return (
      <VStack
        className="px-5 pb-5 justify-center items-center"
        style={{ paddingTop: 40 }}
      >
        <Box
          style={{
            padding: 24,
            borderRadius: 16,
            backgroundColor: colors.background,
            alignItems: 'center',
            gap: 12,
            elevation: 2,
          }}
        >
          <Icon as={Globe} size="md" style={{ color: colors.secondary }} />
          <Text
            style={{ fontSize: 16, color: colors.error, textAlign: 'center' }}
          >
            Erro ao carregar consumo mensal
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.secondary,
              textAlign: 'center',
            }}
          >
            Tente novamente mais tarde
          </Text>
        </Box>
      </VStack>
    )
  }

  // Estado: Sem dados
  if (monthlyChartData.length === 0) {
    console.log('📊 Exibindo: Sem dados')
    return (
      <VStack
        className="px-5 pb-5 justify-center items-center"
        style={{ paddingTop: 40 }}
      >
        <Box
          style={{
            padding: 32,
            borderRadius: 16,
            backgroundColor: colors.background,
            alignItems: 'center',
            gap: 16,
            elevation: 2,
          }}
        >
          <Icon as={Signal} size="xl" style={{ color: colors.primary }} />
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
            }}
          >
            Sem dados de consumo
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Nenhum consumo registrado para este mês
          </Text>
        </Box>
      </VStack>
    )
  }

  console.log('📊 Exibindo: Gráfico com', monthlyChartData.length, 'dias')

  // Estado: Com dados - Renderizar gráfico
  return (
    <ScrollView className="px-5 pb-5" showsVerticalScrollIndicator={false}>
      <VStack space="md" style={{ paddingTop: 16 }}>
        {/* Header */}
        <HStack style={{ gap: 8, alignItems: 'center', paddingHorizontal: 8 }}>
          <Box
            style={{
              width: 32,
              height: 32,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 16,
            }}
          >
            <Icon as={Signal} size="sm" style={{ color: 'white' }} />
          </Box>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: colors.text,
            }}
          >
            Consumo Mensal (MB)
          </Text>
        </HStack>

        {/* Gráfico */}
        <Box
          style={{
            backgroundColor: colors.background,
            borderRadius: 16,
            padding: 16,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.24,
            shadowRadius: 3,
          }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={monthlyChartData}
              width={31 * 50}
              height={250}
              barWidth={22}
              spacing={8}
              roundedTop
              hideRules={false}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: colors.secondary }}
              noOfSections={4}
              isAnimated
            />
          </ScrollView>
        </Box>

        {/* Legenda */}
        <Box
          style={{
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 12,
            elevation: 1,
          }}
        >
          <HStack style={{ gap: 8, alignItems: 'center' }}>
            <Box
              style={{
                width: 16,
                height: 16,
                backgroundColor: colors.primary,
                borderRadius: 4,
              }}
            />
            <Text style={{ fontSize: 14, color: colors.text }}>
              Download (MB)
            </Text>
          </HStack>
        </Box>
      </VStack>
    </ScrollView>
  )
}

export default Monthly
