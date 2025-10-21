// components/layout/ActivateLineModal.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Modal,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  View,
  Keyboard,
} from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { ScrollView } from '@/components/ui/scroll-view'
import { ChevronLeft } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetPlansQuery,
  useActivateLineMutation,
  type PlanPersonalizado,
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
import { listaDdd } from '@/utils/listaDdd'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')
const CARD_WIDTH = screenWidth * 0.88
const CARD_HEIGHT = screenHeight * 0.58
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
  planid: number | string
  description: string // ✅ API usa 'description'
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
  uniqueId?: string // Key única para React
  rede?: string
  productid?: string | null
  hlr_profile?: number | null
  valor_telecall?: string | null
}

interface ActivateLineModalProps {
  visible: boolean
  onClose: () => void
  colors: any
  iccid?: string
  onSuccess?: () => void
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
              {plan.min} Minutos • {plan.sms} SMS
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
            style={{
              alignItems: 'center',
              marginTop: RESPONSIVE.spacing.sectionGap * 0.5,
            }}
          >
            <HStack
              style={{ alignItems: 'baseline', justifyContent: 'center' }}
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
    // Só re-renderizar se planid ou isSelected mudarem
    return (
      prevProps.plan.planid === nextProps.plan.planid &&
      prevProps.isSelected === nextProps.isSelected
    )
  },
)

const ActivateLineModal: React.FC<ActivateLineModalProps> = ({
  visible,
  onClose,
  colors,
  iccid,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<PlanPersonalizado | null>(
    null,
  )
  const [selectedDdd, setSelectedDdd] = useState<string>('')
  const [showDddSelection, setShowDddSelection] = useState(true)
  const carouselRef = useRef<ICarouselInstance>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)

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

  // Mostrar apenas planos personalizados com mostraApp: true
  const allPlans = React.useMemo(() => {
    if (!plansData) return []

    const personalizado = (plansData.personalizado || [])
      .filter((plan) => plan.mostraApp === true)
      .map((plan, index) => ({
        ...plan,
        uniqueId: `personalizado-${plan.planid}-${index}`, // Key única
      }))

    return personalizado
  }, [plansData])

  // Auto-selecionar primeiro plano quando os planos carregarem
  React.useEffect(() => {
    if (allPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(allPlans[0])
    }
  }, [allPlans, selectedPlan])

  // Controlar abertura/fechamento do modal
  useEffect(() => {
    if (!visible) {
      Keyboard.dismiss()
      // Reset states quando fechar
      setShowDddSelection(true)
      setSelectedDdd('')
      setSelectedPlan(null)
    }
  }, [visible])

  // const handleSelectPlan = (plan: Plan) => {
  //   setSelectedPlan(plan)
  // }

  const renderPlanCard = useCallback(
    ({
      item,
      animationValue,
    }: {
      item: PlanPersonalizado
      animationValue: any
    }) => {
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
    // Auto-selecionar apenas quando o index mudar
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
          marginTop: 8,
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

  const handleActivateLine = async () => {
    if (!selectedPlan) {
      Alert.alert('Atenção', 'Selecione um plano para continuar')
      return
    }

    if (!selectedDdd) {
      Alert.alert('Atenção', 'Selecione um DDD para continuar')
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
        `Deseja ativar o plano de ${selectedPlan.gigas}GB por R$ ${selectedPlan.value}/mês com DDD ${selectedDdd}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            style: 'default',
            onPress: async () => {
              const payload = {
                cpf: user?.cpf || '',
                ddd: selectedDdd,
                iccid: iccid,
                planid: selectedPlan.planid.toString(),
                planid_personalizado: selectedPlan.id.toString(), // ✅ Envia o planid como personalizado
                isApp: true,
                pospago: 'false', // ✅ Mudado de 'N' para 'false'
                userInfo: JSON.stringify({
                  cpf: user?.cpf,
                  name: user?.name,
                  parceiro: user?.parceiro,
                }),
              }

              // Debug visual - mostra o payload na tela
              Alert.alert(
                '🔍 Debug - Payload (Modal)',
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
                                Alert.alert('Sucesso! 🎉', result.msg, [
                                  {
                                    text: 'OK',
                                    onPress: () => {
                                      onClose()
                                      onSuccess?.()
                                    },
                                  },
                                ])
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
                                  [{ text: 'OK' }],
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
      console.error('Erro ao processar ativação:', error)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Box
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <Box
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '85%',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          }}
        >
          {/* Header */}
          <HStack
            style={{
              padding: 16,
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: colors.secondary + '20',
            }}
          >
            {!showDddSelection && (
              <TouchableOpacity
                onPress={() => setShowDddSelection(true)}
                style={{ padding: 4 }}
              >
                <Icon as={ChevronLeft} color={colors.text} size="xl" />
              </TouchableOpacity>
            )}
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
                flex: 1,
                textAlign: showDddSelection ? 'left' : 'center',
              }}
            >
              {showDddSelection ? 'Selecione o DDD' : 'Escolha seu Plano'}
            </Text>
          </HStack>

          {/* Content */}
          <Box style={{ flex: 1 }}>
            {showDddSelection ? (
              <ScrollView style={{ flex: 1, padding: 16 }}>
                <VStack space="md">
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.subTitle,
                      marginBottom: 8,
                    }}
                  >
                    Escolha o código de área da linha
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    {listaDdd.map((ddd) => (
                      <TouchableOpacity
                        key={ddd}
                        onPress={() => setSelectedDdd(ddd)}
                        style={{
                          width: (screenWidth - 80) / 5,
                          aspectRatio: 1,
                          backgroundColor:
                            selectedDdd === ddd ? colors.primary : 'white',
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor:
                            selectedDdd === ddd
                              ? colors.primary
                              : colors.border,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: selectedDdd === ddd ? 'white' : colors.text,
                          }}
                        >
                          {ddd}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </VStack>
              </ScrollView>
            ) : isLoading ? (
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
                  height={CARD_HEIGHT + 40}
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
          <Box
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.secondary + '20',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (showDddSelection) {
                  if (selectedDdd) {
                    setShowDddSelection(false)
                  } else {
                    Alert.alert('Atenção', 'Selecione um DDD para continuar')
                  }
                } else {
                  handleActivateLine()
                }
              }}
              disabled={
                showDddSelection ? !selectedDdd : !selectedPlan || isActivating
              }
              style={{
                backgroundColor: showDddSelection
                  ? selectedDdd
                    ? colors.primary
                    : colors.disabled
                  : !selectedPlan || isActivating
                  ? colors.disabled
                  : colors.primary,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                elevation: (
                  showDddSelection ? selectedDdd : selectedPlan && !isActivating
                )
                  ? 4
                  : 0,
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
                {showDddSelection
                  ? selectedDdd
                    ? 'Continuar'
                    : 'Selecione um DDD'
                  : isActivating
                  ? 'Ativando...'
                  : selectedPlan
                  ? 'Ativar Linha'
                  : 'Selecione um Plano'}
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

export default ActivateLineModal
