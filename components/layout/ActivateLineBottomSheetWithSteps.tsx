// components/layout/ActivateLineBottomSheetWithSteps.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import {
  TouchableOpacity,
  Alert,
  View,
  Dimensions,
  TextInput as RNTextInput,
  Keyboard,
  Image,
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
import { Camera, CameraView } from 'expo-camera'
import { FaturaBottomSheet } from '@/src/components/screens/FaturaBottomSheet'
import {
  type FaturaDetalhada,
  useGetFaturaMutation,
} from '@/src/api/endpoints/faturaApi'

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

interface AppBenefit {
  name: string
  image: any // ImageSourcePropType
}
// Mock de apps inclusos
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
  const faturaBottomSheetRef = useRef<BottomSheetModal>(null)
  const carouselRef = useRef<ICarouselInstance>(null)
  const iccidInputRef = useRef<RNTextInput>(null)

  // Estados do fluxo
  const [currentStep, setCurrentStep] = useState<ActivationStep>(
    ActivationStep.ICCID_INPUT,
  )
  const [formData, setFormData] = useState({ iccid: '', ddd: '' })
  const [isIccidValid, setIsIccidValid] = useState<boolean | null>(null)

  const [showScanner, setShowScanner] = useState(false)

  // Estados do carousel de planos
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Estados da fatura
  const [faturaDetalhada, setFaturaDetalhada] =
    useState<FaturaDetalhada | null>(null)

  const snapPoints = useMemo(() => ['90%'], [])

  // Mutations e queries
  const [checkIccid, { isLoading: loadingIccid }] = useChecaICCIDMutation()
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()
  const [getFatura] = useGetFaturaMutation()

  // Query de planos - só busca quando ICCID é válido
  const { data: plansData, isLoading: loadingPlans } = useGetPlansQuery(
    { companyid: env.COMPANY_ID },
    { skip: !isIccidValid || currentStep === ActivationStep.ICCID_INPUT },
  )

  const allPlans = React.useMemo(() => {
    if (!plansData) return []
    const personalizado = (plansData.personalizado || [])
      .filter((plan) => plan.mostraApp === true)
      .sort((a, b) => {
        const gigasA = parseFloat(a.gigas) || 0
        const gigasB = parseFloat(b.gigas) || 0
        return gigasA - gigasB
      })
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
    // eslint-disable-next-line
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

      Toast.show({
        type: 'success',
        text1: 'ICCID válido!',
        text2: `${result.descricao} - Rede: ${result.rede}`,
      })
    } catch (error: any) {
      console.error('❌ Erro ao validar ICCID:', error)

      setIsIccidValid(false)

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

  const handleScanCode = ({ data, type }: { type: string; data: string }) => {
    console.log('📷 [SCANNER] Código detectado:', { type, data })

    // Prevenir múltiplos scans
    if (!showScanner) {
      console.log('⚠️ [SCANNER] Scanner já fechado, ignorando scan')
      return
    }

    const cleanedData = data.replace(/\D/g, '').trim()
    console.log('📷 [SCANNER] Código limpo:', cleanedData)

    if (cleanedData.length >= 18 && cleanedData.length <= 22) {
      setFormData((prev) => ({ ...prev, iccid: cleanedData }))
      setShowScanner(false)

      Toast.show({
        type: 'success',
        text1: 'Código escaneado!',
        text2: `ICCID: ${cleanedData}`,
      })
    } else {
      console.log('⚠️ [SCANNER] Tamanho inválido:', cleanedData.length)
      Toast.show({
        type: 'warning',
        text1: 'Código inválido',
        text2: 'O código do chip deve ter entre 18-22 dígitos',
      })
    }
  }

  const getCameraPermissions = async () => {
    try {
      console.log('📷 [CAMERA] Solicitando permissão...')

      // Primeiro verifica se já tem permissão
      const currentPermission = await Camera.getCameraPermissionsAsync()
      console.log('📷 [CAMERA] Permissão atual:', currentPermission.status)

      // Se não tem, solicita
      const { status } = await Camera.requestCameraPermissionsAsync()
      console.log('📷 [CAMERA] Permissão após solicitar:', status)

      if (status === 'denied') {
        Toast.show({
          type: 'info',
          text1: 'Permissão de câmera negada',
          text2: 'Você pode habilitar nas configurações do dispositivo',
        })
        return false
      }

      return status === 'granted'
    } catch (error: any) {
      console.error('❌ [CAMERA] Erro ao solicitar permissão:', error)
      console.error('❌ [CAMERA] Stack:', error?.stack)

      Toast.show({
        type: 'error',
        text1: 'Erro ao acessar câmera',
        text2:
          error?.message || 'Tente novamente ou digite o ICCID manualmente',
      })

      return false
    }
  }

  const openScanner = async () => {
    try {
      console.log('📷 [SCANNER] Abrindo scanner...')

      // Solicita permissão e só abre se concedida
      const granted = await getCameraPermissions()

      if (granted) {
        console.log('✅ [SCANNER] Permissão concedida, abrindo câmera')
        setShowScanner(true)
      } else {
        console.log('❌ [SCANNER] Permissão negada')
        Toast.show({
          type: 'error',
          text1: 'Permissão necessária',
          text2: 'Habilite a câmera nas configurações para escanear',
        })
      }
    } catch (error: any) {
      console.error('❌ [SCANNER] Erro ao abrir scanner:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro ao abrir câmera',
        text2: 'Digite o ICCID manualmente',
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

  // Função para fechar modal de fatura
  const handleCloseFatura = () => {
    // Primeiro fecha o modal de fatura
    faturaBottomSheetRef.current?.dismiss()

    // Aguarda um pouco antes de limpar e fechar modal principal
    setTimeout(() => {
      setFaturaDetalhada(null)
      onClose()
      onSuccess?.()
    }, 300)
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

      console.log('🚀 [ATIVAÇÃO_STEPS] Payload de ativação:', payload)

      const result = await activateLine(payload).unwrap()

      // 🔍 DEBUG: Log da resposta da ativação
      console.log(
        '📦 [ATIVAÇÃO_STEPS] Resposta completa:',
        JSON.stringify(result, null, 2),
      )
      console.log(
        '🎯 [ATIVAÇÃO_STEPS] result.fatura (paymentId):',
        result?.fatura,
      )

      // Se a resposta contém um paymentId, busca a fatura completa
      if (result?.fatura && typeof result.fatura === 'string') {
        console.log('✅ [ATIVAÇÃO_STEPS] PaymentId detectado:', result.fatura)
        console.log('🔄 [ATIVAÇÃO_STEPS] Buscando dados completos da fatura...')

        try {
          // Busca a fatura completa usando o paymentId
          const faturaCompleta = await getFatura({
            payid: result.fatura,
          }).unwrap()

          console.log('✅ [ATIVAÇÃO_STEPS] Fatura completa recebida!')
          console.log(
            '✅ [ATIVAÇÃO_STEPS] faturaCompleta.payment:',
            faturaCompleta.payment,
          )
          console.log('✅ [ATIVAÇÃO_STEPS] Campos importantes:', {
            id: faturaCompleta.id,
            payment: faturaCompleta.payment,
            value: faturaCompleta.value,
            status: faturaCompleta.status,
            dueDate: faturaCompleta.dueDate,
            barcode: faturaCompleta.barcode ? '✅ existe' : '❌ não existe',
            payload: faturaCompleta.payload ? '✅ existe' : '❌ não existe',
          })

          // Define a fatura completa no estado
          setFaturaDetalhada(faturaCompleta)

          console.log('🚀 [ATIVAÇÃO_STEPS] Abrindo modal de fatura...')

          // Fecha o modal de ativação primeiro
          bottomSheetRef.current?.dismiss()

          // Aguarda um pouco e abre o modal de fatura
          setTimeout(() => {
            faturaBottomSheetRef.current?.present()
          }, 400)
        } catch (faturaError: any) {
          console.error(
            '❌ [ATIVAÇÃO_STEPS] Erro ao buscar fatura:',
            faturaError,
          )
          Toast.show({
            type: 'error',
            text1: 'Erro ao carregar fatura',
            text2:
              faturaError?.data?.message ||
              'Não foi possível carregar os detalhes da fatura',
          })
          // Mesmo com erro na fatura, mostra sucesso e fecha
          Toast.show({
            type: 'success',
            text1: 'Linha Ativada! 🎉',
            text2: 'Aguarde alguns minutos para o efetuamento da ativação.',
          })
          onClose()
          onSuccess?.()
        }
      } else {
        console.log('ℹ️ [ATIVAÇÃO_STEPS] Nenhum paymentId retornado')
        // Se não tem fatura, mostra toast de sucesso
        Toast.show({
          type: 'success',
          text1: 'Linha Ativada! 🎉',
          text2:
            result.msg ||
            'Aguarde alguns minutos para o efetuamento da ativação.',
        })
        onClose()
        onSuccess?.()
      }
    } catch (error: any) {
      console.error('❌ [ATIVAÇÃO_STEPS] Erro ao ativar linha:', error)

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
                  facing="back"
                  onBarcodeScanned={showScanner ? handleScanCode : undefined}
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      'code128',
                      'code39',
                      'code93',
                      'ean13',
                      'ean8',
                      'itf14',
                      'upc_e',
                      'upc_a',
                      'codabar',
                      'qr',
                    ],
                  }}
                />

                {/* Botão fechar scanner */}
                <TouchableOpacity
                  onPress={() => setShowScanner(false)}
                  style={{
                    position: 'absolute',
                    top: 50,
                    right: 20,
                    zIndex: 3,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 30,
                    padding: 12,
                  }}
                >
                  <Icon as={X} size="lg" style={{ color: 'white' }} />
                </TouchableOpacity>

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
                  justifyContent: 'center',
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
    <>
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
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              style={{
                padding: 4,
                borderRadius: 20,
                backgroundColor: '#ffffff' + '40',
              }}
            >
              <Icon as={X} size="md" color={colors.disabled} />
            </TouchableOpacity>
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
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.disabled,
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

      {/* Modal de detalhes da fatura */}
      <FaturaBottomSheet
        ref={faturaBottomSheetRef}
        fatura={faturaDetalhada}
        onClose={handleCloseFatura}
      />
    </>
  )
}

export default ActivateLineBottomSheet
