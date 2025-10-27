// components/layout/ActivateLineBottomSheet.tsx
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import {
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  View,
  Keyboard,
} from 'react-native'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

import {
  useGetPlansQuery,
  useActivateLineMutation,
} from '@/src/api/endpoints/plansApi'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useAppSelector } from '@/src/store/hooks'
import { selectDet2Data } from '@/src/store/slices/det2Slice'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const CARD_WIDTH = screenWidth * 0.88
const CARD_HEIGHT = screenHeight * 0.48
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
    cardPadding: screenWidth * 0.04,
    sectionGap: screenHeight * 0.008,
  },
  appIcon: {
    size: (CARD_WIDTH - screenWidth * 0.16) / 3 - 6,
  },
}

interface Plan {
  id: number
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
  mostraApp?: boolean
  nivel?: number | null
  uniqueId?: string
  rede?: string
  productid?: string | null
  hlr_profile?: number | null
  valor_telecall?: string | null
}

interface ActivateLineBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  colors: any
  iccid?: string
  onSuccess?: () => void
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
            height: CARD_HEIGHT + 10,
            alignSelf: 'center',
          },
          animatedStyle,
        ]}
      >
        <Box
          style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: 20,
            borderWidth: isSelected ? 3 : 2,
            borderColor: isSelected ? colors.primary : colors.secondary + '20',
            padding: RESPONSIVE.spacing.cardPadding,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Gigas - Destaque Principal */}
          <VStack style={{ marginBottom: RESPONSIVE.spacing.sectionGap * 0.8 }}>
            <HStack
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
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
          <VStack style={{ marginBottom: RESPONSIVE.spacing.sectionGap * 0.8 }}>
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.benefits,
                color: colors.text,
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {plan.min === '999' ? 'Ligações ilimitadas' : plan.min}{' '}
              {plan.min !== '999' && 'Min'} • {plan.sms} SMS
            </Text>
          </VStack>

          {/* Apps Inclusos */}
          <VStack
            style={{
              marginBottom: RESPONSIVE.spacing.sectionGap * 0.8,
              flex: 1,
              minHeight: 0,
            }}
          >
            <Text
              style={{
                fontSize: RESPONSIVE.fontSize.appsTitle,
                fontWeight: '600',
                color: colors.text,
                marginBottom: RESPONSIVE.spacing.sectionGap * 0.1,
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
            style={{
              alignItems: 'center',
              marginTop: RESPONSIVE.spacing.sectionGap * 0.5,
            }}
          >
            <HStack
              style={{
                alignItems: 'baseline',
                justifyContent: 'center',
              }}
            >
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
        </Box>
      </TouchableOpacity>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.plan.planid === nextProps.plan.planid &&
      prevProps.isSelected === nextProps.isSelected
    )
  },
)

const ActivateLineBottomSheet: React.FC<ActivateLineBottomSheetProps> = ({
  isOpen,
  onClose,
  colors,
  iccid,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const carouselRef = useRef<ICarouselInstance>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)

  // Ref do BottomSheetModal
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  // Snap points do bottom sheet (85% da tela)
  const snapPoints = useMemo(() => ['85%'], [])

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

  const det2Data = useAppSelector(selectDet2Data)

  // Mostrar apenas planos personalizados com mostraApp: true
  const allPlans = React.useMemo(() => {
    if (!plansData) return []

    const personalizado = (plansData.personalizado || [])
      .filter((plan) => plan.mostraApp === true)
      .map((plan, index) => ({
        ...plan,
        uniqueId: `personalizado-${plan.planid}-${index}`,
      }))

    return personalizado
  }, [plansData])

  // Controlar abertura/fechamento do bottom sheet modal
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present()
    } else {
      Keyboard.dismiss()
      bottomSheetRef.current?.dismiss()
    }
  }, [isOpen])

  // Auto-selecionar primeiro plano quando os planos carregarem
  React.useEffect(() => {
    if (allPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(allPlans[0])
    }
  }, [allPlans, selectedPlan])

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
  }

  const renderPlanCard = useCallback(
    ({ item, animationValue }: { item: Plan; animationValue: any }) => {
      const handleSelect = () => setSelectedPlan(item)
      const isSelected = selectedPlan?.planid === item.planid

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
    [selectedPlan?.planid, colors],
  )

  const onProgressChange = (offsetProgress: number) => {
    progressValue.value = offsetProgress
  }

  const onSnapToItem = (index: number) => {
    setCurrentIndex(index)
    const newPlan = allPlans[index]
    if (newPlan && selectedPlan?.planid !== newPlan.planid) {
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
          marginBottom: 4,
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

  const msisdnRaw = det2Data?.msisdn ?? ''
  const digits = msisdnRaw.replace(/\D/g, '') // remove tudo que não é número
  const ddd = digits.slice(0, 2)

  const handleActivateLine = async () => {
    if (!selectedPlan) {
      Alert.alert('Atenção', 'Selecione um plano para continuar')
      return
    }

    if (!iccid) {
      Alert.alert(
        'Erro',
        'ICCID não encontrado. Entre em contato com o suporte.',
      )
      return
    }

    try {
      Alert.alert(
        'Confirmar Ativação',
        `Deseja ativar o plano de ${selectedPlan.gigas}GB por R$ ${selectedPlan.value}/mês?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: 'default',
            onPress: async () => {
              try {
                const payload = {
                  cpf: user?.cpf || '',
                  ddd: ddd,
                  iccid: iccid,
                  planid: selectedPlan.planid.toString(),
                  planid_personalizado: selectedPlan.id.toString(),
                  isApp: true,
                  pospago: false,
                  esim: false,
                  companyid: env.COMPANY_ID,
                  userInfo: JSON.stringify({
                    cpf: user?.cpf,
                    name: user?.name,
                    parceiro: user?.parceiro,
                  }),
                }

                const result = await activateLine(payload).unwrap()
                Alert.alert('Sucesso! 🎉', result.msg, [
                  {
                    text: 'OK',
                    onPress: () => {
                      onClose()
                      onSuccess?.()
                    },
                  },
                ])
              } catch (error: any) {
                Alert.alert(
                  'Erro ❌',
                  error.data?.msg || 'Erro ao ativar linha',
                  [{ text: 'OK' }],
                )
              }
            },
          },
        ],
      )
    } catch (error) {
      console.error('Erro ao processar ativação:', error)
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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        backgroundColor: colors.background,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.secondary,
        width: 40,
        height: 4,
      }}
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
            borderBottomWidth: 1,
            borderBottomColor: colors.secondary + '20',
          }}
        >
          {/* Área de arrastar visual */}
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 8,
              marginBottom: 8,
            }}
          ></View>

          <HStack
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              Escolha seu Plano
            </Text>
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
              }}
            >
              <Text style={{ fontSize: 16, color: colors.secondary }}>
                Nenhum plano disponível
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
              borderTopWidth: 1,
              borderTopColor: colors.secondary + '20',
            }}
          >
            <TouchableOpacity
              onPress={handleActivateLine}
              disabled={!selectedPlan || isActivating}
              style={{
                backgroundColor:
                  !selectedPlan || isActivating
                    ? colors.disabled
                    : colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                elevation: selectedPlan && !isActivating ? 4 : 0,
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
                {isActivating
                  ? 'Ativando linha...'
                  : selectedPlan
                  ? 'Ativar Linha'
                  : 'Selecione um Plano'}
              </Text>
            </TouchableOpacity>
          </Box>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

export default ActivateLineBottomSheet
