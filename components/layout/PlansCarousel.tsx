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
const CARD_WIDTH = screenWidth * 0.9 // 90% da largura da tela
const CARD_HEIGHT = screenHeight * 0.7 // 65% da altura da tela

interface Plan {
  planid: number | string
  descricao: string
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

const PlanCard: React.FC<PlanCardProps> = ({ plan, animationValue, onBuy }) => {
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
      padding={20}
      shadowColor="#383838"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.15}
      shadowRadius={12}
      elevation={8}
    >
      {/* Gigas - Destaque Principal */}

      <HStack
        alignItems="baseline"
        justifyContent="center"
        display="flex"
        flexDirection="row"
        marginBottom={10}
      >
        <Text
          style={{
            fontSize: screenWidth * 0.12, // Responsivo baseado na largura
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
          }}
        >
          {plan.gigas}
        </Text>
        <Text
          style={{
            fontSize: screenWidth * 0.06,
            fontWeight: 'bold',
            color: colors.primary,
            marginLeft: 4,
          }}
        >
          GB
        </Text>
      </HStack>

      {/* Benefícios */}
      <VStack space={'sm'} marginBottom={15}>
        <Text
          style={{
            fontSize: 14,
            color: colors.text,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {plan.min} Minutos • {plan.sms} SMS
        </Text>
      </VStack>

      {/* Apps Inclusos */}
      <VStack marginBottom={20} flex={1}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
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
            gap: 8,
          }}
        >
          {mockApps.slice(0, 6).map((app, index) => (
            <View
              key={index}
              style={{
                width: (CARD_WIDTH - 80) / 3 - 8, // 3 colunas responsivas
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
                marginBottom: 4,
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
                  fontSize: 8,
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
      <VStack alignItems="center" marginBottom={20}>
        <HStack alignItems="baseline" justifyContent="center">
          <Text
            style={{
              fontSize: 14,
              color: colors.subTitle,
              fontWeight: '500',
            }}
          >
            R$
          </Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: colors.text,
              marginLeft: 4,
            }}
          >
            {plan.value}
          </Text>
        </HStack>
        <Text
          style={{
            fontSize: 14,
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
          paddingVertical: 16,
          paddingHorizontal: 24,
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
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          Contratar Plano
        </Text>
      </Button>
    </Box>
  )
}

const PlansCarousel: React.FC = () => {
  const carouselRef = useRef<ICarouselInstance>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)
  const { colors } = useCompanyThemeSimple()

  // Buscar informações do usuário do Redux
  const userInfo = useAppSelector((state: RootState) => state.ativarLinha || {})
  const {
    parceiro = 'PLAY MÓVEL',
    token = '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
    cpf = '',
    ddd = '',
    iccid = '',
  } = userInfo

  // Query para buscar planos
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetPlansQuery({
    parceiro: parceiro || '46',
    token: token || '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
  })

  // Mutation para ativar linha
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()
  const canShowPlans = parceiro && token

  // Combinar planos originais e personalizados
  const allPlans = plansData
    ? [...(plansData.Original || []), ...(plansData.personalizado || [])]
    : []

  const handleBuyPlan = async (plan: Plan) => {
    if (!cpf || !ddd || !iccid) {
      Alert.alert(
        'Dados Incompletos',
        'Complete o cadastro antes de contratar um plano:\n\n' +
          (!cpf ? '• CPF/CNPJ\n' : '') +
          (!ddd ? '• Telefone\n' : '') +
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
                ddd: ddd,
                iccid: iccid,
                planid: plan.planid.toString(),
                planid_personalizado: '',
                isApp: true,
                pospago: 'N',
                userInfo: JSON.stringify(userInfo),
              }

              try {
                const result = await activateLine(payload).unwrap()
                Alert.alert('Sucesso! 🎉', result.msg, [
                  { text: 'OK', style: 'default' },
                ])
              } catch (error: any) {
                Alert.alert(
                  'Erro ❌',
                  error.data?.msg || 'Erro ao ativar linha',
                  [{ text: 'OK', style: 'default' }],
                )
              }
            },
          },
        ],
      )
    } catch (error) {
      console.error('Erro ao processar compra:', error)
    }
  }

  const renderPlanCard = useCallback(
    ({ item, animationValue }: { item: Plan; animationValue: any }) => (
      <PlanCard
        plan={item}
        animationValue={animationValue}
        onBuy={() => handleBuyPlan(item)}
      />
    ),
    [],
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
      <HStack justifyContent="center" space={'sm'} marginTop={20}>
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
      </HStack>
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
        height={CARD_HEIGHT} // Altura do card + espaço para dots
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
    </Box>
  )
}

export default PlansCarousel
