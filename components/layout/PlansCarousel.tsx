// components/PlansCarousel.tsx
import React, { useRef, useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
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

const { width: screenWidth } = Dimensions.get('window')
const CARD_WIDTH = screenWidth * 0.85
const SIDE_CARD_WIDTH = screenWidth * 0.65

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
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.85, 1, 0.85],
      Extrapolation.CLAMP,
    )

    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.6, 1, 0.6],
      Extrapolation.CLAMP,
    )

    const translateY = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [20, 0, 20],
      Extrapolation.CLAMP,
    )

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    }
  })

  return (
    <Box
      style={[
        {
          width: CARD_WIDTH,
          alignSelf: 'center',
        },
        animatedStyle,
      ]}
      backgroundColor="white"
      borderRadius={20}
      borderWidth={1}
      borderColor="#E5E7EB"
      padding={24}
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.15}
      shadowRadius={12}
      elevation={8}
    >
      {/* Gigas - Destaque Principal */}
      <VStack alignItems="center" marginBottom={28}>
        <Text
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            color: '#2563EB',
            textAlign: 'center',
            lineHeight: 60,
          }}
        >
          {plan.gigas}
        </Text>
        <Text
          style={{
            fontSize: 18,
            color: '#6B7280',
            marginTop: -4,
            fontWeight: '500',
          }}
        >
          de internet
        </Text>
      </VStack>

      {/* Benefícios */}
      <VStack space={'sm'} marginBottom={28}>
        <HStack alignItems="center" space={'sm'}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#10B981',
            }}
          />
          <Text
            style={{
              fontSize: 16,
              color: '#374151',
              fontWeight: '500',
            }}
          >
            {plan.min} de ligações
          </Text>
        </HStack>

        <HStack alignItems="center" space={'sm'}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#10B981',
            }}
          />
          <Text
            style={{
              fontSize: 16,
              color: '#374151',
              fontWeight: '500',
            }}
          >
            {plan.sms} SMS
          </Text>
        </HStack>
      </VStack>

      {/* Apps Inclusos */}
      <VStack marginBottom={28}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 16,
          }}
        >
          Apps inclusos:
        </Text>
        <HStack flexWrap="wrap" space={'sm'} justifyContent="center">
          {mockApps.slice(0, 6).map((app, index) => (
            <View
              key={index}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                marginBottom: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Image
                source={{ uri: app.icon }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                }}
                resizeMode="cover"
              />
            </View>
          ))}
        </HStack>
      </VStack>

      {/* Preço */}
      <VStack alignItems="center" marginBottom={24}>
        <HStack alignItems="baseline" space={'sm'}>
          <Text
            style={{
              fontSize: 14,
              color: '#6B7280',
              fontWeight: '500',
            }}
          >
            R$
          </Text>
          <Text
            style={{
              fontSize: 42,
              fontWeight: 'bold',
              color: '#1F2937',
              lineHeight: 48,
            }}
          >
            {plan.value}
          </Text>
        </HStack>
        <Text
          style={{
            fontSize: 16,
            color: '#6B7280',
            fontWeight: '500',
          }}
        >
          por mês
        </Text>
      </VStack>

      {/* Botão de Compra */}
      <Button
        onPress={onBuy}
        backgroundColor="#2563EB"
        borderRadius={16}
        padding={18}
        shadowColor="#2563EB"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.3}
        shadowRadius={8}
        elevation={6}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '600',
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

  const dispatch = useDispatch()

  // Buscar informações do usuário do Redux
  const userInfo = useSelector((state: any) => state.user)
  const { cpf, parceiro, token, iccid, ddd } = userInfo

  // Query para buscar planos
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetPlansQuery({
    parceiro,
    token,
    userInfo: JSON.stringify(userInfo),
    iccid,
  })

  // Mutation para ativar linha
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()

  // Combinar planos originais e personalizados
  const allPlans = plansData
    ? [...(plansData.Original || []), ...(plansData.personalizado || [])]
    : []

  const handleBuyPlan = async (plan: Plan) => {
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
                cpf,
                ddd,
                iccid,
                planid: plan.planid.toString(),
                planid_personalizado: '', // Definir lógica para identificar se é personalizado
                isApp: true,
                pospago: 'N', // Definir lógica baseada no plano
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

  const onProgressChange = (
    offsetProgress: number,
    absoluteProgress: number,
  ) => {
    progressValue.value = offsetProgress
  }

  const onSnapToItem = (index: number) => {
    setCurrentIndex(index)
  }

  const renderDots = () => {
    if (allPlans.length <= 1) return null

    return (
      <HStack
        justifyContent="center"
        space={'sm'}
        marginTop={24}
        marginBottom={20}
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
                width: currentIndex === index ? 24 : 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: currentIndex === index ? '#2563EB' : '#D1D5DB',
                // transition: 'all 0.3s ease',
              }}
            />
          </TouchableOpacity>
        ))}
      </HStack>
    )
  }

  if (isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#F9FAFB"
      >
        <VStack alignItems="center" space={'sm'}>
          <Text style={{ fontSize: 18, color: '#6B7280' }}>
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
        backgroundColor="#F9FAFB"
      >
        <VStack alignItems="center" space={'sm'}>
          <Text style={{ fontSize: 18, color: '#EF4444', textAlign: 'center' }}>
            Erro ao carregar planos
          </Text>
          <Button
            onPress={() => refetch()}
            backgroundColor="#2563EB"
            borderRadius={12}
            paddingHorizontal={24}
            paddingVertical={12}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
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
        backgroundColor="#F9FAFB"
      >
        <Text style={{ fontSize: 18, color: '#6B7280' }}>
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
        padding={20}
        backgroundColor="#F9FAFB"
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
    <Box flex={1} backgroundColor="#F9FAFB">
      <Box flex={1} justifyContent="center">
        <Carousel
          ref={carouselRef}
          loop={false}
          width={screenWidth}
          height={600}
          data={allPlans}
          renderItem={renderPlanCard}
          onProgressChange={onProgressChange}
          onSnapToItem={onSnapToItem}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.85,
            parallaxScrollingOffset: 50,
            parallaxAdjacentItemScale: 0.75,
          }}
          customConfig={() => ({ type: 'positive', viewCount: 3 })}
          scrollAnimationDuration={800}
          enabled={true}
          pagingEnabled={true}
        />
      </Box>
      {renderDots()}
    </Box>
  )
}

export default PlansCarousel
