import React, { useState } from 'react'

import { Text } from '@/components/ui/text'

import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAuth } from '@/src/store/hooks/useAuth'
import { useAppDispatch } from '@/src/store/hooks'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import { useForm, Controller } from 'react-hook-form'
import { mask, unMask } from 'remask'

import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Eye, EyeOff, LockKeyhole, User } from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'

import { maskCnpjCpf } from '@/src/utils/masks'

const loginSchema = v.object({
  cpfCnpj: v.pipe(v.string('CPF/CPNJ é obrigatório')),
  password: v.pipe(
    v.string('Senha é obrigatória'),
    v.nonEmpty('Senha é obrigatória'),
    v.minLength(6, 'Senha deve ter pelo menos 6 caracteres'),
  ),
  rememberMe: v.boolean(),
})

type LoginFormData = v.InferInput<typeof loginSchema>

export default function FormLogin() {
  const { signIn, loadingAuth } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      cpfCnpj: '',
      password: '',
      rememberMe: false,
    },
  })

  const dispatch = useAppDispatch()

  const onSubmit = (data: LoginFormData) => {
    // Validação com valibot
    try {
      const UnMaskData = unMask(data.cpfCnpj)
      signIn(UnMaskData, data.password, '0', '0', 'login', 'app')
    } catch (err: any) {
      console.log('Erro de validação', err.errors)
      alert(err.errors.map((e: any) => e.message).join('\n'))
    }
  }

  const { colors } = useCompanyThemeSimple()
  return (
    <Box>
      <Box style={{ marginBottom: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
          Bem-vindo!
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
          À Melhor Operadora do Brasil
        </Text>
      </Box>

      {/* CPF */}
      <Box style={{ marginBottom: 20 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}>
          CPF/CNPJ
        </Text>
        <Controller
          control={control}
          name="cpfCnpj"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="000.000.000-00 / 00.000.000/0000-00"
              value={mask(value, ['999.999.999-99', '99.999.999/9999-99'])}
              onChangeText={(text: string) =>
                onChange(mask(text, ['99999999999', '99999999999999']))
              }
              leftIcon={User}
              keyboardType="number-pad"
            />
          )}
        />
        {errors.cpfCnpj && (
          <Text style={{ color: 'red', marginBottom: 8 }}>
            {errors.cpfCnpj.message}
          </Text>
        )}
      </Box>

      {/* Senha */}
      <Box style={{ marginBottom: 24 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}>
          Senha
        </Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <CustomInput
              placeholder="Digite sua senha"
              value={value}
              onChangeText={onChange}
              secureTextEntry={!showPassword}
              leftIcon={LockKeyhole}
              rightIcon={showPassword ? Eye : EyeOff}
              onEndIconPress={() => setShowPassword(!showPassword)}
            />
          )}
        />
        {errors.password && (
          <Text style={{ color: 'red', marginBottom: 8 }}>
            {errors.password.message}
          </Text>
        )}
      </Box>

      {/* Botão Login */}
      <Button
        onPress={handleSubmit(onSubmit)}
        style={{
          borderRadius: 10,
          backgroundColor: colors.primary,
          marginBottom: 24,
        }}
      >
        <ButtonText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {loadingAuth ? 'Entrando...' : 'Entrar'}
        </ButtonText>
        {loadingAuth && <ButtonSpinner color={colors.secondary} />}
      </Button>

      {/* Link para cadastro */}
      <Box style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Ainda não possui uma conta?{' '}
          <Text
            style={{ color: `${colors.primary}`, fontWeight: '500' }}
            onPress={() => dispatch(setMode('cadastro'))}
          >
            Cadastre-se
          </Text>
        </Text>
      </Box>
      <Box style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Esqueceu sua Senha?{' '}
          <Text style={{ color: `${colors.primary}`, fontWeight: '500' }}>
            Cliquei aqui!
          </Text>
        </Text>
      </Box>
    </Box>
  )
}
