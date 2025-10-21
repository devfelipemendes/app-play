import React, { useEffect, useState } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Globe } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import { HStack } from '@/components/ui/hstack'
import HourlyCard from '@/components/screens/weather/hourly-card'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

import MonthlyChart from '@/components/screens/weather/monthly-chart'

import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

import Animated, { FadeInDown } from 'react-native-reanimated'
import { StatusBar } from 'expo-status-bar'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
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
  setHasInitialized,
  setUserLines as setReduxUserLines,
  selectDet2Data,
  selectDet2Loading,
  selectDet2Error,
  selectDet2HasInitialized,
  selectDet2UserLines,
  selectHasCacheForIccid,
} from '@/src/store/slices/det2Slice'

import {
  useGetUserLinesMutation,
  type GetUserLinesResponse,
  type UserLine,
} from '@/src/api/endpoints/verLinhas'
import LineSelector from '@/components/layout/lineSelector'
import { useDadosFormatter } from '@/src/utils/dadosFormatter'
import { TouchableOpacity } from 'react-native'
import ActivateLineModal from '@/components/layout/ActivateLineModal'
import WeeklyConsumption from '@/components/screens/weather/weekly-consumption'

const Home = () => {
  const AnimatedVStack = Animated.createAnimatedComponent(VStack)

  // Contexto das tabs internas
  const { registerRefreshCallback }: any = React.useContext(WeatherTabContext)

  // Estados globais do Redux
  const det2Data = useAppSelector(selectDet2Data)
  const det2Loading = useAppSelector(selectDet2Loading)
  const det2Error = useAppSelector(selectDet2Error)
  const hasInitialized = useAppSelector(selectDet2HasInitialized)
  const reduxUserLines = useAppSelector(selectDet2UserLines)
  const det2State = useAppSelector((state) => state.det2)

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
  const [showActivateModal, setShowActivateModal] = useState(false)

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
      console.log('🔑 Token Length:', user?.token?.length)
      console.log('👤 User Data:', {
        cpf: user?.cpf,
        parceiro: user?.parceiro,
        hasToken: !!user?.token,
      })

      const det2Result = await getDet2(det2Request).unwrap()

      console.log('✅ Dados recebidos:', det2Result)

      // Salvar no estado global
      dispatch(setData(det2Result))
    } catch (err: any) {
      console.log('❌ Erro ao buscar dados:', err)

      // Se for erro 401, token expirou
      if (err?.status === 401) {
        dispatch(setError('Sessão expirada. Faça login novamente.'))
      } else {
        dispatch(
          setError(
            err?.data?.erro ||
              err?.message ||
              'Erro ao carregar dados da linha',
          ),
        )
      }
    }
  }

  // Função para trocar de linha
  const handleLineChange = async (newLine: UserLine) => {
    if (newLine.id === selectedLine?.id) return

    try {
      setLoadingLineChange(true)
      setSelectedLine(newLine)

      // Verificar se a linha tem MSISDN ativo
      const hasMsisdn = newLine.msisdn && newLine.msisdnstatus === 0

      if (hasMsisdn) {
        console.log('🟢 Trocando para linha com MSISDN ativo')
        await fetchLineData(newLine)
      } else {
        console.log('⚠️ Linha selecionada não tem MSISDN ativo')
        dispatch(setError('NO_MSISDN'))
      }
    } catch (err: any) {
      console.log('❌ Erro ao trocar linha:', err)
    } finally {
      setLoadingLineChange(false)
    }
  }

  // Função para buscar todos os dados (usada no pull-to-refresh e na inicialização)
  const fetchUserData = useCallback(async () => {
    try {
      setLoadingLines(true)
      dispatch(setError(null))

      console.log('📞 Buscando linhas do usuário...')

      // 1. Buscar linhas do usuário
      const linesRequest = {
        parceiro: user?.parceiro || 'PLAY MÓVEL',
        token: user?.token || '',
        cpf: user?.cpf || '',
        franquiado: 0,
        isApp: true,
        usuario_atual: user?.cpf || '',
      }

      console.log('📤 Request getUserLines:', linesRequest)

      const linesResult = await getUserLines(linesRequest).unwrap()

      console.log('✅ Linhas encontradas:', linesResult.length, 'linhas')
      console.log('📋 Primeira linha:', linesResult[0])

      console.log('🔄 Salvando linhas no state local...')
      setUserLines(linesResult)

      console.log('🔄 Salvando linhas no Redux...')
      dispatch(setReduxUserLines(linesResult))
      console.log('✅ Dispatch de setReduxUserLines executado com sucesso')

      if (linesResult && linesResult.length > 0) {
        // 2. Selecionar primeira linha (pode ter ou não MSISDN ativo)
        const primaryLine = linesResult[0]
        setSelectedLine(primaryLine)

        // 3. Verificar se tem MSISDN ativo
        const hasMsisdn = primaryLine.msisdn && primaryLine.msisdnstatus === 0

        if (hasMsisdn) {
          console.log('🟢 Linha com MSISDN ativo')
          // Buscar dados da linha ativa
          await fetchLineData(primaryLine)
        } else {
          console.log('⚠️ ICCID sem MSISDN ativo')
          // Não buscar dados, apenas marcar erro especial
          dispatch(setError('NO_MSISDN'))
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.parceiro, user?.token, user?.cpf, getUserLines])

  // Registrar função de refresh no contexto (tab 0 = home)
  useEffect(() => {
    if (registerRefreshCallback) {
      registerRefreshCallback(0, fetchUserData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRefreshCallback, fetchUserData])

  // Carregar dados apenas na primeira vez que a tela é focada
  useFocusEffect(
    useCallback(() => {
      console.log('🔍 Home - useFocusEffect executando...')

      // Se já inicializou, restaurar do Redux
      if (hasInitialized) {
        console.log('✅ Já inicializado, restaurando do Redux...')

        // Restaurar linhas do Redux se existirem
        if (reduxUserLines.length > 0) {
          console.log('📦 Restaurando linhas do Redux:', reduxUserLines.length)
          setUserLines(reduxUserLines)

          // Restaurar linha selecionada
          const selectedIccid = det2Data?.iccid
          if (selectedIccid) {
            const savedLine = reduxUserLines.find(
              (line: any) => line.iccid === selectedIccid
            )
            if (savedLine) {
              console.log('🎯 Restaurando linha selecionada:', savedLine.msisdn)
              setSelectedLine(savedLine)
            }
          }
        }
        return
      }

      if (!user?.cpf || !user?.token) {
        console.log('❌ Usuário sem dados necessários:', {
          cpf: user?.cpf,
          token: !!user?.token,
        })
        dispatch(setError('Dados do usuário incompletos'))
        return
      }

      // Marcar como inicializado no Redux
      console.log('🚀 Primeira inicialização, carregando dados...')
      dispatch(setHasInitialized(true))
      fetchUserData()
    }, [hasInitialized, reduxUserLines, det2Data, user?.cpf, user?.parceiro, user?.token, user?.name, dispatch, fetchUserData]),
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

  // Estado de erro - NÃO renderizar se for NO_MSISDN (será tratado abaixo)
  if (det2Error && det2Error !== 'NO_MSISDN') {
    const isSessionExpired = det2Error.includes('Sessão expirada')

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
            {isSessionExpired ? 'Sessão Expirada' : 'Ops! Algo deu errado'}
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

          {isSessionExpired ? (
            <TouchableOpacity
              onPress={() => {
                // Navegar para tela de login
                // TODO: Implementar logout e navegação
                console.log('Logout e navegar para login')
              }}
              style={{
                marginTop: 16,
                paddingVertical: 12,
                paddingHorizontal: 24,
                backgroundColor: colors.primary,
                borderRadius: 12,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: colors.textButton,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Fazer Login Novamente
              </Text>
            </TouchableOpacity>
          ) : (
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
          )}
        </Box>
      </VStack>
    )
  }

  // Verificar se há linhas e se a linha selecionada tem MSISDN
  const hasLines = userLines.length > 0
  const selectedLineHasMsisdn =
    selectedLine?.msisdn && selectedLine?.msisdnstatus === 0
  const isNoMsisdnError = det2Error === 'NO_MSISDN'

  // Handler para sucesso na ativação
  const handleActivationSuccess = () => {
    // Recarregar as linhas após ativação bem-sucedida
    console.log('🎉 Ativação bem-sucedida, recarregando dados...')
    fetchUserData()
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
      <StatusBar style="light" />
      {/* Seletor de linhas - Sempre mostrar se houver linhas */}
      {hasLines && (
        <LineSelector
          selectedLine={selectedLine}
          userLines={userLines}
          onLineChange={handleLineChange}
          colors={colors}
          loading={loadingLineChange || det2Loading}
        />
      )}

      {/* Mensagem quando ICCID não tem MSISDN ativo */}
      {isNoMsisdnError && selectedLine && (
        <VStack
          style={{
            padding: 32,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
            backgroundColor: colors.background,
            borderRadius: 16,
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
            Este ICCID ainda não possui uma linha ativa. Deseja ativar uma linha
            para este chip?
          </Text>

          <TouchableOpacity
            onPress={() => setShowActivateModal(true)}
            style={{
              marginTop: 8,
              paddingVertical: 14,
              paddingHorizontal: 32,
              backgroundColor: colors.primary,
              borderRadius: 12,
              elevation: 4,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Text
              style={{
                color: colors.textButton,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Ativar Linha
            </Text>
          </TouchableOpacity>
        </VStack>
      )}

      {/* Mostrar dados apenas se linha selecionada tiver MSISDN */}
      {selectedLineHasMsisdn && (
        <>
          <AnimatedVStack style={{ gap: 16 }}>
            {/* Cards com dados formatados de consumo */}
            <Animated.View
              entering={FadeInDown.delay(0).springify().damping(12)}
            >
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
                  lastUpdate={`${
                    consumptionData?.dados.percentage || 0
                  }% usado`}
                  arrowDownIcon={true}
                  arrowUpIcon={false}
                />
              </HStack>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(100).springify().damping(12)}
            >
              <HStack style={{ gap: 16 }}>
                <HourlyCard
                  icon={Globe}
                  text="Minutos Restantes"
                  currentUpdate={
                    consumptionData?.minutos.restante || 'Sem dados'
                  }
                  lastUpdate={`${
                    consumptionData?.minutos.percentage || 0
                  }% usado`}
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
          <WeeklyConsumption msisdn={selectedLine.msisdn} />

          {/* Gráfico de consumo mensal */}
          <MonthlyChart msisdn={selectedLine.msisdn} />
        </>
      )}

      {/* Modal de ativação de linha */}
      <ActivateLineModal
        visible={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        colors={colors}
        iccid={selectedLine?.iccid || userLines[0]?.iccid} // Usar ICCID da linha selecionada
        onSuccess={handleActivationSuccess}
      />
    </VStack>
  )
}

export default Home
