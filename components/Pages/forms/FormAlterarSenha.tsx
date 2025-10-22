import React, { useState } from 'react'
import { Alert } from 'react-native'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useChangePasswordByTokenMutation } from '@/src/api/endpoints/forgotPasswordApi'
import { Eye, EyeOff, LockKeyhole, ArrowLeft } from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import type { RootState } from '@/src/store'

export default function FormAlterarSenha() {
  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  // Pegar o CPF do estado global
  const cpf = useAppSelector((state: RootState) => state.screenFlow.cpf) || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [changePassword, { isLoading }] = useChangePasswordByTokenMutation()

  const handleChangePassword = async () => {
    // Validações
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem')
      return
    }

    try {
      await changePassword({
        cpf,
        password: newPassword,
      }).unwrap()

      Alert.alert('Senha Alterada', 'Sua senha foi alterada com sucesso!', [
        {
          text: 'OK',
          onPress: () => dispatch(setMode('login')),
        },
      ])
    } catch (error: any) {
      const errorStatus = error?.status || error?.data?.status
      const errorMessage =
        error?.data?.error ||
        error?.data?.message ||
        'Erro ao alterar senha. Tente novamente.'

      // Detecta erro 403 - Bloqueio por múltiplas tentativas
      if (errorStatus === 403) {
        Alert.alert(
          'Acesso Bloqueado',
          'Após várias tentativas, a alteração de senha foi bloqueada por segurança.\n\nPara desbloquear, entre em contato com a central de atendimento.',
          [{ text: 'OK' }],
        )
        return
      }

      Alert.alert('Erro', errorMessage)
    }
  }

  const isPasswordValid = newPassword.length >= 6
  const doPasswordsMatch =
    newPassword === confirmPassword && confirmPassword.length > 0

  return (
    <Box>
      <Box>
        <ArrowLeft
          color={colors.primary}
          onPress={() => dispatch(setMode('validarToken'))}
        />
      </Box>

      {/* Header */}
      <Box style={{ marginBottom: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
          Alterar Senha
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: colors.subTitle }}
        >
          Digite sua nova senha de acesso
        </Text>
      </Box>

      {/* Nova Senha */}
      <Box style={{ marginBottom: 20 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}>
          Nova Senha
        </Text>
        <CustomInput
          placeholder="Digite sua nova senha"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showPassword}
          leftIcon={LockKeyhole}
          rightIcon={showPassword ? Eye : EyeOff}
          onEndIconPress={() => setShowPassword(!showPassword)}
        />
        <Text style={{ marginTop: 4, fontSize: 12, color: colors.subTitle }}>
          Sua senha deve conter pelo menos 6 caracteres
        </Text>
        {newPassword.length > 0 && !isPasswordValid && (
          <Text style={{ marginTop: 4, fontSize: 12, color: 'red' }}>
            A senha deve ter pelo menos 6 caracteres
          </Text>
        )}
      </Box>

      {/* Confirmar Senha */}
      <Box style={{ marginBottom: 32 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}>
          Confirmar Nova Senha
        </Text>
        <CustomInput
          placeholder="Confirme sua nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          leftIcon={LockKeyhole}
          rightIcon={showConfirmPassword ? Eye : EyeOff}
          onEndIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
        />
        {confirmPassword.length > 0 && !doPasswordsMatch && (
          <Text style={{ marginTop: 4, fontSize: 12, color: 'red' }}>
            As senhas devem ser iguais
          </Text>
        )}
      </Box>

      {/* Botão Alterar Senha */}
      <Button
        onPress={handleChangePassword}
        disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
        style={{
          borderRadius: 10,
          backgroundColor: colors.primary,
          opacity: isLoading || !isPasswordValid || !doPasswordsMatch ? 0.5 : 1,
        }}
      >
        <ButtonText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </ButtonText>
        {isLoading && <ButtonSpinner color={colors.secondary} />}
      </Button>
    </Box>
  )
}
