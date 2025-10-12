import React, { useState, useEffect } from 'react'
import { Alert, Platform, Linking } from 'react-native'

import { Text } from '@/components/ui/text'

import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch } from '@/src/store/hooks'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import { useForm, Controller } from 'react-hook-form'
import { mask, unMask } from 'remask'

import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  Fingerprint,
  Scan,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'

import { maskCnpjCpf } from '@/src/utils/masks'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/components/ui/checkbox'
import { CheckIcon } from '@/components/ui/icon'
import { IconButton } from '@/components/ui/iconButton'
import { env } from '@/config/env'

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
  const [saveBiometric, setSaveBiometric] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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
  const { colors } = useCompanyThemeSimple()

  const {
    isBiometricSupported,
    biometricType,
    hasStoredCredentials,
    saveCredentials,
    authenticateWithBiometric,
  } = useBiometricAuth()

  const onSubmit = async (data: LoginFormData) => {
    // Validação com valibot
    try {
      const UnMaskData = unMask(data.cpfCnpj)

      // Executa o login
      await signIn(
        UnMaskData,
        data.password,
        data.rememberMe,
        '0',
        '0',
        'login',
        'app',
      )

      // Se o checkbox de biometria estiver marcado, salva as credenciais
      if (saveBiometric && isBiometricSupported) {
        const saved = await saveCredentials(UnMaskData, data.password)
        if (saved) {
          Alert.alert(
            'Biometria Configurada',
            `Você pode fazer login com ${biometricType} na próxima vez!`,
          )
        }
      }
    } catch (err: any) {
      console.log('Erro de validação', err.errors)
      alert(err.errors.map((e: any) => e.message).join('\n'))
    }
  }

  // Função para login com biometria
  const handleBiometricLogin = async () => {
    const credentials = await authenticateWithBiometric()

    if (credentials) {
      // Preenche os campos
      setValue('cpfCnpj', credentials.cpf)
      setValue('password', credentials.password)

      // Executa o login automaticamente
      signIn(
        credentials.cpf,
        credentials.password,
        false,
        '0',
        '0',
        'login',
        'app',
      )
    } else {
      Alert.alert(
        'Autenticação Falhou',
        'Não foi possível autenticar com biometria. Tente novamente.',
      )
    }
  }

  // Função para abrir chat de suporte
  const handleOpenSupportChat = async () => {
    try {
      const supported = await Linking.canOpenURL(env.SUPPORT_CHAT_URL)
      if (supported) {
        await Linking.openURL(env.SUPPORT_CHAT_URL)
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o chat de suporte')
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o chat de suporte')
    }
  }

  // Função para abrir site de compra de chip
  const handleOpenChipPurchase = async () => {
    try {
      const supported = await Linking.canOpenURL(env.CHIP_PURCHASE_URL)
      if (supported) {
        await Linking.openURL(env.CHIP_PURCHASE_URL)
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o site de compra')
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível abrir o site de compra')
    }
  }
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

      {/* Checkbox Salvar Biometria */}
      {isBiometricSupported && (
        <Box
          style={{
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Checkbox
            value="biometric"
            isChecked={saveBiometric}
            onChange={setSaveBiometric}
            aria-label="Salvar biometria"
          >
            <CheckboxIndicator>
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel
              style={{ marginLeft: 8, fontSize: 14, color: colors.text }}
            >
              Salvar e usar {biometricType} para login
            </CheckboxLabel>
          </Checkbox>
        </Box>
      )}

      {/* Botão Login */}
      <Button
        onPress={handleSubmit(onSubmit)}
        style={{
          borderRadius: 10,
          backgroundColor: colors.primary,
          marginBottom: 16,
        }}
      >
        <ButtonText style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          {loadingAuth ? 'Entrando...' : 'Entrar'}
        </ButtonText>
        {loadingAuth && <ButtonSpinner color={colors.secondary} />}
      </Button>

      {/* Botão Biometria - apenas se tiver credenciais salvas */}
      {hasStoredCredentials && isBiometricSupported && (
        <Button
          onPress={handleBiometricLogin}
          disabled={loadingAuth}
          style={{
            borderRadius: 10,
            backgroundColor: 'white',
            borderWidth: 2,
            borderColor: colors.primary,
            marginBottom: 24,
          }}
        >
          {Platform.OS === 'ios' ? (
            biometricType === 'Face ID' ? (
              <Scan size={20} color={colors.primary} />
            ) : (
              <Fingerprint size={20} color={colors.primary} />
            )
          ) : (
            <Fingerprint size={20} color={colors.primary} />
          )}
          <ButtonText
            style={{
              color: colors.primary,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 8,
            }}
          >
            Entrar com {biometricType}
          </ButtonText>
        </Button>
      )}

      {/* Links de cadastro e esqueci senha */}
      <Box style={{ alignItems: 'center', marginBottom: 8 }}>
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

      <Box style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Esqueceu sua Senha?{' '}
          <Text
            style={{ color: `${colors.primary}`, fontWeight: '500' }}
            onPress={() => dispatch(setMode('esqueciSenha'))}
          >
            Clique aqui!
          </Text>
        </Text>
      </Box>

      {/* Botões de ação com ícones */}
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 40,
          marginBottom: 16,
        }}
      >
        {/* Botão Comprar Chip */}
        <Box style={{ alignItems: 'center' }}>
          <IconButton
            icon={ShoppingBag}
            size={28}
            color="white"
            bgColor={colors.text}
            borderRadius={10}
            onPress={handleOpenChipPurchase}
            style={{ marginBottom: 8 }}
          />
          <Text style={{ fontSize: 12, color: colors.text, fontWeight: '500' }}>
            Ainda sem chip?
          </Text>
        </Box>

        {/* Botão Ajuda */}
        <Box style={{ alignItems: 'center' }}>
          <IconButton
            icon={MessageCircle}
            size={28}
            color="white"
            bgColor={colors.text}
            borderRadius={10}
            onPress={handleOpenSupportChat}
            style={{ marginBottom: 8 }}
          />
          <Text style={{ fontSize: 12, color: colors.text, fontWeight: '500' }}>
            Precisa de ajuda?
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
