// components/layout/PlansCarousel.tsx - Versão Responsiva
import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
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

const mockApps = [
  {
    name: 'WhatsApp',
    icon: 'https://via.placeholder.com/40x40/25D366/FFFFFF?text=W',
  },
  {
    name: 'Instagram',
    icon: 'https://via.placeholder.com/40x40/E4405F/FFFFFF?text=I',
  },
  {
    name: 'YouTube',
    icon: 'https://via.placeholder.com/40x40/FF0000/FFFFFF?text=Y',
  },
  {
    name: 'Netflix',
    icon: 'https://via.placeholder.com/40x40/E50914/FFFFFF?text=N',
  },
  {
    name: 'Spotify',
    icon: 'https://via.placeholder.com/40x40/1DB954/FFFFFF?text=S',
  },
  {
    name: 'TikTok',
    icon: 'https://via.placeholder.com/40x40/000000/FFFFFF?text=T',
  },
]

interface PlanCardProps {
  plan: Plan
  animationValue: any
  onBuy: () => void
}

const PlanCard: React.FC<PlanCardProps> = React.memo(
  ({ plan, animationValue, onBuy }) => {
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
            {plan.min} Minutos • {plan.sms} SMS
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
            {mockApps.slice(0, 6).map((app, index) => (
              <View
                key={index}
                style={{
                  width: RESPONSIVE.appIcon.size,
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
                }}
              >
                <Image
                  source={{ uri: app.icon }}
                  style={{
                    width: '60%',
                    height: '60%',
                    borderRadius: 6,
                  }}
                  resizeMode="cover"
                />
                <Text
                  style={{
                    fontSize: RESPONSIVE.fontSize.benefits * 0.65,
                    color: colors.text,
                    fontWeight: '500',
                    marginTop: 2,
                    textAlign: 'center',
                  }}
                  numberOfLines={1}
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
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            paddingVertical: screenHeight * 0.018,
            paddingHorizontal: screenWidth * 0.06,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
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
        </Button>
      </Box>
    )
  },
  (prevProps, nextProps) => {
    // Só re-renderizar se o planid mudar
    return prevProps.plan.planid === nextProps.plan.planid
  },
)

const PlansCarousel: React.FC = () => {
  const carouselRef = useRef<ICarouselInstance>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)
  const { colors } = useCompanyThemeSimple()

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
  const canShowPlans = env.COMPANY_ID

  // Mostrar apenas planos personalizados com mostraApp: true
  const allPlans = (plansData?.personalizado || []).filter(
    (plan) => plan.mostraApp === true,
  )

  const handleBuyPlan = useCallback(
    async (plan: Plan) => {
      if (!cpf || !dddToUse || !iccid) {
        Alert.alert(
          'Dados Incompletos',
          'Complete o cadastro antes de contratar um plano:\n\n' +
            (!cpf ? '• CPF/CNPJ\n' : '') +
            (!dddToUse ? '• DDD\n' : '') +
            (!iccid ? '• ICCID do SIM Card' : ''),
          [{ text: 'OK', style: 'default' }],
        )
        return
      }

      try {
        Alert.alert(
          'Confirmar Compra',
          `Deseja contratar o plano de ${plan.gigas} por R$ ${plan.value}/mês?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Confirmar',
              style: 'default',
              onPress: async () => {
                const payload = {
                  cpf: cpf,
                  ddd: dddToUse,
                  iccid: iccid,
                  planid: plan.planid.toString(),
                  planid_personalizado: plan.id.toString(), // ✅ Usa o ID do plano personalizado
                  isApp: true,
                  pospago: false, // ✅ String 'false' conforme esperado pela API
                  userInfo: JSON.stringify(userInfo),
                  esim: false,
                  companyid: env.COMPANY_ID,
                }

                // Debug visual - mostra o payload na tela
                Alert.alert(
                  '🔍 Debug - Payload',
                  JSON.stringify(payload, null, 2),
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Enviar',
                      onPress: async () => {
                        try {
                          const result = await activateLine(payload).unwrap()

                          // Debug visual - mostra o resultado
                          Alert.alert(
                            '✅ Debug - Resposta',
                            JSON.stringify(result, null, 2),
                            [
                              {
                                text: 'OK',
                                onPress: () => {
                                  Alert.alert('Sucesso! 🎉', result.msg)
                                },
                              },
                            ],
                          )
                        } catch (error: any) {
                          // Debug visual - mostra o erro
                          Alert.alert(
                            '❌ Debug - Erro',
                            JSON.stringify(
                              {
                                status: error.status,
                                data: error.data,
                                message: error.message,
                              },
                              null,
                              2,
                            ),
                            [
                              {
                                text: 'OK',
                                onPress: () => {
                                  Alert.alert(
                                    'Erro ❌',
                                    error.data?.msg || 'Erro ao ativar linha',
                                  )
                                },
                              },
                            ],
                          )
                        }
                      },
                    },
                  ],
                )
              },
            },
          ],
        )
      } catch (error) {
        console.error('Erro ao processar compra:', error)
      }
    },
    [cpf, dddToUse, iccid, userInfo, activateLine],
  )

  const renderPlanCard = useCallback(
    ({ item, animationValue }: { item: Plan; animationValue: any }) => {
      const handleBuy = () => handleBuyPlan(item)
      return (
        <PlanCard
          plan={item}
          animationValue={animationValue}
          onBuy={handleBuy}
        />
      )
    },
    [handleBuyPlan],
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
          marginTop: 8,
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
    </Box>
  )
}

export default PlansCarousel
