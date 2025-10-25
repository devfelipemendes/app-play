// components/layout/PlansCarousel.tsx - Versão Responsiva
import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { Box, Button, HStack, VStack } from '@gluestack-ui/themed'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import {
  useGetPlansQuery,
  useActivateLineMutation,
} from '@/src/api/endpoints/plansApi'
import { RootState } from '@/src/store/index'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { env } from '@/config/env'
import Toast from 'react-native-toast-message'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { FaturaBottomSheet } from '@/src/components/screens/FaturaBottomSheet'
import {
  type FaturaDetalhada,
  useGetFaturaMutation,
} from '@/src/api/endpoints/faturaApi'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import { useRouter } from 'expo-router'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const CARD_WIDTH = screenWidth * 0.9
const CARD_HEIGHT = screenHeight * 0.64
const RESPONSIVE = {
  fontSize: {
    gigasNumber: screenWidth * 0.12,
    gigasUnit: screenWidth * 0.048,
    benefits: screenWidth * 0.033,
    appsTitle: screenWidth * 0.038,
    priceSymbol: screenWidth * 0.03,
    priceValue: screenWidth * 0.08,
    priceLabel: screenWidth * 0.03,
  },
  spacing: {
    cardPadding: screenWidth * 0.045,
    sectionGap: screenHeight * 0.01,
  },
  appIcon: {
    size: (CARD_WIDTH - screenWidth * 0.18) / 3 - 6,
  },
}

interface Plan {
  id: number // ✅ ID do plano personalizado
  planid: number | string
  description: string
  bundle: number | string
  value: string
  qtdvideos?: number | null
  gigas: string
  min: string
  sms: string
  valor_surf?: string
  modelo?: string
  tipo?: string
  parceiro?: string
  valor_infiniti?: string
  descricao_infiniti?: string
  created_at?: string
  updated_at?: string
  mostraApp?: boolean
  nivel?: number | null
  identificador?: string | null
  campanha?: string | null
  franquiaid?: string | null
  mostraappfranquia?: boolean | null
}

interface AppBenefit {
  name: string
  image: any // ImageSourcePropType
}
const mockApps: AppBenefit[] = [
  {
    name: 'WhatsApp',
    image: require('@/assets/images/whatsApp.png'),
  },
  {
    name: 'Acúmulo de Gigas',
    image: require('@/assets/images/acumuloDeGigas.png'),
  },
  {
    name: "SMS's Ilimitados",
    image: require('@/assets/images/smsIlimitado.png'),
  },
  {
    name: 'Ligações Ilimitadas',
    image: require('@/assets/images/ligaçõesIlimitadas.png'),
  },
]

interface PlanCardProps {
  plan: Plan
  animationValue: any
  onBuy: () => void
  isActivating?: boolean // Indica se este plano está sendo ativado
}

const PlanCard: React.FC<PlanCardProps> = React.memo(
  ({ plan, animationValue, onBuy, isActivating = false }) => {
    const { colors } = useCompanyThemeSimple()

    const animatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.9, 1, 0.9],
        Extrapolation.CLAMP,
      )

      const opacity = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.7, 1, 0.7],
        Extrapolation.CLAMP,
      )

      return {
        transform: [{ scale }],
        opacity,
      }
    })

    return (
      <Box
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            alignSelf: 'center',
          },
          animatedStyle,
        ]}
        backgroundColor="white"
        borderRadius={20}
        borderWidth={2}
        borderColor={colors.primary}
        padding={RESPONSIVE.spacing.cardPadding}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={4}
      >
        {/* Gigas - Destaque Principal */}
        <VStack marginBottom={RESPONSIVE.spacing.sectionGap * 0.8}>
          <HStack
            alignItems="baseline"
            justifyContent="center"
            display="flex"
            flexDirection="row"
          >
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.gigasNumber,
                fontWeight: 'bold',
                color: colors.primary,
                textAlign: 'center',
                lineHeight: RESPONSIVE.fontSize.gigasNumber * 1.1,
              }}
            >
              {plan.gigas}
            </Text>
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.gigasUnit,
                fontWeight: 'bold',
                color: colors.primary,
                marginLeft: 4,
              }}
            >
              GB
            </Text>
          </HStack>
        </VStack>

        {/* Benefícios */}
        <VStack marginBottom={RESPONSIVE.spacing.sectionGap * 0.8}>
          <Text
            style={{
              fontSize: RESPONSIVE.fontSize.benefits,
              color: colors.text,
              fontWeight: '500',
              textAlign: 'center',
            }}
          >
            {plan.min === '999'
              ? 'Minutos Ilimitados'
              : plan.min + ' ' + 'Minutos'}{' '}
            • {plan.sms} SMS
          </Text>
        </VStack>

        {/* Apps Inclusos */}
        <VStack
          marginBottom={RESPONSIVE.spacing.sectionGap * 0.8}
          flex={1}
          minHeight={0}
        >
          <Text
            style={{
              fontSize: RESPONSIVE.fontSize.appsTitle,
              fontWeight: '600',
              color: colors.text,
              marginBottom: RESPONSIVE.spacing.sectionGap * 0.6,
              textAlign: 'center',
            }}
          >
            Apps inclusos:
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {mockApps.map((app, index) => (
              <View
                key={index}
                style={{
                  alignItems: 'center',
                  width: RESPONSIVE.appIcon.size,
                  marginBottom: 4,
                }}
              >
                {/* Card com imagem */}
                <View
                  style={{
                    width: RESPONSIVE.appIcon.size - 20,
                    aspectRatio: 1,
                    borderRadius: 12,
                    backgroundColor: '#F8F9FA',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                    marginBottom: 6,
                    overflow: 'hidden', // Para respeitar o borderRadius
                  }}
                >
                  {app.image ? (
                    <Image
                      source={app.image}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 12,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      style={{
                        fontSize: RESPONSIVE.fontSize.benefits * 0.8,
                        color: colors.text,
                      }}
                    >
                      {app.name.charAt(0)}
                    </Text>
                  )}
                </View>
                {/* Texto abaixo do card */}
                <Text
                  style={{
                    fontSize: RESPONSIVE.fontSize.benefits * 0.55,
                    color: colors.text,
                    textAlign: 'center',
                    lineHeight: RESPONSIVE.fontSize.benefits * 0.65,
                  }}
                  numberOfLines={2}
                >
                  {app.name}
                </Text>
              </View>
            ))}
          </View>
        </VStack>

        {/* Preço */}
        <VStack
          alignItems="center"
          marginBottom={RESPONSIVE.spacing.sectionGap * 0.8}
          marginTop={RESPONSIVE.spacing.sectionGap * 0.5}
        >
          <HStack alignItems="baseline" justifyContent="center">
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.priceSymbol,
                color: colors.subTitle,
                fontWeight: '500',
              }}
            >
              R$
            </Text>
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.priceValue,
                fontWeight: 'bold',
                color: colors.text,
                marginLeft: 4,
                lineHeight: RESPONSIVE.fontSize.priceValue * 1.1,
              }}
            >
              {plan.value}
            </Text>
          </HStack>
          <Text
            style={{
              fontSize: RESPONSIVE.fontSize.priceLabel,
              color: colors.subTitle,
              fontWeight: '500',
            }}
          >
            por mês
          </Text>
        </VStack>

        {/* Botão de Compra */}
        <Button
          onPress={onBuy}
          disabled={isActivating}
          style={{
            backgroundColor: isActivating ? colors.disabled : colors.primary,
            borderRadius: 16,
            paddingVertical: screenHeight * 0.018,
            paddingHorizontal: screenWidth * 0.06,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isActivating ? 0.1 : 0.3,
            shadowRadius: 8,
            elevation: isActivating ? 2 : 6,
          }}
        >
          {isActivating ? (
            <HStack space="sm" alignItems="center" justifyContent="center">
              <ActivityIndicator size="small" color={colors.textButton} />
              <Text
                style={{
                  color: colors.textButton,
                  fontSize: screenWidth * 0.04,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Ativando...
              </Text>
            </HStack>
          ) : (
            <Text
              style={{
                color: colors.textButton,
                fontSize: screenWidth * 0.04,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Contratar Plano
            </Text>
          )}
        </Button>
      </Box>
    )
  },
  (prevProps, nextProps) => {
    // Re-renderizar se o planid ou isActivating mudarem
    return (
      prevProps.plan.planid === nextProps.plan.planid &&
      prevProps.isActivating === nextProps.isActivating
    )
  },
)

const PlansCarousel: React.FC = () => {
  const carouselRef = useRef<ICarouselInstance>(null)
  const faturaBottomSheetRef = useRef<BottomSheetModal>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [faturaDetalhada, setFaturaDetalhada] =
    useState<FaturaDetalhada | null>(null)
  const [activatingPlanId, setActivatingPlanId] = useState<number | null>(null) // Controla qual plano está sendo ativado
  const progressValue = useSharedValue<number>(0)
  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  // Buscar informações do usuário do Redux
  const userInfo = useAppSelector((state: RootState) => state.ativarLinha || {})
  const { cpf = '', phone = '', iccid = '', ddd = '' } = userInfo
  // Usa o DDD selecionado ou extrai do telefone como fallback
  const dddToUse = ddd || phone.replace(/\D/g, '').slice(0, 2)

  // Query para buscar planos
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetPlansQuery({
    companyid: env.COMPANY_ID,
  })

  // Mutation para ativar linha
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()

  // Mutation para buscar fatura completa
  const [getFatura, { isLoading: isLoadingFatura }] = useGetFaturaMutation()

  const canShowPlans = env.COMPANY_ID

  // Mostrar apenas planos personalizados com mostraApp: true
  const allPlans = (plansData?.personalizado || []).filter(
    (plan) => plan.mostraApp === true,
  )

  const handleCloseFatura = () => {
    // Primeiro fecha o modal
    faturaBottomSheetRef.current?.dismiss()

    // Aguarda um pouco antes de redirecionar para garantir que o modal foi desmontado
    setTimeout(() => {
      setFaturaDetalhada(null) // Limpa a fatura
      dispatch(setMode('login'))
    }, 300)
  }

  const handleBuyPlan = useCallback(
    async (plan: Plan) => {
      if (!cpf || !dddToUse || !iccid) {
        Toast.show({
          type: 'info',
          text1: 'Dados Incompletos',
          text2: 'Complete o cadastro antes de contratar um plano',
        })
        return
      }

      try {
        Alert.alert(
          'Confirmar Compra',
          `Deseja contratar o plano de ${plan.gigas}GB por R$ ${plan.value}/mês?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              style: 'default',
              onPress: async () => {
                // Define que este plano está sendo ativado
                setActivatingPlanId(plan.id)

                const payload = {
                  cpf: cpf,
                  ddd: dddToUse,
                  iccid: iccid,
                  planid: plan.planid.toString(),
                  planid_personalizado: plan.id.toString(),
                  isApp: true,
                  pospago: false,
                  userInfo: JSON.stringify(userInfo),
                  esim: false,
                  companyid: env.COMPANY_ID,
                }

                try {
                  const result = await activateLine(payload).unwrap()

                  // 🔍 DEBUG: Log da resposta da ativação
                  console.log(
                    '📦 [ATIVAÇÃO] Resposta completa:',
                    JSON.stringify(result, null, 2),
                  )
                  console.log(
                    '🎯 [ATIVAÇÃO] result.fatura (paymentId):',
                    result?.fatura,
                  )

                  // Se a resposta contém um paymentId, busca a fatura completa
                  if (result?.fatura && typeof result.fatura === 'string') {
                    console.log(
                      '✅ [ATIVAÇÃO] PaymentId detectado:',
                      result.fatura,
                    )
                    console.log(
                      '🔄 [ATIVAÇÃO] Buscando dados completos da fatura...',
                    )

                    try {
                      // Busca a fatura completa usando o paymentId
                      const faturaCompleta = await getFatura({
                        payid: result.fatura,
                      }).unwrap()

                      console.log('✅ [ATIVAÇÃO] Fatura completa recebida!')
                      console.log(
                        '✅ [ATIVAÇÃO] faturaCompleta.payment:',
                        faturaCompleta.payment,
                      )
                      console.log('✅ [ATIVAÇÃO] Campos importantes:', {
                        id: faturaCompleta.id,
                        payment: faturaCompleta.payment,
                        value: faturaCompleta.value,
                        status: faturaCompleta.status,
                        dueDate: faturaCompleta.dueDate,
                        barcode: faturaCompleta.barcode
                          ? '✅ existe'
                          : '❌ não existe',
                        payload: faturaCompleta.payload
                          ? '✅ existe'
                          : '❌ não existe',
                      })

                      // Define a fatura completa no estado
                      setFaturaDetalhada(faturaCompleta)

                      console.log('🚀 [ATIVAÇÃO] Abrindo modal de fatura...')
                      faturaBottomSheetRef.current?.present()

                      // Remove loading ao abrir o modal
                      setActivatingPlanId(null)
                    } catch (faturaError: any) {
                      console.error(
                        '❌ [ATIVAÇÃO] Erro ao buscar fatura:',
                        faturaError,
                      )
                      Toast.show({
                        type: 'error',
                        text1: 'Erro ao carregar fatura',
                        text2:
                          faturaError?.data?.message ||
                          'Não foi possível carregar os detalhes da fatura',
                      })
                      // Remove loading
                      setActivatingPlanId(null)
                      // Mesmo com erro na fatura, redireciona após 2s
                      setTimeout(() => {
                        dispatch(setMode('login'))
                      }, 2000)
                    }
                  } else {
                    console.log('ℹ️ [ATIVAÇÃO] Nenhum paymentId retornado')
                    // Se não tem fatura, mostra toast de sucesso
                    Toast.show({
                      type: 'success',
                      text1: 'Sucesso!',
                      text2: result.msg || 'Linha ativada com sucesso!',
                    })
                    // Remove loading
                    setActivatingPlanId(null)
                    // Redireciona para login após 2 segundos
                    setTimeout(() => {
                      dispatch(setMode('login'))
                    }, 2000)
                  }
                } catch (error: any) {
                  console.error('❌ [ATIVAÇÃO] Erro ao ativar linha:', error)
                  Toast.show({
                    type: 'error',
                    text1: 'Erro ao ativar linha',
                    text2: error.data?.msg || 'Tente novamente em instantes',
                  })
                  // Remove loading em caso de erro
                  setActivatingPlanId(null)
                }
              },
            },
          ],
        )
      } catch (error) {
        // Silently fail
      }
    },
    [cpf, dddToUse, iccid, userInfo, activateLine, dispatch],
  )

  const renderPlanCard = useCallback(
    ({ item, animationValue }: { item: Plan; animationValue: any }) => {
      const handleBuy = () => handleBuyPlan(item)
      const isActivating = activatingPlanId === item.id
      return (
        <PlanCard
          plan={item}
          animationValue={animationValue}
          onBuy={handleBuy}
          isActivating={isActivating}
        />
      )
    },
    [handleBuyPlan, activatingPlanId],
  )

  const onProgressChange = (offsetProgress: number) => {
    progressValue.value = offsetProgress
  }

  const onSnapToItem = (index: number) => {
    setCurrentIndex(index)
  }

  // Renderizar dots indicadores
  const renderDots = () => {
    if (allPlans.length <= 1) return null

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',

          gap: 8,
        }}
      >
        {allPlans.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              carouselRef.current?.scrollTo({ index, animated: true })
            }}
            style={{
              padding: 8,
            }}
          >
            <View
              style={{
                width: currentIndex === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  currentIndex === index ? colors.primary : colors.disabled,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  if (!canShowPlans) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.background}
        padding={20}
      >
        <VStack alignItems="center" space={'sm'}>
          <Text style={{ fontSize: 18, color: colors.subTitle }}>
            Preparando planos...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.background}
        padding={20}
      >
        <VStack alignItems="center" space={'sm'}>
          <Text style={{ fontSize: 18, color: colors.subTitle }}>
            Carregando planos...
          </Text>
        </VStack>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding={20}
        backgroundColor={colors.background}
      >
        <VStack alignItems="center" space={'sm'}>
          <Text
            style={{ fontSize: 18, color: colors.error, textAlign: 'center' }}
          >
            Erro ao carregar planos
          </Text>
          <Button
            onPress={() => refetch()}
            backgroundColor={colors.primary}
            borderRadius={12}
            paddingHorizontal={24}
            paddingVertical={12}
          >
            <Text
              style={{
                color: colors.textButton,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Tentar Novamente
            </Text>
          </Button>
        </VStack>
      </Box>
    )
  }

  if (allPlans.length === 0) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.background}
        padding={20}
      >
        <Text style={{ fontSize: 18, color: colors.subTitle }}>
          Nenhum plano disponível
        </Text>
      </Box>
    )
  }

  if (allPlans.length === 1) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.background}
        padding={10}
      >
        <PlanCard
          plan={allPlans[0]}
          animationValue={useSharedValue(0)}
          onBuy={() => handleBuyPlan(allPlans[0])}
          isActivating={activatingPlanId === allPlans[0].id}
        />
      </Box>
    )
  }

  return (
    <Box flex={1} backgroundColor={colors.background} justifyContent="center">
      <Carousel
        ref={carouselRef}
        loop={false}
        width={screenWidth}
        height={CARD_HEIGHT}
        data={allPlans}
        renderItem={renderPlanCard}
        onProgressChange={onProgressChange}
        onSnapToItem={onSnapToItem}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 40,
          parallaxAdjacentItemScale: 0.8,
        }}
        scrollAnimationDuration={400}
        enabled={true}
        pagingEnabled={true}
      />

      {renderDots()}

      {/* MODAL DE FATURA */}
      <FaturaBottomSheet
        ref={faturaBottomSheetRef}
        fatura={faturaDetalhada}
        onClose={handleCloseFatura}
      />
    </Box>
  )
}

export default PlansCarousel
