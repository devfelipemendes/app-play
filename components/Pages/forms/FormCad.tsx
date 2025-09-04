import React, { useState } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
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
  Mail,
  ArrowLeft,
  PersonStandingIcon,
  PersonStanding,
  User2,
  Briefcase,
} from 'lucide-react-native'
import { ButtonSpinner } from '@gluestack-ui/themed'
import { cpf, cnpj } from 'cpf-cnpj-validator'

import ThemeCard from '@/components/screens/settings/theme-card'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'

const cadastroSchema = v.pipe(
  v.object({
    name: v.pipe(
      v.string('Nome completo é obrigatório'),
      v.minLength(3, 'Nome deve ter pelo menos 3 caracteres'),
      v.custom(
        (value: any) => value.trim().split(' ').length >= 2,
        'Informe nome e sobrenome',
      ),
    ),
    cnpj: v.pipe(
      v.string('CNPJ é obrigatório'),
      v.minLength(14, 'CNPJ deve ter 14 dígitos'),
      v.maxLength(14, 'CNPJ deve ter 14 dígitos'),
      v.custom((value: any) => {
        const clean = unMask(value)
        return !!Number(clean)
      }, 'CNPJ deve conter apenas números'),
      v.custom((value: any) => cnpj.isValid(unMask(value)), 'CNPJ inválido'),
    ),
    cpf: v.pipe(
      v.string('CPF é obrigatório'),
      v.minLength(11, 'CPF deve ter 11 dígitos'),
      v.maxLength(11, 'CPF deve ter 11 dígitos'),
      v.custom((value: any) => {
        const clean = unMask(value)
        return !!Number(clean)
      }, 'CPF deve conter apenas números'),
      v.custom((value: any) => cpf.isValid(unMask(value)), 'CPF inválido'),
    ),
    email: v.pipe(
      v.string('E-mail é obrigatório'),
      v.nonEmpty('E-mail é obrigatório'),
      v.email('E-mail inválido'),
    ),
    password: v.pipe(
      v.string('Senha é obrigatória'),
      v.nonEmpty('Senha é obrigatória'),
      v.minLength(6, 'Senha deve ter pelo menos 6 caracteres'),
    ),
    confirmPassword: v.pipe(
      v.string('Confirmar a senha é obrigatório'),
      v.nonEmpty('Confirmar a senha é obrigatório'),
    ),
  }),
  v.check(
    (data) => data.password === data.confirmPassword,
    'As senhas não coincidem',
  ),
)

type CadastroFormData = v.InferInput<typeof cadastroSchema>

export default function FormCadastro() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('tab1')
  const [loading, setLoading] = useState(false)

  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  const tabs = [
    { id: 'tab1', title: 'Para Mim', icon: User2 },
    { id: 'tab2', title: 'Para Minha Empresa', icon: Briefcase },
  ]

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: valibotResolver(cadastroSchema),
    defaultValues: {
      name: '',
      cpf: '',
      cnpj: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: CadastroFormData) => {
    try {
      setLoading(true)
      console.log('Cadastro enviado:', {
        ...data,
        cpf: unMask(data.cpf),
        cnpj: unMask(data.cnpj),
      })
      // aqui você pode chamar sua API
    } catch (err: any) {
      console.log('Erro de validação', err.errors)
      alert(err.errors.map((e: any) => e.message).join('\n'))
    } finally {
      setLoading(false)
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
      <Box style={{ marginBottom: 32, alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}>
          Crie sua conta
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: '500', color: colors.subTitle }}
        >
          Vamos fazer parte da melhor operadora 🚀
        </Text>
      </Box>

      <VStack space="md">
        <Text className="font-semibold" style={{ color: colors.text }}>
          A linha que deseja usar será para?
        </Text>
        <HStack
          space="sm"
          style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {tabs.map((tab) => (
            <ThemeCard
              key={tab.id}
              title={tab.title}
              icon={tab.icon}
              active={activeTab === tab.id}
              onPress={() => setActiveTab(tab.id)}
            />
          ))}
        </HStack>
      </VStack>
      {/* Formulário de login*/}
      {activeTab === 'tab1' ? (
        <Text className="font-semibold pt-2">Informe seus dados Pessoais</Text>
      ) : (
        <Text className="font-semibold pt-2">
          Informe seus dados Empresariais
        </Text>
      )}
      <Box>
        {/* CPF/CNPJ */}
        {activeTab === 'tab1' && (
          <Box style={{ marginBottom: 20 }}>
            <Text
              style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
            >
              CPF
            </Text>
            <Controller
              control={control}
              name="cpf"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  placeholder="000.000.000-00"
                  value={mask(value, ['999.999.999-99'])}
                  maxlength={14}
                  onChangeText={(text: string) => onChange(unMask(text))}
                  leftIcon={User}
                  keyboardType="number-pad"
                />
              )}
            />
            {errors.cpf && (
              <Text style={{ color: 'red' }}>{errors.cpf.message}</Text>
            )}
          </Box>
        )}
        {activeTab === 'tab2' && (
          <Box style={{ marginBottom: 20 }}>
            <Text
              style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
            >
              CNPJ
            </Text>
            <Controller
              control={control}
              name="cnpj"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  placeholder="00.000.000/0000-00"
                  value={mask(value, ['99.999.999/9999-99'])}
                  maxlength={18}
                  onChangeText={(text: string) => onChange(unMask(text))}
                  leftIcon={Briefcase}
                  keyboardType="number-pad"
                />
              )}
            />
            {errors.cnpj && (
              <Text style={{ color: 'red' }}>{errors.cnpj.message}</Text>
            )}
          </Box>
        )}

        {/* Nome */}
        <Box style={{ marginBottom: 20 }}>
          <Text
            style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
          >
            Nome completo
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Seu nome"
                value={value}
                onChangeText={onChange}
                leftIcon={User}
              />
            )}
          />
          {errors.name && (
            <Text style={{ color: 'red' }}>{errors.name.message}</Text>
          )}
        </Box>

        {/* E-mail */}
        <Box style={{ marginBottom: 20 }}>
          <Text
            style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
          >
            E-mail
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="exemplo@email.com"
                value={value}
                onChangeText={onChange}
                leftIcon={Mail}
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: 'red' }}>{errors.email.message}</Text>
          )}
        </Box>

        {/* Senha */}
        <Box style={{ marginBottom: 20 }}>
          <Text
            style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
          >
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
            <Text style={{ color: 'red' }}>{errors.password.message}</Text>
          )}
        </Box>

        {/* Confirmar senha */}
        <Box style={{ marginBottom: 24 }}>
          <Text
            style={{ marginBottom: 8, fontSize: 14, color: colors.subTitle }}
          >
            Confirmar senha
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Confirme sua senha"
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showConfirmPassword}
                leftIcon={LockKeyhole}
                rightIcon={showConfirmPassword ? Eye : EyeOff}
                onEndIconPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            )}
          />
          {errors.confirmPassword && (
            <Text style={{ color: 'red' }}>
              {errors.confirmPassword.message}
            </Text>
          )}
        </Box>

        {/* Botão Cadastrar */}
        <Button
          onPress={handleSubmit(onSubmit)}
          style={{
            borderRadius: 10,
            backgroundColor: colors.primary,
            marginBottom: 24,
          }}
        >
          <ButtonText
            style={{ color: 'white', fontSize: 16, fontWeight: '600' }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </ButtonText>
          {loading && <ButtonSpinner color={colors.secondary} />}
        </Button>
      </Box>

      {/* Link para voltar ao login */}
      <Box style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Já possui uma conta?{' '}
          <Text
            style={{ color: `${colors.primary}`, fontWeight: '500' }}
            onPress={() => dispatch(setMode('login'))}
          >
            Entrar
          </Text>
        </Text>
      </Box>
    </Box>
  )
}
