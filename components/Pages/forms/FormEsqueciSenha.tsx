import React, { useState, useEffect, useRef } from 'react'
import { Alert, Pressable, View } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useRequestPasswordTokenMutation } from '@/src/api/endpoints/forgotPasswordApi'
import { mask, unMask } from 'remask'
import { User, ArrowLeft, Clock } from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'
import { useAppDispatch } from '@/src/store/hooks'
import {
  setMode,
  setCpf as setCpfGlobal,
} from '@/src/store/slices/screenFlowSlice'

export default function FormEsqueciSenha() {
  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  const [cpf, setCpf] = useState('')
  const [tipoEnvio, setTipoEnvio] = useState<'email' | 'sms' | 'whatsapp'>(
    'email',
  )
  const [countdown, setCountdown] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [requestToken, { isLoading }] = useRequestPasswordTokenMutation()

  // Limpar intervalo quando o componente desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Iniciar contagem regressiva
  const startCountdown = () => {
    setCountdown(300) // 5 minutos = 300 segundos

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Formatar tempo em MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleRequestToken = async () => {
    const cpfUnmasked = unMask(cpf)

    if (cpfUnmasked.length < 11) {
      Alert.alert('Erro', 'Por favor, informe um CPF/CNPJ válido')
      return
    }

    try {
      await requestToken({
        cpf: cpfUnmasked,
        tipoDeEnvio: tipoEnvio,
      }).unwrap()

      Alert.alert(
        'Token Solicitado',
        'Token enviado com sucesso! Verifique seu ' +
          (tipoEnvio === 'email'
            ? 'e-mail'
            : tipoEnvio === 'sms'
            ? 'SMS'
            : 'WhatsApp'),
        [
          {
            text: 'OK',
            onPress: () => {
              // Armazena o CPF no estado global para usar no próximo passo
              dispatch(setCpfGlobal(cpfUnmasked))
              dispatch(setMode('validarToken'))
            },
          },
        ],
      )
    } catch (error: any) {
      // Verifica se é o erro de "Aguarde 5 minutos"
      const errorData = error?.data?.data
      const errorStatus = error?.status || error?.data?.status
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        'Erro ao solicitar token. Tente novamente.'

      // Detecta erro 403 - Bloqueio por múltiplas tentativas
      if (errorStatus === 403) {
        Alert.alert(
          'Acesso Bloqueado',
          'Após várias tentativas, a alteração de senha foi bloqueada por segurança.\n\nPara desbloquear, entre em contato com a central de atendimento.',
          [{ text: 'OK' }],
        )
        return
      }

      // Detecta o erro específico de 5 minutos
      if (
        errorData?.codigo === 400 &&
        (errorData?.erro?.includes('5 minutos') ||
          errorData?.detalhes?.includes('5 minutos'))
      ) {
        // Inicia o contador de 5 minutos
        startCountdown()

        Alert.alert(
          'Aguarde para nova solicitação',
          errorData?.descricao ||
            'Aguarde 5 minutos para efetuar a próxima solicitação',
          [{ text: 'OK' }],
        )
      } else {
        Alert.alert('Erro', errorMessage)
      }
    }
  }

  return (
    <Box>
      <Box>
        <ArrowLeft
          color={colors.primary}
          onPress={() => dispatch(setMode('login'))}
        />
      </Box>

      {/* Header */}
      <Box style={{ marginBottom: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
          Esqueci Minha Senha
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: colors.subTitle }}
        >
          Informe como você quer receber seu token
        </Text>
      </Box>

      {/* Tipo de Envio */}
      <Box style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Como deseja receber o token?
        </Text>

        <View style={{ gap: 16 }}>
          {/* Email */}
          <Pressable
            onPress={() => setTipoEnvio('email')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor:
                  tipoEnvio === 'email' ? colors.primary : '#D1D5DB',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {tipoEnvio === 'email' && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: tipoEnvio === 'email' ? '600' : '400',
              }}
            >
              E-mail
            </Text>
          </Pressable>

          {/* SMS */}
          <Pressable
            onPress={() => setTipoEnvio('sms')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor:
                  tipoEnvio === 'sms' ? colors.primary : '#D1D5DB',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {tipoEnvio === 'sms' && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: tipoEnvio === 'sms' ? '600' : '400',
              }}
            >
              SMS
            </Text>
          </Pressable>

          {/* WhatsApp */}
          <Pressable
            onPress={() => setTipoEnvio('whatsapp')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor:
                  tipoEnvio === 'whatsapp' ? colors.primary : '#D1D5DB',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              {tipoEnvio === 'whatsapp' && (
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: tipoEnvio === 'whatsapp' ? '600' : '400',
              }}
            >
              WhatsApp
            </Text>
          </Pressable>
        </View>
      </Box>

      {/* CPF/CNPJ Input */}
      <Box style={{ marginBottom: 24 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}>
          CPF/CNPJ
        </Text>
        <CustomInput
          placeholder="000.000.000-00 / 00.000.000/0000-00"
          value={mask(cpf, ['999.999.999-99', '99.999.999/9999-99'])}
          onChangeText={(text: string) => {
            const unmasked = unMask(text)
            setCpf(unmasked)
          }}
          leftIcon={User}
          keyboardType="number-pad"
        />
      </Box>

      {/* Contador Regressivo */}
      {countdown > 0 && (
        <Box
          style={{
            backgroundColor: '#FFF3CD',
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Clock size={20} color="#856404" />
          <Text style={{ fontSize: 14, color: '#856404', fontWeight: '600' }}>
            Aguarde {formatTime(countdown)} para solicitar novamente
          </Text>
        </Box>
      )}

      {/* Botão Solicitar Token */}
      <Button
        onPress={handleRequestToken}
        disabled={isLoading || unMask(cpf).length < 11 || countdown > 0}
        style={{
          borderRadius: 10,
          backgroundColor: colors.primary,
          opacity:
            isLoading || unMask(cpf).length < 11 || countdown > 0 ? 0.5 : 1,
          marginBottom: 24,
        }}
      >
        <ButtonText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {isLoading
            ? 'Solicitando...'
            : countdown > 0
            ? `Aguarde ${formatTime(countdown)}`
            : 'Solicitar Token'}
        </ButtonText>
        {isLoading && <ButtonSpinner color={colors.secondary} />}
      </Button>

      {/* Link para voltar */}
      <Box style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Lembrou sua senha?{' '}
          <Text
            style={{ color: colors.primary, fontWeight: '500' }}
            onPress={() => dispatch(setMode('login'))}
          >
            Voltar para login
          </Text>
        </Text>
      </Box>
    </Box>
  )
}
