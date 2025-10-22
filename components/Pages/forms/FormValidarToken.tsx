import React, { useRef, useState } from 'react'
import { Alert, TextInput as RNTextInput, StyleSheet } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useValidatePasswordTokenMutation } from '@/src/api/endpoints/forgotPasswordApi'
import { ButtonSpinner } from '@gluestack-ui/themed'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import { ArrowLeft } from 'lucide-react-native'
import type { RootState } from '@/src/store'

export default function FormValidarToken() {
  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  // Pegar o CPF do estado global (você vai precisar adicionar isso no slice)
  const cpf = useAppSelector((state: RootState) => state.screenFlow.cpf) || ''

  const [token, setToken] = useState<string[]>(Array(6).fill(''))
  const tokenInputs = useRef<RNTextInput[]>([])

  const [validateToken, { isLoading }] = useValidatePasswordTokenMutation()

  const handleTokenChange = (index: number, newDigit: string) => {
    if (newDigit.match(/^\d$/)) {
      const newToken = [...token]
      newToken[index] = newDigit
      setToken(newToken)

      // Move para o próximo input
      if (index < token.length - 1) {
        tokenInputs.current[index + 1]?.focus()
      }
    } else if (newDigit === '') {
      // Permite deletar
      const newToken = [...token]
      newToken[index] = ''
      setToken(newToken)

      // Move para o input anterior
      if (index > 0) {
        tokenInputs.current[index - 1]?.focus()
      }
    }
  }

  const isTokenComplete = token.every((digit) => digit !== '')

  const handleValidateToken = async () => {
    try {
      await validateToken({
        cpf,
        tokenesquecisenha: token.join(''),
      }).unwrap()

      Alert.alert(
        'Token Validado',
        'Token validado com sucesso! Agora você pode alterar sua senha.',
        [
          {
            text: 'OK',
            onPress: () => dispatch(setMode('alterarSenha')),
          },
        ],
      )
    } catch (error: any) {
      const errorStatus = error?.status || error?.data?.status
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        'Token inválido. Tente novamente.'

      // Detecta erro 403 - Bloqueio por múltiplas tentativas
      if (errorStatus === 403) {
        Alert.alert(
          'Acesso Bloqueado',
          'Após várias tentativas, a validação foi bloqueada por segurança.\n\nPara desbloquear, entre em contato com a central de atendimento.',
          [{ text: 'OK' }],
        )
        return
      }

      Alert.alert('Erro', errorMessage)
    }
  }

  const styles = StyleSheet.create({
    tokenContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    tokenBox: {
      width: 50,
      height: 60,
      borderWidth: 2,
      borderColor: colors.primary,
      color: colors.primaryLight50,
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginHorizontal: 4,
      borderRadius: 12,
      backgroundColor: 'white',
    },
  })

  return (
    <Box>
      <Box>
        <ArrowLeft
          color={colors.primary}
          onPress={() => dispatch(setMode('esqueciSenha'))}
        />
      </Box>

      {/* Header */}
      <Box style={{ marginBottom: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
          Validar Token
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: colors.subTitle }}
        >
          Digite o código de 6 dígitos que você recebeu
        </Text>
      </Box>

      {/* Token Inputs */}
      <Box style={styles.tokenContainer}>
        {token.map((digit, index) => (
          <RNTextInput
            key={index}
            ref={(input) => {
              if (input) {
                tokenInputs.current[index] = input
              }
            }}
            style={styles.tokenBox}
            maxLength={1}
            keyboardType="numeric"
            onChangeText={(newDigit) => handleTokenChange(index, newDigit)}
            value={digit}
            autoFocus={index === 0}
          />
        ))}
      </Box>

      {/* Info */}
      <Box style={{ marginBottom: 24, alignItems: 'center' }}>
        <Text
          style={{ fontSize: 14, color: colors.subTitle, textAlign: 'center' }}
        >
          O token pode demorar até 5 minutos para chegar
        </Text>
      </Box>

      {/* Botão Validar */}
      <Button
        onPress={handleValidateToken}
        disabled={isLoading || !isTokenComplete}
        style={{
          borderRadius: 10,
          backgroundColor: colors.primary,
          opacity: isLoading || !isTokenComplete ? 0.5 : 1,
          marginBottom: 16,
        }}
      >
        <ButtonText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {isLoading ? 'Validando...' : 'Validar Token'}
        </ButtonText>
        {isLoading && <ButtonSpinner color={colors.secondary} />}
      </Button>

      {/* Link para reenviar */}
      <Box style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Não recebeu o código?{' '}
          <Text
            style={{
              color: colors.primary,
              fontWeight: '500',
              textDecorationLine: 'underline',
            }}
            onPress={() => dispatch(setMode('esqueciSenha'))}
          >
            Solicitar novamente
          </Text>
        </Text>
      </Box>
    </Box>
  )
}
