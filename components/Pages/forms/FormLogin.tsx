import React, { useState, useEffect } from 'react'
import { Alert, Platform, Linking, Pressable } from 'react-native'

import { Text } from '@/components/ui/text'

import { Button, ButtonText } from '@/components/ui/button'
import { Box } from '@/components/ui/box'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAuth } from '@/hooks/useAuth'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
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
  CheckIcon,
} from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'

import { useBiometricAuth } from '@/hooks/useBiometricAuth'

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

  // Pegar companyInfo do authSlice (onde está sendo salvo)
  const companyInfo = useAppSelector((state) => state.auth.companyInfo)

  const {
    control,
    handleSubmit,

    setValue,
    formState: { errors },
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
    removeCredentials,
    authenticateWithBiometric,
    getStoredCredentials,
    checkStoredCredentials,
  } = useBiometricAuth()

  // Debug - remover depois
  useEffect(() => {
    console.log('🔐 Biometric Debug:', {
      isBiometricSupported,
      biometricType,
      hasStoredCredentials,
    })
  }, [isBiometricSupported, biometricType, hasStoredCredentials])

  const onSubmit = async (data: LoginFormData) => {
    // Validação com valibot
    try {
      const UnMaskData = unMask(data.cpfCnpj)

      // 🔍 Verificar se há credenciais salvas com CPF diferente
      if (hasStoredCredentials) {
        const storedCreds = await getStoredCredentials()

        if (storedCreds && storedCreds.cpf !== UnMaskData) {
          console.log('⚠️ CPF diferente detectado!')
          console.log('📦 CPF salvo:', storedCreds.cpf)
          console.log('📦 CPF tentando logar:', UnMaskData)

          // Limpar credenciais antigas
          await removeCredentials()
          await checkStoredCredentials()

          Alert.alert(
            'Acesso Rápido Removido',
            'Você está fazendo login com um usuário diferente. O acesso rápido anterior foi removido.',
            [{ text: 'OK' }],
          )
        }
      }

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

      // 🆕 Se não tinha checkbox marcado MAS acabou de remover credenciais antigas
      // Perguntar se quer ativar biometria para o novo usuário
      if (!saveBiometric && isBiometricSupported && !hasStoredCredentials) {
        Alert.alert(
          'Ativar Acesso Rápido?',
          `Deseja usar ${biometricType} para fazer login mais rapidamente na próxima vez?`,
          [
            {
              text: 'Agora não',
              style: 'cancel',
            },
            {
              text: 'Sim, ativar',
              onPress: async () => {
                const saved = await saveCredentials(UnMaskData, data.password)
                if (saved) {
                  await checkStoredCredentials()
                  Alert.alert(
                    'Acesso Rápido Ativado',
                    `${biometricType} configurado com sucesso!`,
                  )
                }
              },
            },
          ],
        )
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
      const chatUrl = companyInfo?.link_chat || env.SUPPORT_CHAT_URL

      if (!chatUrl) {
        Alert.alert('Erro', 'Link de suporte não configurado')
        return
      }

      const supported = await Linking.canOpenURL(chatUrl)
      if (supported) {
        await Linking.openURL(chatUrl)
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o chat de suporte')
      }
    } catch (error) {
      console.error('Erro ao abrir chat:', error)
      Alert.alert('Erro', 'Não foi possível abrir o chat de suporte')
    }
  }

  // Função para abrir site de compra de chip
  const handleOpenChipPurchase = async () => {
    try {
      const websiteUrl = companyInfo?.link_website || env.CHIP_PURCHASE_URL

      if (!websiteUrl) {
        Alert.alert('Erro', 'Link de compra não configurado')
        return
      }

      const supported = await Linking.canOpenURL(websiteUrl)
      if (supported) {
        await Linking.openURL(websiteUrl)
      } else {
        Alert.alert('Erro', 'Não foi possível abrir o site de compra')
      }
    } catch (error) {
      console.error('Erro ao abrir site:', error)
      Alert.alert('Erro', 'Não foi possível abrir o site de compra')
    }
  }
  return (
    <Box>
      <Box style={{ marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.text }}>
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
              placeholder="CPF/CNPJ"
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

      {/* Checkbox Salvar Biometria - só mostra se biometria estiver disponível E não tiver credenciais salvas */}
      {isBiometricSupported && !hasStoredCredentials && (
        <Box style={{ marginBottom: 16 }}>
          <Pressable
            onPress={() => {
              const newValue = !saveBiometric
              console.log(
                '📦 Checkbox clicado! Mudando de',
                saveBiometric,
                'para',
                newValue,
              )
              setSaveBiometric(newValue)
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: saveBiometric ? colors.primary : '#999',
                backgroundColor: saveBiometric ? colors.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
              }}
            >
              {saveBiometric && (
                <CheckIcon style={{ margin: 4 }} color={colors.secondary} />
              )}
            </Box>
            <Text style={{ fontSize: 14, color: colors.text }}>
              Salvar e usar {biometricType || 'Biometria'} para login
            </Text>
          </Pressable>
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
            style={{ color: `${colors.primary}`, fontWeight: '700' }}
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
            style={{ color: `${colors.primary}`, fontWeight: '700' }}
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
            bgColor={colors.secondary}
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
