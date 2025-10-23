// components/layout/ActivateLineBottomSheetWithSteps.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import {
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  TextInput as RNTextInput,
  Keyboard,
} from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { X, Check, ChevronLeft, Barcode } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetPlansQuery,
  useActivateLineMutation,
} from '@/src/api/endpoints/plansApi'
import { useChecaICCIDMutation } from '@/src/api/endpoints/checkIccid'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import Toast from 'react-native-toast-message'
import { listaDdd } from '@/utils/listaDdd'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'

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
  id: number // ✅ ID do plano personalizado
  planid: number | string
  description: string
  bundle: number | string
  value: string
  gigas: string
  min: string
  sms: string
  mostraApp?: boolean
  uniqueId?: string
}

interface ActivateLineBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  colors: any
  onSuccess?: () => void
}

// Mock de apps inclusos
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
]

// Steps do fluxo
enum ActivationStep {
  ICCID_INPUT = 'iccid',
  DDD_SELECT = 'ddd',
  PLAN_SELECT = 'plan',
  CONFIRMATION = 'confirmation',
}

const ActivateLineBottomSheet: React.FC<ActivateLineBottomSheetProps> = ({
  isOpen,
  onClose,
  colors,
  onSuccess,
}) => {
  const { user } = useAuth()
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const carouselRef = useRef<ICarouselInstance>(null)
  const iccidInputRef = useRef<RNTextInput>(null)

  // Camera permissions - NÃO usar hook na raiz
  // const [permission, requestPermission] = useCameraPermissions()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  // Estados do fluxo
  const [currentStep, setCurrentStep] = useState<ActivationStep>(
    ActivationStep.ICCID_INPUT,
  )
  const [formData, setFormData] = useState({ iccid: '', ddd: '' })
  const [isIccidValid, setIsIccidValid] = useState<boolean | null>(null)
  const [iccidNetwork, setIccidNetwork] = useState<string>('')
  const [showScanner, setShowScanner] = useState(false)

  // Estados do carousel de planos
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const snapPoints = useMemo(() => ['90%'], [])

  // Mutations e queries
  const [checkIccid, { isLoading: loadingIccid }] = useChecaICCIDMutation()
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()

  // Query de planos - só busca quando ICCID é válido
  const {
    data: plansData,
    isLoading: loadingPlans,
    error: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery(
    { companyid: env.COMPANY_ID },
    { skip: !isIccidValid || currentStep === ActivationStep.ICCID_INPUT },
  )

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

  // Auto-selecionar primeiro plano
  useEffect(() => {
    if (
      allPlans.length > 0 &&
      !selectedPlan &&
      currentStep === ActivationStep.PLAN_SELECT
    ) {
      setSelectedPlan(allPlans[0])
    }
  }, [allPlans, selectedPlan, currentStep])

  // Controlar abertura/fechamento
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.present()
      // Focar no input quando abrir
      setTimeout(() => iccidInputRef.current?.focus(), 300)
    } else {
      // Fechar teclado quando modal fechar
      Keyboard.dismiss()
      bottomSheetRef.current?.dismiss()
      // Reset state quando fechar
      setCurrentStep(ActivationStep.ICCID_INPUT)
      setFormData({ iccid: '', ddd: '' })
      setIsIccidValid(null)
      setSelectedPlan(null)
    }
  }, [isOpen])

  // Validar ICCID automaticamente com debounce
  useEffect(() => {
    if (formData.iccid.length >= 19 && formData.iccid.length <= 20) {
      // Adiciona um pequeno delay para garantir que o valor está estável
      const timeoutId = setTimeout(() => {
        handleValidateICCID()
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setIsIccidValid(null)
    }
  }, [formData.iccid])

  const handleValidateICCID = async () => {
    // Validação extra para garantir que o ICCID tem o tamanho correto
    if (
      !formData.iccid ||
      formData.iccid.length < 19 ||
      formData.iccid.length > 20
    ) {
      console.log(
        '❌ ICCID inválido (tamanho):',
        formData.iccid,
        'Length:',
        formData.iccid?.length,
      )
      return
    }

    console.log(
      '🔍 Validando ICCID:',
      formData.iccid,
      'CompanyID:',
      env.COMPANY_ID,
    )

    try {
      const result = await checkIccid({
        iccid: formData.iccid,
        companyid: env.COMPANY_ID,
      }).unwrap()

      console.log('✅ ICCID válido:', result)

      setIsIccidValid(true)
      setIccidNetwork(result.rede || '')

      Toast.show({
        type: 'success',
        text1: 'ICCID válido!',
        text2: `${result.descricao} - Rede: ${result.rede}`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao validar ICCID:', error)

      setIsIccidValid(false)
      setIccidNetwork('')

      // Mensagem específica para erro 404
      const errorMessage =
        error?.data?.detalhes ||
        error?.data?.erro ||
        error?.data?.message ||
        'Verifique o ICCID e tente novamente'

      Toast.show({
        type: 'error',
        text1:
          error?.status === 404 ? 'ICCID não encontrado' : 'ICCID inválido',
        text2: errorMessage,
      })
    }
  }

  const handleScanCode = ({ data }: { type: string; data: string }) => {
    const cleanedData = data.replace(/\D/g, '').trim()
    setFormData((prev) => ({ ...prev, iccid: cleanedData }))
    setShowScanner(false)
  }

  const getCameraPermissions = async () => {
    try {
      // Usa API direta da Camera ao invés do hook
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === 'granted')

      if (status === 'denied') {
        Toast.show({
          type: 'info',
          text1: 'Permissão de câmera negada',
          text2: 'Você pode habilitar nas configurações do dispositivo',
        })
        return false
      }

      return status === 'granted'
    } catch (error) {
      console.error('Erro ao solicitar permissão de câmera:', error)
      setHasPermission(false)
      return false
    }
  }

  const openScanner = async () => {
    // Solicita permissão e só abre se concedida
    const granted = await getCameraPermissions()

    if (granted) {
      setShowScanner(true)
    } else {
      Toast.show({
        type: 'error',
        text1: 'Permissão necessária',
        text2: 'Habilite a câmera nas configurações para escanear',
      })
    }
  }

  // Navegar para próximo step
  const handleNextStep = () => {
    if (currentStep === ActivationStep.ICCID_INPUT && isIccidValid) {
      setCurrentStep(ActivationStep.DDD_SELECT)
    } else if (currentStep === ActivationStep.DDD_SELECT && formData.ddd) {
      setCurrentStep(ActivationStep.PLAN_SELECT)
    } else if (currentStep === ActivationStep.PLAN_SELECT && selectedPlan) {
      setCurrentStep(ActivationStep.CONFIRMATION)
    }
  }

  // Voltar step
  const handleBackStep = () => {
    if (currentStep === ActivationStep.DDD_SELECT) {
      setCurrentStep(ActivationStep.ICCID_INPUT)
    } else if (currentStep === ActivationStep.PLAN_SELECT) {
      setCurrentStep(ActivationStep.DDD_SELECT)
    } else if (currentStep === ActivationStep.CONFIRMATION) {
      setCurrentStep(ActivationStep.PLAN_SELECT)
    }
  }

  // Ativar linha final
  const handleActivateLine = async () => {
    if (!selectedPlan || !formData.iccid || !formData.ddd) {
      Alert.alert('Atenção', 'Preencha todos os campos antes de continuar')
      return
    }

    try {
      const payload = {
        cpf: user?.cpf || '',
        ddd: formData.ddd,
        iccid: formData.iccid,
        planid: selectedPlan.planid.toString(),
        planid_personalizado: selectedPlan.id.toString(), // ✅ Usa o ID do plano personalizado
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

      console.log('🚀 Payload de ativação:', payload)
      console.log('👤 User:', user)
      console.log('📋 Selected Plan:', selectedPlan)

      const result = await activateLine(payload).unwrap()

      console.log('✅ Resultado da ativação:', result)

      Toast.show({
        type: 'success',
        text1: 'Linha Ativada! 🎉',
        text2:
          result.msg ||
          'Aguarde alguns minutos para o efetuamento da ativação.',
      })

      onClose()
      onSuccess?.()
    } catch (error: any) {
      console.error('Erro ao ativar linha:', error)

      if (error.status === 502) {
        Alert.alert('Erro', 'Este ICCID já está cadastrado no sistema!')
      } else {
        Alert.alert('Erro', error.data?.msg || 'Erro ao ativar linha')
      }
    }
  }

  // Renderizar carousel - versão simplificada sem animações Reanimated
  const renderPlanCard = useCallback(
    ({ item }: { item: Plan }) => {
      const handleSelect = () => setSelectedPlan(item)
      const isSelected = selectedPlan?.planid === item.planid

      return (
        <View
          style={{
            width: screenWidth - 40,
            height: CARD_HEIGHT,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            onPress={handleSelect}
            activeOpacity={0.9}
            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
          >
            <Box
              style={{
                flex: 1,
                backgroundColor: 'white',
                borderRadius: 20,
                borderWidth: isSelected ? 3 : 2,
                borderColor: isSelected
                  ? colors.primary
                  : colors.secondary + '20',
                padding: RESPONSIVE.spacing.cardPadding,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {/* Gigas */}
              <VStack
                style={{ marginBottom: RESPONSIVE.spacing.sectionGap * 0.8 }}
              >
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
                    {item.gigas}
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
              <VStack
                style={{ marginBottom: RESPONSIVE.spacing.sectionGap * 0.8 }}
              >
                <Text
                  style={{
                    fontSize: RESPONSIVE.fontSize.benefits,
                    color: colors.text,
                    fontWeight: '500',
                    textAlign: 'center',
                  }}
                >
                  {item.min} Minutos • {item.sms} SMS
                </Text>
              </VStack>

              {/* Apps */}
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
                        style={{
                          fontSize: RESPONSIVE.fontSize.benefits * 0.65,
                        }}
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
                    {item.value}
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
        </View>
      )
    },
    [selectedPlan?.planid, colors],
  )

  const onSnapToItem = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      const newPlan = allPlans[index]
      if (newPlan && selectedPlan?.planid !== newPlan.planid) {
        setSelectedPlan(newPlan)
      }
    },
    [allPlans, selectedPlan?.planid],
  )

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

  // Renderizar cada step
  const renderStepContent = () => {
    switch (currentStep) {
      case ActivationStep.ICCID_INPUT:
        return (
          <VStack space="lg" style={{ flex: 1 }}>
            <VStack space="sm">
              <Text
                style={{ fontSize: 18, fontWeight: '600', color: colors.text }}
              >
                Digite o ICCID do chip
              </Text>
              <Text style={{ fontSize: 14, color: colors.subTitle }}>
                O ICCID é o número de 19-20 dígitos do chip
              </Text>
            </VStack>

            {/* Scanner de código */}
            {showScanner ? (
              <View
                style={{
                  height: 400,
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 4,
                  borderColor: colors.primary,
                  backgroundColor: 'black',
                }}
              >
                {/* Linha horizontal de scan (igual FormCad) */}
                <View
                  style={{
                    zIndex: 1,
                    position: 'absolute',
                    top: '50%',
                    width: '80%',
                    height: 2,
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 5,
                    alignSelf: 'center',
                  }}
                />

                <CameraView
                  style={{
                    position: 'absolute',
                    height: screenHeight,
                    width: screenWidth,
                  }}
                  onBarcodeScanned={showScanner ? handleScanCode : undefined}
                  barcodeScannerSettings={{
                    barcodeTypes: ['code128', 'code39', 'ean13'],
                  }}
                />

                {/* Texto instrucional */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 50,
                    alignSelf: 'center',
                    zIndex: 2,
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 16,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                    }}
                  >
                    Aponte para o código de barras do chip
                  </Text>
                </View>
              </View>
            ) : (
              <VStack space="md">
                {/* Input ICCID */}
                <HStack space="sm">
                  <View style={{ flex: 1 }}>
                    <RNTextInput
                      ref={iccidInputRef}
                      value={formData.iccid}
                      onChangeText={(text) =>
                        setFormData((prev) => ({
                          ...prev,
                          iccid: text.replace(/\D/g, ''),
                        }))
                      }
                      placeholder="Digite o ICCID"
                      keyboardType="numeric"
                      maxLength={20}
                      style={{
                        borderWidth: 1,
                        borderColor:
                          isIccidValid === true
                            ? '#10B981'
                            : isIccidValid === false
                            ? '#EF4444'
                            : colors.border,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 14,
                        fontSize: 16,
                        backgroundColor: 'white',
                      }}
                    />
                  </View>

                  {/* Botão scanner */}
                  <TouchableOpacity
                    onPress={openScanner}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Icon as={Barcode} color="white" size="xl" />
                  </TouchableOpacity>
                </HStack>

                {/* Status da validação */}
                {loadingIccid && (
                  <Text style={{ fontSize: 14, color: colors.primary }}>
                    Validando ICCID...
                  </Text>
                )}
                {isIccidValid === true && (
                  <HStack space="xs" style={{ alignItems: 'center' }}>
                    <Icon as={Check} color="#10B981" size="sm" />
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#10B981',
                        fontWeight: '500',
                      }}
                    >
                      ICCID válido!
                    </Text>
                  </HStack>
                )}
              </VStack>
            )}
          </VStack>
        )

      case ActivationStep.DDD_SELECT:
        return (
          <BottomSheetScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={true}
          >
            <VStack space="lg">
              <VStack space="sm">
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  Selecione o DDD
                </Text>
                <Text style={{ fontSize: 14, color: colors.subTitle }}>
                  Escolha o código de área da linha
                </Text>
              </VStack>

              {/* Grid de DDDs */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 10,
                  paddingBottom: 20,
                }}
              >
                {listaDdd.map((ddd) => (
                  <TouchableOpacity
                    key={ddd}
                    onPress={() => setFormData((prev) => ({ ...prev, ddd }))}
                    style={{
                      width: (screenWidth - 80) / 5,
                      aspectRatio: 1,
                      backgroundColor:
                        formData.ddd === ddd ? colors.primary : 'white',
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor:
                        formData.ddd === ddd ? colors.primary : colors.border,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: formData.ddd === ddd ? 'white' : colors.text,
                      }}
                    >
                      {ddd}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </VStack>
          </BottomSheetScrollView>
        )

      case ActivationStep.PLAN_SELECT:
        if (loadingPlans) {
          return (
            <VStack
              space="lg"
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
          )
        }

        if (allPlans.length === 0) {
          return (
            <VStack
              space="lg"
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>
                Nenhum plano disponível
              </Text>
            </VStack>
          )
        }

        return (
          <VStack space="md" style={{ flex: 1 }}>
            <VStack space="sm">
              <Text
                style={{ fontSize: 18, fontWeight: '600', color: colors.text }}
              >
                Escolha seu plano
              </Text>
              <Text style={{ fontSize: 14, color: colors.subTitle }}>
                Selecione o plano que mais combina com você
              </Text>
            </VStack>

            {/* Carousel de planos - versão compatível com BottomSheet */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Carousel
                ref={carouselRef}
                loop={false}
                width={screenWidth - 40}
                height={CARD_HEIGHT + 40}
                data={allPlans}
                renderItem={renderPlanCard}
                onSnapToItem={onSnapToItem}
                windowSize={2}
                style={{ width: screenWidth - 40 }}
              />
              {renderDots()}
            </View>
          </VStack>
        )

      case ActivationStep.CONFIRMATION:
        return (
          <BottomSheetScrollView style={{ flex: 1 }}>
            <VStack space="lg">
              <VStack space="sm">
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  Confirme os dados
                </Text>
                <Text style={{ fontSize: 14, color: colors.subTitle }}>
                  Revise as informações antes de ativar
                </Text>
              </VStack>

              {/* Card de confirmação */}
              <VStack
                space="md"
                style={{
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {/* ICCID */}
                <VStack space="xs">
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.subTitle,
                      fontWeight: '500',
                    }}
                  >
                    ICCID
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {formData.iccid}
                  </Text>
                </VStack>

                {/* DDD */}
                <VStack space="xs">
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.subTitle,
                      fontWeight: '500',
                    }}
                  >
                    DDD
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {formData.ddd}
                  </Text>
                </VStack>

                {/* Plano */}
                {selectedPlan && (
                  <VStack space="xs">
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.subTitle,
                        fontWeight: '500',
                      }}
                    >
                      Plano Selecionado
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color: colors.text,
                        fontWeight: '600',
                      }}
                    >
                      {selectedPlan.gigas}GB por R$ {selectedPlan.value}/mês
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.subTitle }}>
                      {selectedPlan.min} Minutos • {selectedPlan.sms} SMS
                    </Text>
                  </VStack>
                )}

                {/* Usuário */}
                <VStack space="xs">
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.subTitle,
                      fontWeight: '500',
                    }}
                  >
                    Usuário
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      fontWeight: '600',
                    }}
                  >
                    {user?.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.subTitle }}>
                    CPF: {user?.cpf}
                  </Text>
                </VStack>
              </VStack>

              {/* Aviso */}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subTitle,
                  textAlign: 'center',
                }}
              >
                Ao confirmar, você concorda com os termos de serviço
              </Text>
            </VStack>
          </BottomSheetScrollView>
        )

      default:
        return null
    }
  }

  // Título do step atual
  const getStepTitle = () => {
    switch (currentStep) {
      case ActivationStep.ICCID_INPUT:
        return 'Passo 1 de 4'
      case ActivationStep.DDD_SELECT:
        return 'Passo 2 de 4'
      case ActivationStep.PLAN_SELECT:
        return 'Passo 3 de 4'
      case ActivationStep.CONFIRMATION:
        return 'Passo 4 de 4'
      default:
        return ''
    }
  }

  // Verificar se pode avançar
  const canGoNext = () => {
    switch (currentStep) {
      case ActivationStep.ICCID_INPUT:
        return isIccidValid === true
      case ActivationStep.DDD_SELECT:
        return formData.ddd !== ''
      case ActivationStep.PLAN_SELECT:
        return selectedPlan !== null
      default:
        return false
    }
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.background }}
      handleIndicatorStyle={{ backgroundColor: colors.disabled }}
      enableContentPanningGesture={true}
      enableOverDrag={false}
      activeOffsetY={[-5, 5]}
    >
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Header */}
        <HStack
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          {/* Botão voltar */}
          {currentStep !== ActivationStep.ICCID_INPUT && (
            <TouchableOpacity onPress={handleBackStep} style={{ padding: 4 }}>
              <Icon as={ChevronLeft} color={colors.text} size="xl" />
            </TouchableOpacity>
          )}

          {/* Título */}
          <VStack style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: colors.subTitle }}>
              {getStepTitle()}
            </Text>
            <Text
              style={{ fontSize: 18, fontWeight: '600', color: colors.text }}
            >
              Ativar Linha
            </Text>
          </VStack>

          {/* Botão fechar */}
        </HStack>

        {/* Indicador de progresso */}
        <HStack
          space="xs"
          style={{
            marginTop: 16,
            marginBottom: 16,
          }}
        >
          {[
            ActivationStep.ICCID_INPUT,
            ActivationStep.DDD_SELECT,
            ActivationStep.PLAN_SELECT,
            ActivationStep.CONFIRMATION,
          ].map((step, index) => {
            const isActive =
              Object.values(ActivationStep).indexOf(currentStep) >= index
            return (
              <View
                key={step}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: isActive ? colors.primary : colors.disabled,
                }}
              />
            )
          })}
        </HStack>

        {/* Conteúdo do step */}
        <View style={{ flex: 1, paddingTop: 8 }}>{renderStepContent()}</View>

        {/* Footer com botões */}
        {!showScanner && (
          <VStack
            space="sm"
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {currentStep === ActivationStep.CONFIRMATION ? (
              <TouchableOpacity
                onPress={handleActivateLine}
                disabled={isActivating}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: isActivating ? 0.6 : 1,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', color: 'white' }}
                >
                  {isActivating ? 'Ativando...' : 'Confirmar Ativação'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleNextStep}
                disabled={!canGoNext()}
                style={{
                  backgroundColor: canGoNext()
                    ? colors.primary
                    : colors.disabled,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: '600', color: 'white' }}
                >
                  Continuar
                </Text>
              </TouchableOpacity>
            )}
          </VStack>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

export default ActivateLineBottomSheet
