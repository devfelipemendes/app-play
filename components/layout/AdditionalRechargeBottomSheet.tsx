// components/layout/AdditionalRechargeBottomSheet.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import {
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  Keyboard,
} from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { X } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetAdditionalPlansQuery,
  useAdditionalRechargeMutation,
} from '@/src/api/endpoints/plansApi'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Dimensões do card do carousel
const CARD_WIDTH = screenWidth * 0.88
const CARD_HEIGHT = screenHeight * 0.5

// Responsividade consistente com ActivateLineBottomSheet
const RESPONSIVE = {
  fontSize: {
    title: screenWidth * 0.048,
    price: screenWidth * 0.1,
    priceSymbol: screenWidth * 0.045,
    description: screenWidth * 0.042,
    benefits: screenWidth * 0.036,
    warning: screenWidth * 0.029,
    button: screenWidth * 0.04,
  },
  spacing: {
    cardPadding: screenWidth * 0.05,
    cardMargin: screenHeight * 0.012,
    sectionGap: screenHeight * 0.012,
  },
  card: {
    borderRadius: 20,
  },
}

interface AdditionalPlan {
  id: number | string
  descricao: string
  value: string
  gigas?: string
  min?: string
  sms?: string
  mostraApp?: boolean
}

interface AdditionalRechargeBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  colors: any
  msisdn?: string
  onSuccess?: (payid?: string) => void
}

// Componente do Card do Plano com Animação
interface PlanCardProps {
  plan: AdditionalPlan
  animationValue: any
  isSelected: boolean
  onSelect: () => void
  colors: any
}

const PlanCard: React.FC<PlanCardProps> = React.memo(
  ({ plan, animationValue, isSelected, onSelect, colors }) => {
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
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.9}
        style={[
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            alignSelf: 'center',
          },
          animatedStyle,
        ]}
      >
        <Box
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: RESPONSIVE.card.borderRadius,
            borderWidth: isSelected ? 3 : 2,
            borderColor: isSelected ? colors.primary : colors.secondary + '20',
            padding: RESPONSIVE.spacing.cardPadding,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 6,
            justifyContent: 'space-between',
          }}
        >
          {/* Título do plano */}
          <VStack style={{ marginBottom: RESPONSIVE.spacing.sectionGap }}>
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.description,
                fontWeight: 'bold',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              {plan.descricao}
            </Text>
          </VStack>

          {/* Separador */}
          <View
            style={{
              height: 1,
              backgroundColor: colors.secondary + '20',
              marginVertical: RESPONSIVE.spacing.sectionGap * 0.8,
            }}
          />

          {/* Preço - Destaque Principal */}
          <VStack style={{ flex: 1, justifyContent: 'center' }}>
            <HStack
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
                marginBottom: RESPONSIVE.spacing.sectionGap,
              }}
            >
              <Text
                style={{
                  fontSize: RESPONSIVE.fontSize.priceSymbol,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                R$
              </Text>
              <Text
                style={{
                  fontSize: RESPONSIVE.fontSize.price,
                  fontWeight: 'bold',
                  color: colors.primary,
                  marginLeft: 6,
                  lineHeight: RESPONSIVE.fontSize.price * 1.1,
                }}
              >
                {plan.value.replace('.', ',')}
              </Text>
            </HStack>

            {/* Informações adicionais - Benefícios */}
            {(plan.gigas || plan.min || plan.sms) && (
              <Text
                style={{
                  fontSize: RESPONSIVE.fontSize.benefits,
                  color: colors.text,
                  fontWeight: '500',
                  textAlign: 'center',
                }}
              >
                {plan.gigas && `${plan.gigas} GB`}
                {plan.min && ` • ${plan.min} min`}
                {plan.sms && ` • ${plan.sms} SMS`}
              </Text>
            )}
          </VStack>

          {/* Aviso */}
          <Text
            style={{
              fontSize: RESPONSIVE.fontSize.warning,
              color: colors.secondary,
              textAlign: 'center',
              fontStyle: 'italic',
              lineHeight: RESPONSIVE.fontSize.warning * 1.5,
              marginTop: RESPONSIVE.spacing.sectionGap,
            }}
          >
            *Só é possível realizar uma recarga adicional se o plano estiver em
            dia.
          </Text>
        </Box>
      </TouchableOpacity>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.plan.id === nextProps.plan.id &&
      prevProps.isSelected === nextProps.isSelected
    )
  },
)

const AdditionalRechargeBottomSheet: React.FC<
  AdditionalRechargeBottomSheetProps
> = ({ isOpen, onClose, colors, msisdn, onSuccess }) => {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<AdditionalPlan | null>(null)
  const carouselRef = useRef<ICarouselInstance>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)

  // Ref do BottomSheet
  const bottomSheetRef = useRef<BottomSheet>(null)

  // Snap points do bottom sheet (80% da tela)
  const snapPoints = useMemo(() => ['80%'], [])

  // Query para buscar planos adicionais
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetAdditionalPlansQuery(
    {
      token: user?.token || '',
      parceiro: user?.parceiro || '',
    },
    {
      skip: !user?.token || !user?.parceiro, // Só executa se tiver token e parceiro
    },
  )

  // Mutation para realizar recarga adicional
  const [additionalRecharge, { isLoading: isRecharging }] =
    useAdditionalRechargeMutation()

  const allPlans = plansData?.personalizado || []

  // Auto-selecionar primeiro plano quando os planos carregarem
  useEffect(() => {
    if (allPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(allPlans[0])
    }
  }, [allPlans, selectedPlan])

  // Controlar abertura/fechamento do bottom sheet
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      Keyboard.dismiss()
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

  const handleSelectPlan = (plan: AdditionalPlan) => {
    setSelectedPlan(plan)
  }

  const renderPlanCard = useCallback(
    ({
      item,
      animationValue,
    }: {
      item: AdditionalPlan
      animationValue: any
    }) => {
      const handleSelect = () => setSelectedPlan(item)
      const isSelected = selectedPlan?.id === item.id

      return (
        <PlanCard
          plan={item}
          animationValue={animationValue}
          isSelected={isSelected}
          onSelect={handleSelect}
          colors={colors}
        />
      )
    },
    [selectedPlan?.id, colors],
  )

  const onProgressChange = (offsetProgress: number) => {
    progressValue.value = offsetProgress
  }

  const onSnapToItem = (index: number) => {
    setCurrentIndex(index)
    const newPlan = allPlans[index]
    if (newPlan && selectedPlan?.id !== newPlan.id) {
      setSelectedPlan(newPlan)
    }
  }

  const renderDots = () => {
    if (allPlans.length <= 1) return null

    return (
      <HStack
        style={{
          justifyContent: 'center',
          gap: 8,

          marginBottom: 8,
        }}
      >
        {allPlans.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              carouselRef.current?.scrollTo({ index, animated: true })
            }}
            style={{ padding: 8 }}
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

  const handleRecharge = async (plan: AdditionalPlan) => {
    if (!msisdn) {
      Alert.alert(
        'Erro',
        'Número de telefone não encontrado. Entre em contato com o suporte.',
      )
      return
    }

    if (!user?.token) {
      Alert.alert('Erro', 'Usuário não autenticado.')
      return
    }

    try {
      Alert.alert(
        'Confirmar Recarga',
        `Deseja realizar a recarga adicional de:\n\n${
          plan.descricao
        }\nValor: R$ ${plan.value.replace('.', ',')}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: 'default',
            onPress: async () => {
              try {
                const payload = {
                  token: user.token,
                  planid_pers: plan.id,
                  msisdn: msisdn.startsWith('55') ? msisdn.slice(2) : msisdn,
                }

                const result = await additionalRecharge(payload).unwrap()

                Alert.alert(
                  'Sucesso! 🎉',
                  result.msg ||
                    'Recarga realizada! Aguarde alguns minutos para que ela seja efetuada.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onClose()
                        onSuccess?.(result.payid)
                      },
                    },
                  ],
                )
              } catch (error: any) {
                console.error('Erro ao realizar recarga:', error)

                // Tratamento específico para erro 590
                if (error.status === 590) {
                  Alert.alert(
                    'Atenção ⚠️',
                    'Não é possível gerar fatura para uma linha cancelada. Para mais informações procure o suporte.',
                    [{ text: 'OK' }],
                  )
                  return
                }

                Alert.alert(
                  'Erro ❌',
                  error.data?.msg || 'Erro ao realizar recarga adicional!',
                  [{ text: 'OK' }],
                )
              }
            },
          },
        ],
      )
    } catch (error) {
      console.error('Erro ao processar recarga:', error)
    }
  }

  // Renderizar backdrop customizado
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    [],
  )

  const handleRechargeSelected = () => {
    if (!selectedPlan) {
      Alert.alert('Atenção', 'Selecione um plano para continuar')
      return
    }
    handleRecharge(selectedPlan)
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.disabled }}
      handleStyle={{
        paddingVertical: 12,
      }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        {/* Header com handle visual para arrastar */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            // borderBottomWidth: 1,
            // borderBottomColor: colors.secondary + '20',
          }}
        >
          <HStack
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <VStack>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: colors.text,
                }}
              >
                Recarga Adicional
              </Text>
              {msisdn && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.secondary,
                    marginTop: 4,
                  }}
                >
                  Linha: {msisdn}
                </Text>
              )}
            </VStack>
          </HStack>
        </View>

        {/* Content */}
        <Box style={{ flex: 1 }}>
          {isLoading ? (
            <VStack
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: colors.secondary }}>
                Carregando planos...
              </Text>
            </VStack>
          ) : error ? (
            <VStack
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.error,
                  textAlign: 'center',
                }}
              >
                Erro ao carregar planos
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
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
              </TouchableOpacity>
            </VStack>
          ) : allPlans.length === 0 ? (
            <VStack
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.secondary,
                  textAlign: 'center',
                }}
              >
                Parece que não há planos de recarga adicional disponíveis no
                momento.
              </Text>
            </VStack>
          ) : (
            <Box style={{ flex: 1, justifyContent: 'center' }}>
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
          )}
        </Box>

        {/* Footer com botão de ação */}
        {allPlans.length > 0 && (
          <Box
            style={{
              padding: 16,
            }}
          >
            <TouchableOpacity
              onPress={handleRechargeSelected}
              disabled={!selectedPlan || isRecharging}
              style={{
                backgroundColor:
                  !selectedPlan || isRecharging
                    ? colors.disabled
                    : colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                elevation: selectedPlan && !isRecharging ? 4 : 0,
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
                  textAlign: 'center',
                }}
              >
                {isRecharging
                  ? 'Processando...'
                  : selectedPlan
                  ? 'Realizar Recarga Adicional'
                  : 'Selecione um Plano'}
              </Text>
            </TouchableOpacity>
          </Box>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
}

export default AdditionalRechargeBottomSheet
