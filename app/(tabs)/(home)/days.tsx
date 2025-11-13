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
  useGetFaturaMutation,
  type Fatura,
  type FaturaDetalhada,
} from '@/src/api/endpoints/faturaApi'
import { FaturaBottomSheet } from '@/src/components/screens/FaturaBottomSheet'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
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

  // Estados para o modal de fatura
  const faturaBottomSheetRef = useRef<BottomSheetModal>(null)
  const [faturaDetalhada, setFaturaDetalhada] =
    useState<FaturaDetalhada | null>(null)
  const [getFatura] = useGetFaturaMutation()

  // 🔍 Determinar parâmetro de busca: CPF ou ICCID
  // Se não tem linha ativa (isNoMsisdn), busca por CPF do usuário logado
  // Se tem linha ativa, busca por ICCID da linha selecionada
  const parametroBusca = isNoMsisdn ? user?.cpf || '' : det2Data?.iccid || ''
  const canFetchFaturas = user?.token && parametroBusca

  console.log('🔍 [FATURAS] ===== DEBUG BUSCA FATURAS =====')
  console.log('🔍 [FATURAS] user?.cpf:', user?.cpf)
  console.log('🔍 [FATURAS] det2Data?.iccid:', det2Data?.iccid)
  console.log('🔍 [FATURAS] isNoMsisdn:', isNoMsisdn)
  console.log('🔍 [FATURAS] Tipo de busca:', isNoMsisdn ? 'CPF' : 'ICCID')
  console.log('🔍 [FATURAS] Parâmetro usado:', parametroBusca)
  console.log('🔍 [FATURAS] canFetchFaturas:', canFetchFaturas)
  console.log('🔍 [FATURAS] =================================')

  // Buscar faturas da API
  // Busca por CPF se não tem linha ativa, por ICCID se tem
  const {
    data: faturasData,
    isLoading,
    error,
    refetch,
  } = useListarFaturasQuery(
    {
      token: user?.token || '',
      parametro: parametroBusca,
    },
    {
      skip: !canFetchFaturas, // Pular query se não tiver dados necessários
    },
  )

  useEffect(() => {
    hasDaysTabAnimated.current = true
    // eslint-disable-next-line
  }, [])

  // 📊 LOG DETALHADO DA RESPOSTA DO ENDPOINT
  useEffect(() => {
    if (faturasData) {
      console.log('📊 ===== RESPOSTA COMPLETA DO ENDPOINT /fatura/listar =====')
      console.log('📊 JSON completo:', JSON.stringify(faturasData, null, 2))
      console.log(
        '📊 =========================================================',
      )
      console.log('📊 Dados detalhados:')
      console.log('📊 success:', faturasData.success)
      console.log('📊 message:', faturasData.message)
      console.log('📊 msisdn:', faturasData.data?.msisdn)
      console.log('📊 iccid:', faturasData.data?.iccid)
      console.log('📊 rede:', faturasData.data?.rede)
      console.log(
        '📊 Total de faturas:',
        faturasData.data?.faturas?.length || 0,
      )
      console.log(
        '📊 =========================================================',
      )

      // Log individual de cada fatura
      if (faturasData.data?.faturas) {
        faturasData.data.faturas.forEach((fatura, index) => {
          console.log(`📊 ===== FATURA ${index + 1} =====`)
          console.log('📊 paymentid:', fatura.paymentid)
          console.log('📊 tipo:', fatura.tipo)
          console.log(
            '📊 valuetopup:',
            fatura.valuetopup,
            typeof fatura.valuetopup,
          )
          console.log('📊 paymentstatus:', fatura.paymentstatus)
          console.log('📊 created:', fatura.created)
          console.log('📊 invoicenumber:', fatura.invoicenumber)
          console.log(
            '📊 JSON completo da fatura:',
            JSON.stringify(fatura, null, 2),
          )
          console.log('📊 =============================')
        })
      }
    }
  }, [faturasData])

  // Registrar função de refresh no contexto (tab 1 = faturas)
  useEffect(() => {
    if (registerRefreshCallback) {
      const refreshFaturas = async () => {
        console.log('🔄 [FATURAS] Atualizando faturas...')
        console.log('🔄 [FATURAS] canFetchFaturas:', canFetchFaturas)
        if (canFetchFaturas) {
          await refetch()
        }
      }
      registerRefreshCallback(1, refreshFaturas)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerRefreshCallback, canFetchFaturas])

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

  // ✅ REMOVIDO: Não precisa mais deste bloco
  // Agora, mesmo sem linha ativa (isNoMsisdn), vai buscar faturas por CPF
  // O componente vai renderizar normalmente e mostrar "Carregando" ou "Sem faturas"

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
            Você ainda não possui faturas
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
  // Ordenar faturas por data de criação: mais recente primeiro
  const faturasOrdenadas = [...faturasData.data.faturas].sort((a, b) => {
    const dateA = new Date(a.created).getTime()
    const dateB = new Date(b.created).getTime()
    return dateB - dateA // Decrescente (mais recente primeiro)
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
