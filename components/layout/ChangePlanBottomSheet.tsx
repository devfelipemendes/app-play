// components/layout/ChangePlanBottomSheet.tsx
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
import { X, Check } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetPlansQuery,
  useChangePlanMutation,
} from '@/src/api/endpoints/plansApi'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import Toast from 'react-native-toast-message'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

// Dimensões do card do carousel
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
  planid: number | string
  description: string
  bundle: number | string
  value: string
  gigas: string
  min: string
  sms: string
  mostraApp?: boolean
  descricao_infiniti?: string
  uniqueId?: string
  id?: number | string
}

interface ChangePlanBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  colors: any
  msisdn: string // Número da linha para alterar o plano
  currentPlanId?: string // ID do plano atual (opcional)
  onSuccess?: (fatura?: string) => void
}

// Mock de apps inclusos
const mockApps = [
  { name: 'WhatsApp' },
  { name: 'Instagram' },
  { name: 'YouTube' },
]

// Componente do Card do Plano
interface PlanCardProps {
  plan: Plan
  animationValue: any
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
  colors: any
}

const PlanCard: React.FC<PlanCardProps> = React.memo(
  ({ plan, animationValue, isSelected, isCurrent, onSelect, colors }) => {
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
      return { transform: [{ scale }], opacity }
    })

    return (
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.9}
        disabled={isCurrent}
        style={[
          { width: CARD_WIDTH, height: CARD_HEIGHT, alignSelf: 'center' },
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
            opacity: isCurrent ? 0.6 : 1,
          }}
        >
          {/* Badge do plano atual */}
          {isCurrent && (
            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 6,
                zIndex: 1,
              }}
            >
              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                Plano Atual
              </Text>
            </View>
          )}

          {/* Gigas */}
          <VStack style={{ marginBottom: RESPONSIVE.spacing.sectionGap * 0.8 }}>
            <HStack
              style={{ alignItems: 'baseline', justifyContent: 'center' }}
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

          {/* Apps */}
          {!plan.descricao_infiniti?.startsWith('(M2M)') && (
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
                  gap: 6,
                }}
              >
                {mockApps.map((app, index) => (
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
                    <Text
                      style={{ fontSize: RESPONSIVE.fontSize.benefits * 0.65 }}
                    >
                      {app.name}
                    </Text>
                  </View>
                ))}
              </View>
            </VStack>
          )}

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
    return (
      prevProps.plan.planid === nextProps.plan.planid &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isCurrent === nextProps.isCurrent
    )
  },
)

const ChangePlanBottomSheet: React.FC<ChangePlanBottomSheetProps> = ({
  isOpen,
  onClose,
  colors,
  msisdn,
  currentPlanId,
  onSuccess,
}) => {
  const { user } = useAuth()
  const bottomSheetRef = useRef<BottomSheet>(null)
  const carouselRef = useRef<ICarouselInstance>(null)

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const progressValue = useSharedValue<number>(0)

  const snapPoints = useMemo(() => ['80%'], [])

  // Mutation para alterar plano
  const [changePlan, { isLoading: isChanging }] = useChangePlanMutation()

  // Query de planos
  const {
    data: plansData,
    isLoading: loadingPlans,
    error: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery({ companyid: env.COMPANY_ID }, { skip: !isOpen })

  // Tipagem explícita para o erro
  const hasPlansError = Boolean(plansError)

  const allPlans = React.useMemo(() => {
    if (!plansData) return []
    const personalizado = (plansData.personalizado || [])
      .filter((plan: any) => plan.mostraApp === true)
      .map((plan: any, index) => ({
        ...plan,
        uniqueId: `personalizado-${plan.planid}-${index}`,
        // Adiciona propriedade id baseada no planid se não existir
        id: plan.id || plan.planid,
      }))
    return personalizado
  }, [plansData])

  // Auto-selecionar primeiro plano (que não seja o atual)
  useEffect(() => {
    if (allPlans.length > 0 && !selectedPlan) {
      const firstNonCurrentPlan = allPlans.find(
        (plan) => plan.id?.toString() !== currentPlanId,
      )
      setSelectedPlan(firstNonCurrentPlan || allPlans[0])
    }
  }, [allPlans, selectedPlan, currentPlanId])

  // Controlar abertura/fechamento
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      Keyboard.dismiss()
      bottomSheetRef.current?.close()
      setSelectedPlan(null)
    }
  }, [isOpen])

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      Alert.alert('Atenção', 'Selecione um plano antes de continuar')
      return
    }

    // Verificar se é o plano atual
    if (selectedPlan.id?.toString() === currentPlanId) {
      Alert.alert('Atenção', 'Este já é o seu plano atual')
      return
    }

    // Confirmar alteração
    Alert.alert(
      'Confirmar Alteração',
      `Deseja alterar para o plano de ${selectedPlan.gigas}GB por R$ ${selectedPlan.value}/mês?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              const payload = {
                token: user?.token || '',
                planid: selectedPlan.planid,
                planid_personalizado: selectedPlan.id?.toString() || '',
                msisdn: msisdn.replace(/\D/g, '').slice(2), // Remove formatação e DDD (55)
              }

              const result = await changePlan(payload).unwrap()

              Toast.show({
                type: 'success',
                text1: 'Plano alterado!',
                text2: 'Aguarde alguns minutos para a conclusão da alteração.',
              })

              onClose()
              onSuccess?.(result.fatura)
            } catch (error: any) {
              console.error('Erro ao alterar plano:', error)

              if (error.status === 590) {
                Toast.show({
                  type: 'warning',
                  text1: 'Linha Cancelada',
                  text2:
                    'Não é possível alterar o plano de uma linha cancelada. Procure o suporte.',
                })
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erro ao alterar plano',
                  text2: error.data?.msg || 'Tente novamente mais tarde',
                })
              }
            }
          },
        },
      ],
    )
  }

  // Renderizar carousel
  const renderPlanCard = useCallback(
    ({ item, animationValue }: { item: Plan; animationValue: any }) => {
      const handleSelect = () => setSelectedPlan(item)
      const isSelected = selectedPlan?.planid === item.planid
      const isCurrent = item.id?.toString() === currentPlanId
      return (
        <PlanCard
          plan={item}
          animationValue={animationValue}
          isSelected={isSelected}
          isCurrent={isCurrent}
          onSelect={handleSelect}
          colors={colors}
        />
      )
    },
    [selectedPlan?.planid, currentPlanId, colors],
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
          marginTop: 8,
          marginBottom: 4,
        }}
      >
        {allPlans.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              carouselRef.current?.scrollTo({ index, animated: true })
            }
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
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      index={-1}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.disabled }}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <HStack
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}
          >
            Alterar Plano
          </Text>
        </HStack>

        {loadingPlans && (
          <VStack
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>
              Carregando planos...
            </Text>
          </VStack>
        )}

        {/* Erro */}
        {hasPlansError && (
          <VStack
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <Text
              style={{ fontSize: 16, color: colors.error, textAlign: 'center' }}
            >
              Erro ao carregar planos
            </Text>
            <TouchableOpacity
              onPress={() => refetchPlans()}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Tentar Novamente
              </Text>
            </TouchableOpacity>
          </VStack>
        )}

        {/* Planos vazios */}
        {!loadingPlans && !hasPlansError && allPlans.length === 0 && (
          <VStack
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>
              Nenhum plano disponível
            </Text>
          </VStack>
        )}

        {/* Carousel de planos */}
        {!loadingPlans && !hasPlansError && allPlans.length > 0 && (
          <>
            <View style={{ flex: 1, alignItems: 'center' }}>
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
                style={{ width: screenWidth }}
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                  parallaxAdjacentItemScale: 0.8,
                }}
              />
              {renderDots()}
            </View>

            {/* Footer com botão */}
            <VStack style={{ paddingTop: 16, paddingBottom: 16 }}>
              <TouchableOpacity
                onPress={handleChangePlan}
                disabled={
                  isChanging ||
                  !selectedPlan ||
                  selectedPlan.id?.toString() === currentPlanId
                }
                style={{
                  backgroundColor:
                    !selectedPlan ||
                    selectedPlan.id?.toString() === currentPlanId
                      ? colors.disabled
                      : colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: isChanging ? 0.6 : 1,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', color: 'white' }}
                >
                  {isChanging ? 'Alterando...' : 'Alterar Plano'}
                </Text>
              </TouchableOpacity>
            </VStack>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  )
}

export default ChangePlanBottomSheet
