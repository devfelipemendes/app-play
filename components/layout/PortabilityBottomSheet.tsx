// components/layout/PortabilityBottomSheet.tsx
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import {
  TouchableOpacity,
  Alert,
  View,
  TextInput as RNTextInput,
  ActivityIndicator,
  Keyboard,
  Linking,
} from 'react-native'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { Text } from '@/components/ui/text'
import { Info } from 'lucide-react-native'
import { Icon } from '@/components/ui/icon'
import {
  useLazyGetPortabilityStatusQuery,
  useLazyGetOperadoraQuery,
  useRequestPortabilityMutation,
} from '@/src/api/endpoints/portabilityApi'
import { useAuth } from '@/hooks/useAuth'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet'
import Toast from 'react-native-toast-message'
import moment from 'moment'
import 'moment/locale/pt-br'

import { maskCelular } from '@/utils/masks'
import { useAppSelector } from '@/src/store/hooks'

moment.locale('pt-br')

interface PortabilityBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  colors: any
  msisdn: string // Número da linha atual
  codigoP?: string // Código de portabilidade (CP)
  tempMsisdn?: string // Número temporário durante portabilidade
  onSuccess?: () => void
}

const formatDate = (dateString: string) => {
  return moment(dateString, 'DD-MM-YYYY HH:mm:ss').format(
    'DD [de] MMMM [de] YYYY [às] HH:mm',
  )
}

const formatPhone = (phone: string) => {
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '')

  // Formata como (99) 99999-9999
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }

  return phone
}

const PortabilityBottomSheet: React.FC<PortabilityBottomSheetProps> = ({
  isOpen,
  onClose,
  colors,
  msisdn,
  codigoP,
  tempMsisdn,
  onSuccess,
}) => {
  const { user } = useAuth()
  const companyInfo = useAppSelector((state) => state.auth.companyInfo)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const phoneInputRef = useRef<RNTextInput>(null)

  const [numPort, setNumPort] = useState('')
  const [operadora, setOperadora] = useState({ name: '', cod: '' })

  const snapPoints = useMemo(() => ['85%'], [])

  // Queries e Mutations
  const [
    getPortabilityStatus,
    {
      data: portabilityStatus,
      isLoading: loadingStatus,
      isFetching: fetchingStatus,
    },
  ] = useLazyGetPortabilityStatusQuery()

  const [
    getOperadora,
    { isLoading: loadingOperadora, isFetching: fetchingOperadora },
  ] = useLazyGetOperadoraQuery()

  const [requestPortability, { isLoading: loadingRequest }] =
    useRequestPortabilityMutation()

  // Verificar se DDDs são iguais
  const currentDdd = msisdn?.replace(/\D/g, '').slice(0, 2) || ''
  const portDdd = numPort.replace(/\D/g, '').slice(0, 2) || ''
  const isSameDdd = currentDdd === portDdd

  // Função para abrir suporte
  const handleOpenSupport = async () => {
    const supportUrl = companyInfo?.link_chat || ''

    if (!supportUrl) {
      console.error('❌ Link de chat não configurado no companyInfo')
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Link de suporte não disponível',
      })
      return
    }

    try {
      const canOpen = await Linking.canOpenURL(supportUrl)
      if (canOpen) {
        await Linking.openURL(supportUrl)
      } else {
        console.error('Não foi possível abrir o URL de suporte:', supportUrl)
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível abrir o link de suporte',
        })
      }
    } catch (error) {
      console.error('Erro ao abrir chat de suporte:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível abrir o suporte',
      })
    }
  }

  // Buscar status da portabilidade ao abrir
  useEffect(() => {
    if (isOpen && tempMsisdn) {
      getPortabilityStatus({
        token: user?.token || '',
        codigoP: codigoP,
        msisdn: msisdn,
        msisdnOutraOperadora: tempMsisdn,
      })
    }
    // eslint-disable-next-line
  }, [isOpen, tempMsisdn, codigoP, msisdn, user?.token])

  // Buscar operadora quando número tiver 11 dígitos
  useEffect(() => {
    const cleanedNum = numPort.replace(/\D/g, '')
    if (cleanedNum.length === 11) {
      getOperadora({
        token: user?.token || '',
        phoneNumber: cleanedNum,
      })
        .unwrap()
        .then((response) => {
          setOperadora(response)
        })
        .catch((error) => {
          console.error('Erro ao buscar operadora:', error)
          Toast.show({
            type: 'error',
            text1: 'Erro ao buscar operadora',
            text2: 'Tente novamente',
          })
        })
    } else {
      setOperadora({ name: '', cod: '' })
    }
    // eslint-disable-next-line
  }, [numPort, user?.token])

  // Controlar abertura/fechamento
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand()
    } else {
      Keyboard.dismiss()
      bottomSheetRef.current?.close()
      setNumPort('')
      setOperadora({ name: '', cod: '' })
    }
  }, [isOpen])

  const handleRequestPortability = async () => {
    const cleanedNum = numPort.replace(/\D/g, '')

    if (cleanedNum.length !== 11) {
      Alert.alert('Atenção', 'Digite um número válido com 11 dígitos')
      return
    }

    if (!isSameDdd) {
      Alert.alert(
        'Atenção',
        'Os DDDs devem ser iguais para solicitar a portabilidade',
      )
      return
    }

    if (!operadora.cod) {
      Alert.alert('Atenção', 'Não foi possível identificar a operadora')
      return
    }

    // Confirmar solicitação
    const currentLineFormatted = msisdn
      ? formatPhone(msisdn.replace(/\D/g, '').slice(2))
      : 'linha atual'

    Alert.alert(
      'Confirmar Portabilidade',
      `Deseja portar o número ${formatPhone(
        cleanedNum,
      )} para a linha ${currentLineFormatted}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'default',
          onPress: async () => {
            try {
              const payload = {
                token: user?.token || '',
                msisdn: msisdn.replace(/\D/g, ''), // Remove 55
                pmsisdn: cleanedNum,
                operadora: operadora.cod.replace('55', '00'),
              }

              await requestPortability(payload).unwrap()

              Toast.show({
                type: 'success',
                text1: 'Portabilidade solicitada!',
                text2: 'Verifique suas mensagens para confirmar a solicitação.',
              })

              onClose()
              onSuccess?.()
            } catch (error: any) {
              console.error('Erro ao solicitar portabilidade:', error)

              // Verifica se é erro 88 (portabilidade duplicada)
              if (
                error.status === 400 &&
                error.data?.data?.portin?.erro === 88
              ) {
                Toast.show({
                  type: 'info',
                  text1: 'Portabilidade já solicitada',
                  text2:
                    'Já temos uma portabilidade solicitada para este número.',
                })
              } else if (error.status === 520) {
                Toast.show({
                  type: 'error',
                  text1: 'Solicitação Duplicada',
                  text2:
                    'Já existe uma solicitação de portabilidade para este número.',
                })
              } else if (error.status === 521) {
                Toast.show({
                  type: 'error',
                  text1: 'Número já existe',
                  text2:
                    'O número a portar já existe na base de clientes. Se acredita que isso é um erro, entre em contato com o suporte.',
                })
              } else {
                Toast.show({
                  type: 'error',
                  text1: 'Erro ao solicitar portabilidade',
                  text2: error.data?.message || 'Tente novamente mais tarde',
                })
              }
            }
          },
        },
      ],
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

  // Renderizar status de portabilidade em andamento
  const renderPortabilityInProgress = () => {
    if (
      !portabilityStatus ||
      portabilityStatus.PortabilityStatus !== 'PENDENTE'
    ) {
      return null
    }

    return (
      <BottomSheetScrollView style={{ flex: 1 }}>
        <VStack space="lg" style={{ paddingBottom: 20 }}>
          {/* Alert de portabilidade em andamento */}
          <View
            style={{
              backgroundColor: colors.info + '20',
              borderLeftWidth: 4,
              borderLeftColor: colors.info,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <Icon as={Info} color={colors.info} size="lg" />
              <Text
                style={{ fontSize: 16, fontWeight: '600', color: colors.info }}
              >
                Portabilidade em andamento
              </Text>
            </HStack>
          </View>

          {/* Informações da portabilidade */}
          <VStack space="md" style={{ paddingTop: 8 }}>
            <VStack space="xs">
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subTitle,
                  fontWeight: '500',
                }}
              >
                Número Novo
              </Text>
              <Text
                style={{ fontSize: 18, color: colors.text, fontWeight: '600' }}
              >
                {tempMsisdn && formatPhone(tempMsisdn.slice(2))}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subTitle,
                  fontWeight: '500',
                }}
              >
                Número Antigo
              </Text>
              <Text
                style={{ fontSize: 18, color: colors.text, fontWeight: '600' }}
              >
                {msisdn && formatPhone(msisdn.slice(2))}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subTitle,
                  fontWeight: '500',
                }}
              >
                Solicitado em
              </Text>
              <Text style={{ fontSize: 16, color: colors.text }}>
                {portabilityStatus.Criado &&
                  formatDate(portabilityStatus.Criado)}
              </Text>
            </VStack>

            <VStack space="xs">
              <Text
                style={{
                  fontSize: 12,
                  color: colors.subTitle,
                  fontWeight: '500',
                }}
              >
                Encerra em
              </Text>
              <Text style={{ fontSize: 16, color: colors.text }}>
                {portabilityStatus.JanelaPortabilidade &&
                  formatDate(portabilityStatus.JanelaPortabilidade)}
              </Text>
            </VStack>
          </VStack>

          {/* Link para suporte */}
          <TouchableOpacity
            style={{ paddingTop: 8 }}
            onPress={handleOpenSupport}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.primary,
                textAlign: 'center',
                textDecorationLine: 'underline',
              }}
            >
              Problemas com sua portabilidade?{'\n'}Entre em contato com nosso
              suporte.
            </Text>
          </TouchableOpacity>
        </VStack>
      </BottomSheetScrollView>
    )
  }

  const renderRequestForm = () => {
    const currentPhone = msisdn ? formatPhone(msisdn.replace(/\D/g, '')) : '-'

    return (
      <BottomSheetScrollView style={{ flex: 1 }}>
        <VStack space="lg" style={{ paddingBottom: 20 }}>
          <Text style={{ fontSize: 16, color: colors.text, fontWeight: '500' }}>
            Número atual: {maskCelular(currentPhone)}
          </Text>

          <VStack space="xs">
            <Text
              style={{
                fontSize: 14,
                color: colors.subTitle,
                fontWeight: '500',
              }}
            >
              Número a portar
            </Text>
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <RNTextInput
                  ref={phoneInputRef}
                  value={maskCelular(numPort)}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/\D/g, '')
                    setNumPort(cleaned)
                  }}
                  placeholder="99 99999-9999"
                  keyboardType="numeric"
                  maxLength={15}
                  style={{
                    borderWidth: 1,
                    borderColor:
                      numPort.length >= 2 && !isSameDdd
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
            </HStack>

            {operadora.name && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary,
                  fontWeight: '500',
                }}
              >
                Operadora: {operadora.name}
              </Text>
            )}

            {(loadingOperadora || fetchingOperadora) && (
              <HStack space="xs" style={{ alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: 12, color: colors.subTitle }}>
                  Buscando operadora...
                </Text>
              </HStack>
            )}

            {/* Erro de DDD diferente */}
            {numPort.length >= 2 && !isSameDdd && (
              <Text style={{ fontSize: 12, color: '#EF4444' }}>
                Os DDDs devem ser iguais para solicitar a portabilidade.
              </Text>
            )}
          </VStack>

          {/* Botão de solicitar */}
          <TouchableOpacity
            onPress={handleRequestPortability}
            disabled={
              loadingRequest ||
              numPort.replace(/\D/g, '').length !== 11 ||
              !operadora.cod ||
              !isSameDdd
            }
            style={{
              backgroundColor:
                numPort.replace(/\D/g, '').length === 11 &&
                operadora.cod &&
                isSameDdd
                  ? colors.primary
                  : colors.disabled,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 8,
              opacity: loadingRequest ? 0.6 : 1,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>
              {loadingRequest ? 'Solicitando...' : 'Solicitar Portabilidade'}
            </Text>
          </TouchableOpacity>

          {/* Link para suporte */}
          <TouchableOpacity
            style={{ paddingTop: 8 }}
            onPress={handleOpenSupport}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.primary,
                textAlign: 'center',
                textDecorationLine: 'underline',
              }}
            >
              Problemas com sua portabilidade?{'\n'}Entre em contato com nosso
              suporte.
            </Text>
          </TouchableOpacity>
        </VStack>
      </BottomSheetScrollView>
    )
  }

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
            Portabilidade
          </Text>
        </HStack>

        {/* Subtítulo */}
        <Text
          style={{
            fontSize: 14,
            color: colors.subTitle,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Realize uma solicitação de portabilidade
        </Text>

        {/* Loading status */}
        {(loadingStatus || fetchingStatus) && (
          <VStack
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ fontSize: 16, color: colors.text, marginTop: 16 }}>
              Verificando status...
            </Text>
          </VStack>
        )}

        {/* Conteúdo */}
        {!loadingStatus &&
          !fetchingStatus &&
          (portabilityStatus?.PortabilityStatus === 'PENDENTE'
            ? renderPortabilityInProgress()
            : renderRequestForm())}
      </BottomSheetView>
    </BottomSheet>
  )
}

export default PortabilityBottomSheet
