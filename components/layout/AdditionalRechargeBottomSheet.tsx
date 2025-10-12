// components/layout/AdditionalRechargeBottomSheet.tsx
import React, { useRef, useMemo, useEffect, useCallback } from 'react'
import { TouchableOpacity, Alert, View, Dimensions } from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { ScrollView } from '@/components/ui/scroll-view'
import { X } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useGetAdditionalPlansQuery,
  useAdditionalRechargeMutation,
} from '@/src/api/endpoints/plansApi'
import { useAuth } from '@/hooks/useAuth'
import { env } from '@/config/env'
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet'

const { height: screenHeight } = Dimensions.get('window')

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

const AdditionalRechargeBottomSheet: React.FC<
  AdditionalRechargeBottomSheetProps
> = ({ isOpen, onClose, colors, msisdn, onSuccess }) => {
  const { user } = useAuth()

  // Ref do BottomSheet
  const bottomSheetRef = useRef<BottomSheet>(null)

  // Snap points do bottom sheet (75% da tela)
  const snapPoints = useMemo(() => ['75%'], [])

  // Query para buscar planos adicionais
  const {
    data: plansData,
    isLoading,
    error,
    refetch,
  } = useGetAdditionalPlansQuery(
    {
      token: user?.token || '',
      parceiro: env.PARCEIRO || '',
    },
    {
      skip: !user?.token || !env.PARCEIRO, // Só executa se tiver token e parceiro
    },
  )

  // Mutation para realizar recarga adicional
  const [additionalRecharge, { isLoading: isRecharging }] =
    useAdditionalRechargeMutation()

  // Controlar abertura/fechamento do bottom sheet
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      bottomSheetRef.current?.close()
    }
  }, [isOpen])

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
        `Deseja realizar a recarga adicional de:\n\n${plan.descricao}\nValor: R$ ${plan.value.replace('.', ',')}?`,
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

  const allPlans = plansData?.personalizado || []

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
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.secondary + '40',
              }}
            />
          </View>

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
            <TouchableOpacity onPress={onClose}>
              <Icon as={X} size="lg" style={{ color: colors.secondary }} />
            </TouchableOpacity>
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
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {allPlans.map((plan, index) => (
                <TouchableOpacity
                  key={`${plan.id}-${index}`}
                  onPress={() => handleRecharge(plan)}
                  disabled={isRecharging}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: colors.secondary + '20',
                  }}
                  activeOpacity={0.7}
                >
                  <VStack space="sm">
                    {/* Título do plano */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: colors.text,
                      }}
                    >
                      {plan.descricao}
                    </Text>

                    {/* Separador */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: colors.secondary + '20',
                        marginVertical: 8,
                      }}
                    />

                    {/* Preço */}
                    <Text
                      style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                        color: colors.primary,
                      }}
                    >
                      R$ {plan.value.replace('.', ',')}
                    </Text>

                    {/* Informações adicionais */}
                    {(plan.gigas || plan.min || plan.sms) && (
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.secondary,
                          marginTop: 8,
                        }}
                      >
                        {plan.gigas && `${plan.gigas} GB`}
                        {plan.min && ` • ${plan.min} min`}
                        {plan.sms && ` • ${plan.sms} SMS`}
                      </Text>
                    )}

                    {/* Aviso */}
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.secondary,
                        textAlign: 'center',
                        marginTop: 12,
                        fontStyle: 'italic',
                      }}
                    >
                      *Só é possível realizar uma recarga adicional se o plano
                      estiver em dia.
                    </Text>

                    {/* Botão */}
                    <View
                      style={{
                        backgroundColor: colors.primary + '15',
                        paddingVertical: 12,
                        paddingHorizontal: 24,
                        borderRadius: 10,
                        alignItems: 'center',
                        marginTop: 8,
                        borderWidth: 1,
                        borderColor: colors.primary + '30',
                      }}
                    >
                      <Text
                        style={{
                          color: colors.primary,
                          fontSize: 14,
                          fontWeight: '600',
                        }}
                      >
                        {isRecharging
                          ? 'Processando...'
                          : 'Realizar recarga adicional'}
                      </Text>
                    </View>
                  </VStack>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Box>
      </BottomSheetView>
    </BottomSheet>
  )
}

export default AdditionalRechargeBottomSheet
