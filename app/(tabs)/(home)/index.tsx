import React, { useEffect, useState, useRef } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Globe } from 'lucide-react-native'
import { ClockIcon, Icon } from '@/components/ui/icon'
import { HStack } from '@/components/ui/hstack'
import HourlyCard from '@/components/screens/weather/hourly-card'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import ForeCastCard from '@/components/screens/weather/forecast-card'

import Chart from '@/components/screens/weather/chart'
import { ScrollView } from '@/components/ui/scroll-view'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import {
  WindAndPrecipitationData,
  PressureAndUVIndexData,
  HourlyForecastData,
} from '@/data/screens/weather/hourly-tab'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import {
  useGetDet2Mutation,
  type Det2Request,
} from '@/src/api/endpoints/getDetails'

import { useAuth } from '@/hooks/useAuth'
// Importar as novas actions do det2 slice
import {
  setLoading,
  setData,
  setError,
  loadFromCache,
  setSelectedLineIccid,
  selectDet2Data,
  selectDet2Loading,
  selectDet2Error,
  selectHasCacheForIccid,
} from '@/src/store/slices/det2Slice'

import {
  useGetUserLinesMutation,
  type GetUserLinesResponse,
  type UserLine,
} from '@/src/api/endpoints/verLinhas'
import LineSelector from '@/components/layout/lineSelector'
import { useDadosFormatter } from '@/src/utils/dadosFormatter'

const Home = () => {
  // Ref para o Chart
  const chartRef = useRef(null)
  const AnimatedVStack = Animated.createAnimatedComponent(VStack)

  // Estados globais do Redux
  const det2Data = useAppSelector(selectDet2Data)
  const det2Loading = useAppSelector(selectDet2Loading)
  const det2Error = useAppSelector(selectDet2Error)

  const { colors } = useCompanyThemeSimple()
  const { user } = useAuth()
  const dispatch = useAppDispatch()

  // Hooks das APIs
  const [getDet2] = useGetDet2Mutation()
  const [getUserLines] = useGetUserLinesMutation()

  // Estados locais
  const [userLines, setUserLines] = useState<UserLine[]>([])
  const [selectedLine, setSelectedLine] = useState<UserLine | null>(null)
  const [loadingLines, setLoadingLines] = useState(false)
  const [loadingLineChange, setLoadingLineChange] = useState(false)

  // Hook do formatter
  const { formatConsumptionData } = useDadosFormatter()

  // Dados formatados com useMemo para performance
  const consumptionData = React.useMemo(() => {
    return formatConsumptionData(det2Data)
  }, [det2Data, formatConsumptionData])

  // Função para buscar dados de uma linha
  const fetchLineData = async (line: UserLine) => {
    try {
      dispatch(setLoading(true))
      dispatch(setSelectedLineIccid(line.iccid))

      // Verificar se existe cache para esta linha
      const hasCache = selectHasCacheForIccid(line.iccid)({
        det2: {
          cache: {},
          data: null,
          loading: false,
          error: null,
          lastUpdated: null,
          selectedLineIccid: null,
        },
      })

      if (hasCache) {
        dispatch(loadFromCache(line.iccid))
        return
      }

      console.log('🎯 Buscando dados para linha:', {
        msisdn: line.msisdn,
        iccid: line.iccid,
        plano: line.plandescription,
      })

      const det2Request: Det2Request = {
        atualizadet: 'SIM',
        iccid: line.iccid,
        parceiro: user?.parceiro,
        token: user?.token,
        userInfo: JSON.stringify({
          cpf: user?.cpf,
          name: user?.name,
          parceiro: user?.parceiro,
        }),
      }

      console.log('📤 Request getDet2:', det2Request)

      const det2Result = await getDet2(det2Request).unwrap()

      console.log('✅ Dados recebidos:', det2Result)

      // Salvar no estado global
      dispatch(setData(det2Result))
    } catch (err: any) {
      console.log('❌ Erro ao buscar dados:', err)
      dispatch(setError(err?.message || 'Erro ao carregar dados da linha'))
    }
  }

  // Função para trocar de linha
  const handleLineChange = async (newLine: UserLine) => {
    if (newLine.id === selectedLine?.id) return

    try {
      setLoadingLineChange(true)
      setSelectedLine(newLine)

      await fetchLineData(newLine)
    } catch (err: any) {
      console.log('❌ Erro ao trocar linha:', err)
    } finally {
      setLoadingLineChange(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      console.log('🔍 Home - useFocusEffect executando...')

      if (!user?.cpf || !user?.token) {
        console.log('❌ Usuário sem dados necessários:', {
          cpf: user?.cpf,
          token: !!user?.token,
        })
        dispatch(setError('Dados do usuário incompletos'))
        return
      }

      const fetchUserData = async () => {
        try {
          setLoadingLines(true)
          dispatch(setError(null))

          console.log('📞 Buscando linhas do usuário...')

          // 1. Buscar linhas do usuário
          const linesRequest = {
            parceiro: user.parceiro || 'PLAY MÓVEL',
            token: user.token,
            cpf: user.cpf,
            franquiado: 0,
            isApp: true,
            usuario_atual: user.cpf,
          }

          console.log('📤 Request getUserLines:', linesRequest)

          const linesResult = await getUserLines(linesRequest).unwrap()

          console.log('✅ Linhas encontradas:', linesResult.length, 'linhas')
          console.log('📋 Primeira linha:', linesResult[0])

          setUserLines(linesResult)

          if (linesResult && linesResult.length > 0) {
            // 2. Filtrar linhas ativas (msisdnstatus = 0)
            const activeLines = linesResult.filter(
              (line: any) => line.msisdnstatus === 0,
            )
            console.log('🟢 Linhas ativas:', activeLines.length)

            if (activeLines.length > 0) {
              const primaryLine = activeLines[0]
              setSelectedLine(primaryLine)

              // 3. Buscar dados da primeira linha ativa
              await fetchLineData(primaryLine)
            } else {
              console.log('⚠️ Nenhuma linha ativa encontrada')
              dispatch(setError('Você não possui linhas ativas no momento'))
            }
          } else {
            console.log('⚠️ Nenhuma linha encontrada para este usuário')
            dispatch(setError('Nenhuma linha encontrada'))
          }
        } catch (err: any) {
          console.log('❌ Erro no fluxo completo:', err)

          let errorMessage = 'Erro ao carregar dados'

          if (err?.status === 401) {
            errorMessage = 'Sessão expirada. Faça login novamente.'
          } else if (err?.status === 404) {
            errorMessage = 'Serviço temporariamente indisponível'
          } else if (err?.message) {
            errorMessage = err.message
          }

          dispatch(setError(errorMessage))
        } finally {
          setLoadingLines(false)
          console.log('🏁 Fluxo finalizado')
        }
      }

      fetchUserData()
    }, [user?.cpf, user?.parceiro, user?.token, user?.name]),
  )

  // Estado de carregamento
  if (loadingLines || det2Loading || loadingLineChange) {
    return (
      <VStack
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 32,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Icon as={Globe} size="xl" style={{ color: colors.primary }} />
        <Text
          style={{
            fontSize: 16,
            color: colors.text,
            textAlign: 'center',
          }}
        >
          Carregando suas informações...
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.secondary,
            textAlign: 'center',
          }}
        >
          {loadingLines
            ? 'Buscando suas linhas...'
            : loadingLineChange
            ? 'Carregando nova linha...'
            : 'Carregando detalhes...'}
        </Text>
      </VStack>
    )
  }

  // Estado de erro
  if (det2Error) {
    return (
      <VStack
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingVertical: 32,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <Box
          style={{
            padding: 24,
            borderRadius: 16,
            backgroundColor: colors.background,
            alignItems: 'center',
            gap: 16,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
        >
          <Icon
            as={Globe}
            size="xl"
            style={{ color: colors.secondary, marginBottom: 8 }}
          />

          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: colors.text,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Ops! Algo deu errado
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: colors.secondary,
              textAlign: 'center',
              lineHeight: 24,
            }}
          >
            {det2Error}
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.subTitle,
              textAlign: 'center',
              fontStyle: 'italic',
              marginTop: 8,
            }}
          >
            Puxe para baixo para tentar novamente
          </Text>
        </Box>
      </VStack>
    )
  }

  // Renderização principal
  return (
    <VStack
      style={{
        paddingHorizontal: 16,
        paddingBottom: 20,
        gap: 16,
      }}
    >
      {/* Seletor de linhas */}
      <LineSelector
        selectedLine={selectedLine}
        userLines={userLines}
        onLineChange={handleLineChange}
        colors={colors}
        loading={loadingLineChange || det2Loading}
      />

      <AnimatedVStack style={{ gap: 16 }}>
        {/* Cards com dados formatados de consumo */}
        <Animated.View entering={FadeInDown.delay(0).springify().damping(12)}>
          <HStack style={{ gap: 16 }}>
            <HourlyCard
              icon={Globe}
              text="Plano Total"
              currentUpdate={det2Data?.dadosoriginal + ' GB' || 'Sem dados'}
              lastUpdate={det2Data?.plano || 'Sem plano'}
              arrowDownIcon={false}
              arrowUpIcon={false}
            />
            <HourlyCard
              icon={Globe}
              text="Dados Restantes"
              currentUpdate={consumptionData?.dados.restante || 'Sem dados'}
              lastUpdate={`${consumptionData?.dados.percentage || 0}% usado`}
              arrowDownIcon={true}
              arrowUpIcon={false}
            />
          </HStack>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify().damping(12)}>
          <HStack style={{ gap: 16 }}>
            <HourlyCard
              icon={Globe}
              text="Minutos Restantes"
              currentUpdate={consumptionData?.minutos.restante || 'Sem dados'}
              lastUpdate={`${consumptionData?.minutos.percentage || 0}% usado`}
              arrowDownIcon={true}
              arrowUpIcon={false}
            />

            <HourlyCard
              icon={Globe}
              text="SMS Restantes"
              currentUpdate={det2Data?.smsrestante || 'Sem dados'}
              lastUpdate={`${consumptionData?.sms.percentage || 0}% usado`}
              arrowDownIcon={true}
              arrowUpIcon={false}
            />
          </HStack>
        </Animated.View>
      </AnimatedVStack>

      {/* Seção de consumo semanal */}
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
            <Icon
              as={ClockIcon}
              size="sm"
              style={{ color: colors.textButton }}
            />
          </Box>
          <Text
            style={{
              fontFamily: 'DM Sans',
              fontWeight: '400',
              color: colors.secondary,
            }}
          >
            Consumo Semanal
          </Text>
        </HStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 32, paddingHorizontal: 12 }}
        >
          {HourlyForecastData.map((card) => (
            <ForeCastCard
              key={card.id}
              time={card.time}
              imgUrl={card.imgUrl}
              temperature={card.temperature}
            />
          ))}
        </ScrollView>
      </VStack>

      {/* Chart com dados formatados */}
      <Chart
        chartRef={chartRef}
        data={consumptionData}
        selectedLine={selectedLine}
        rawData={det2Data}
      />
    </VStack>
  )
}

export default Home
