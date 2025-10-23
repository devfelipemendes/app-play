import React, { useContext, useEffect, useRef, useState } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { Globe } from 'lucide-react-native'
import DaysCard from '@/components/screens/weather/days-card'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAuth } from '@/hooks/useAuth'
import { useAppSelector } from '@/src/store/hooks'
import { selectDet2Data, selectDet2Error } from '@/src/store/slices/det2Slice'
import {
  useListarFaturasQuery,
  type Fatura,
} from '@/src/api/endpoints/faturasApi'
import { FaturaBottomSheet } from '@/src/components/screens/FaturaBottomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import {
  useGetFaturaMutation,
  type FaturaDetalhada,
} from '@/src/api/endpoints/faturaApi'
import Toast from 'react-native-toast-message'

const Days = () => {
  const { hasDaysTabAnimated, registerRefreshCallback }: any =
    useContext(WeatherTabContext)
  const AnimatedVStack = Animated.createAnimatedComponent(VStack)
  const { colors } = useCompanyThemeSimple()
  const { user } = useAuth()

  // Pegar dados da linha selecionada do Redux
  const det2Data = useAppSelector(selectDet2Data)
  const det2Error = useAppSelector(selectDet2Error)

  // Verificar se tem MSISDN ativo
  const isNoMsisdn = det2Error === 'NO_MSISDN'
  const hasLineData = det2Data?.iccid && user?.token && !isNoMsisdn

  // Estados para o modal de fatura
  const faturaBottomSheetRef = useRef<BottomSheetModal>(null)
  const [faturaDetalhada, setFaturaDetalhada] =
    useState<FaturaDetalhada | null>(null)
  const [getFatura, { isLoading: loadingFatura }] = useGetFaturaMutation()

  // Buscar faturas da API (só se tiver MSISDN ativo)
  const {
    data: faturasData,
    isLoading,
    error,
    refetch,
  } = useListarFaturasQuery(
    {
      token: user?.token || '',
      parametro: det2Data?.iccid || '',
    },
    {
      skip: !hasLineData, // Pular query se não tiver dados necessários
    },
  )

  useEffect(() => {
    hasDaysTabAnimated.current = true
  }, [])

  // Registrar função de refresh no contexto (tab 1 = faturas)
  useEffect(() => {
    if (registerRefreshCallback) {
      const refreshFaturas = async () => {
        console.log('🔄 Atualizando faturas...')
        if (hasLineData) {
          await refetch()
        }
      }
      registerRefreshCallback(1, refreshFaturas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRefreshCallback, hasLineData])

  // Função para abrir modal de fatura
  const handleOpenFatura = async (paymentId: string) => {
    try {
      console.log('📄 Abrindo fatura:', paymentId)

      const result = await getFatura({
        payid: paymentId,
      }).unwrap()

      console.log('✅ Dados da fatura:', result)

      setFaturaDetalhada(result)
      faturaBottomSheetRef.current?.present()
    } catch (err: any) {
      console.error('❌ Erro ao buscar fatura:', err)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: err?.data?.erro || 'Erro ao carregar fatura',
      })
    }
  }

  // Função para fechar modal
  const handleCloseFatura = () => {
    faturaBottomSheetRef.current?.dismiss()
    setFaturaDetalhada(null)
  }

  // Estado: Sem MSISDN ativo
  if (isNoMsisdn) {
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
            Ative uma linha para visualizar suas faturas
          </Text>
        </Box>
      </VStack>
    )
  }

  // Estado: Carregando
  if (isLoading) {
    return (
      <VStack
        className="px-5 pb-5 justify-center items-center"
        style={{ paddingTop: 40 }}
      >
        <Text style={{ fontSize: 16, color: colors.secondary }}>
          Carregando faturas...
        </Text>
      </VStack>
    )
  }

  // Estado: Erro ao carregar
  if (error) {
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
          <Text
            style={{ fontSize: 16, color: colors.error, textAlign: 'center' }}
          >
            Erro ao carregar faturas
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

  // Estado: Sem faturas
  if (!faturasData?.data?.faturas || faturasData.data.faturas.length === 0) {
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
            Nenhuma fatura encontrada
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.secondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            Quando você tiver faturas, elas aparecerão aqui
          </Text>
        </Box>
      </VStack>
    )
  }

  // Estado: Com faturas - Renderizar lista
  // Ordenar faturas: pendentes (0) primeiro, depois estornadas (2), depois pagas (1)
  const faturasOrdenadas = [...faturasData.data.faturas].sort((a, b) => {
    const prioridade = { 0: 0, 2: 1, 1: 2 }
    const prioA = prioridade[a.paymentstatus as keyof typeof prioridade] ?? 3
    const prioB = prioridade[b.paymentstatus as keyof typeof prioridade] ?? 3
    return prioA - prioB
  })

  return (
    <>
      <AnimatedVStack space="md" className="px-5 pb-5">
        {faturasOrdenadas.map((fatura: Fatura, index: number) => {
          return (
            <Animated.View
              key={fatura.paymentid}
              entering={
                hasDaysTabAnimated.current
                  ? undefined
                  : FadeInDown.delay(index * 100)
                      .springify()
                      .damping(12)
              }
            >
              <DaysCard
                name={fatura.tipo}
                created={fatura.created}
                highest={fatura.valuetopup}
                lowest={fatura.netvalue}
                paymentStatus={fatura.paymentstatus}
                onPress={() =>
                  handleOpenFatura(fatura.paymentasaasid.toString())
                }
              />
            </Animated.View>
          )
        })}
      </AnimatedVStack>

      {/* Modal de detalhes da fatura */}
      <FaturaBottomSheet
        ref={faturaBottomSheetRef}
        fatura={faturaDetalhada}
        onClose={handleCloseFatura}
      />
    </>
  )
}

export default Days
