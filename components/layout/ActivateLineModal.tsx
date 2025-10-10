// components/layout/ActivateLineModal.tsx
import React, { useState } from 'react'
import { Modal, TouchableOpacity, Alert, Image, Dimensions } from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { ScrollView } from '@/components/ui/scroll-view'
import { X } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetPlansQuery,
  useActivateLineMutation,
} from '@/src/api/endpoints/plansApi'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'

const { width: screenWidth } = Dimensions.get('window')

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

const ActivateLineModal: React.FC<ActivateLineModalProps> = ({
  visible,
  onClose,
  colors,
  iccid,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  // Query para buscar planos
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetPlansQuery({
    companyId: env.COMPANY_ID,
  })

  // Mutation para ativar linha
  const [activateLine, { isLoading: isActivating }] = useActivateLineMutation()

  // Combinar planos originais e personalizados com ID único
  const allPlans = React.useMemo(() => {
    if (!plansData) return []

    const original = (plansData.Original || []).map((plan, index) => ({
      ...plan,
      uniqueId: `original-${plan.planid}-${index}`, // Key única
    }))

    const personalizado = (plansData.personalizado || []).map((plan, index) => ({
      ...plan,
      uniqueId: `personalizado-${plan.planid}-${index}`, // Key única
    }))

    return [...original, ...personalizado]
  }, [plansData])

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan)
  }

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
                  ddd: '', // Será gerado no backend
                  iccid: iccid,
                  planid: selectedPlan.planid.toString(),
                  planid_personalizado: '',
                  isApp: true,
                  pospago: 'N',
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
            maxHeight: '85%',
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
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              Escolha seu Plano
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size="lg" style={{ color: colors.secondary }} />
            </TouchableOpacity>
          </HStack>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <VStack
                style={{
                  padding: 40,
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
                  padding: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 16,
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
                  padding: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: colors.secondary }}>
                  Nenhum plano disponível
                </Text>
              </VStack>
            ) : (
              <VStack style={{ gap: 12 }}>
                {allPlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.uniqueId}
                    onPress={() => handleSelectPlan(plan)}
                    style={{
                      borderWidth: 2,
                      borderColor:
                        selectedPlan?.planid === plan.planid
                          ? colors.primary
                          : colors.secondary + '30',
                      borderRadius: 16,
                      padding: 16,
                      backgroundColor:
                        selectedPlan?.planid === plan.planid
                          ? colors.primary + '10'
                          : colors.background,
                    }}
                  >
                    <VStack style={{ gap: 12 }}>
                      {/* Header do plano */}
                      <HStack
                        style={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <HStack style={{ alignItems: 'baseline', gap: 4 }}>
                          <Text
                            style={{
                              fontSize: 32,
                              fontWeight: 'bold',
                              color: colors.primary,
                            }}
                          >
                            {plan.gigas}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: 'bold',
                              color: colors.primary,
                            }}
                          >
                            GB
                          </Text>
                        </HStack>

                        <VStack style={{ alignItems: 'flex-end' }}>
                          <HStack style={{ alignItems: 'baseline' }}>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.subTitle,
                                fontWeight: '500',
                              }}
                            >
                              R$
                            </Text>
                            <Text
                              style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: colors.text,
                                marginLeft: 2,
                              }}
                            >
                              {plan.value}
                            </Text>
                          </HStack>
                          <Text
                            style={{
                              fontSize: 12,
                              color: colors.subTitle,
                            }}
                          >
                            por mês
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Benefícios */}
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.secondary,
                          fontWeight: '500',
                        }}
                      >
                        {plan.min} Minutos • {plan.sms} SMS
                      </Text>

                      {/* Apps inclusos - grid compacto */}
                      <VStack style={{ gap: 8 }}>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: colors.text,
                          }}
                        >
                          Apps inclusos:
                        </Text>
                        <HStack
                          style={{
                            flexWrap: 'wrap',
                            gap: 6,
                          }}
                        >
                          {mockApps.slice(0, 6).map((app, index) => (
                            <Box
                              key={index}
                              style={{
                                width: 50,
                                height: 50,
                                borderRadius: 8,
                                backgroundColor: '#F8F9FA',
                                justifyContent: 'center',
                                alignItems: 'center',
                                elevation: 1,
                              }}
                            >
                              <Image
                                source={{ uri: app.icon }}
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: 4,
                                }}
                                resizeMode="cover"
                              />
                            </Box>
                          ))}
                        </HStack>
                      </VStack>
                    </VStack>
                  </TouchableOpacity>
                ))}
              </VStack>
            )}
          </ScrollView>

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
                    ? 'Ativando...'
                    : selectedPlan
                    ? 'Ativar Linha'
                    : 'Selecione um Plano'}
                </Text>
              </TouchableOpacity>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  )
}

export default ActivateLineModal
