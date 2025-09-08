import React, { useEffect, useState } from 'react'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { CustomInput } from '@/components/layout/CustomInput'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch } from '@/src/store/hooks'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import { useForm, Controller } from 'react-hook-form'
import { mask, unMask } from 'remask'
import { Camera, CameraView, useCameraPermissions } from 'expo-camera'

import * as v from 'valibot'
import { valibotResolver } from '@hookform/resolvers/valibot'
import {
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  Mail,
  ArrowLeft,
  User2,
  Briefcase,
  InfoIcon,
  Calendar,
  Phone,
  MessageCircle,
  CardSim,
  Smartphone,
  CheckCircle,
  XCircle,
  ScanBarcode,
  PanelRightCloseIcon,
} from 'lucide-react-native'
import { ButtonIcon, ButtonSpinner } from '@gluestack-ui/themed'
import { cpf, cnpj } from 'cpf-cnpj-validator'

import ThemeCard from '@/components/screens/settings/theme-card'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { IconButton } from '@/components/ui/iconButton'
import { useCheckCpfMutation } from '@/src/api/endpoints/checkCpf'
import Toast from 'react-native-toast-message'
import { BackHandler, Dimensions, Platform, View } from 'react-native'
import { useCpfCnpjCheck } from '@/hooks/useCpfCnpjValidator'
import { useCreateUserMutation } from '@/src/api/endpoints/cad'
import { useCep } from '@/hooks/useGetCep'
import DatePickerInput from '@/components/layout/CustomIputDatePicker'
import { Modal, Portal, ProgressBar } from 'react-native-paper'
import { env } from '@/config/env'
import { CloseIcon } from '@/components/ui/icon'
import {
  useChecaICCID,
  type ChecaIccidRes,
} from '@/src/api/endpoints/checkIccid'
import { useDebounce } from '@/hooks/useDebounce'
import PlansCarousel from '@/components/layout/PlansCarousel'
import { setUserInfo } from '@/src/store/slices/ativarLinhaSlice'

const cadastroSchema = v.pipe(
  v.object({
    // Campos básicos
    name: v.pipe(
      v.string('Nome completo é obrigatório'),
      v.minLength(3, 'Nome deve ter pelo menos 3 caracteres'),
      v.custom(
        (value: any) => value.trim().split(' ').length >= 2,
        'Informe nome e sobrenome',
      ),
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

    // Campos de documento
    cnpj: v.optional(
      v.pipe(
        v.string(),
        v.custom((value: any) => {
          const clean = unMask(value)
          return clean === '' || cnpj.isValid(clean)
        }, 'CNPJ inválido'),
      ),
    ),
    cpf: v.optional(
      v.pipe(
        v.string(),
        v.custom((value: any) => {
          const clean = unMask(value)
          return clean === '' || cpf.isValid(clean)
        }, 'CPF inválido'),
      ),
    ),

    // Campos de contato
    phone: v.pipe(
      v.string('Telefone é obrigatório'),
      v.minLength(10, 'Telefone deve ter pelo menos 10 dígitos'),
    ),
    whats: v.optional(v.string()),
    nascimento: v.pipe(
      v.string('Data de nascimento é obrigatória'),
      v.nonEmpty('Data de nascimento é obrigatória'),
    ),

    // Campos de endereço
    cep: v.pipe(
      v.string('CEP é obrigatório'),
      v.minLength(9, 'CEP deve ter 8 dígitos'),
      v.maxLength(9, 'CEP deve ter 8 dígitos'),
    ),
    uf: v.pipe(
      v.string('UF é obrigatório'),
      v.minLength(2, 'UF deve ter 2 caracteres'),
      v.maxLength(2, 'UF deve ter 2 caracteres'),
    ),
    cidade: v.pipe(
      v.string('Cidade é obrigatória'),
      v.minLength(2, 'Cidade deve ter pelo menos 2 caracteres'),
    ),
    district: v.pipe(
      v.string('Bairro é obrigatório'),
      v.minLength(2, 'Bairro deve ter pelo menos 2 caracteres'),
    ),
    street: v.pipe(
      v.string('Rua é obrigatória'),
      v.minLength(3, 'Rua deve ter pelo menos 3 caracteres'),
    ),
    number: v.pipe(
      v.string('Número é obrigatório'),
      v.nonEmpty('Número é obrigatório'),
      v.regex(/^\d+$/, 'Número deve conter apenas dígitos'),
      v.custom((value: any) => value > 0, 'Número deve ser maior que 0'),
    ),
    complement: v.optional(v.string()),

    // Campos específicos para PJ
    revendedor: v.optional(v.string()),
    porcentagem_recarga: v.optional(v.number()),
    porcentagem_ativacao: v.optional(v.number()),

    // Campos do sistema
    parceiro: v.optional(v.string()),
    nivel: v.optional(v.number()),
    token: v.optional(v.string()),
    parentcompany: v.optional(v.number()),
  }),

  // Validações condicionais
  v.check((data: any) => data.cpf || data.cnpj, 'Informe CPF ou CNPJ'),
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
  const [activeTypeChipsTabs, setActiveTypeChipsTabs] =
    useState<string>('simCard')
  const [step, setStep] = useState(4)
  const [loading, setLoading] = useState(false)
  const [showTextInfo1, setShowTextInfo1] = useState(false)
  const [showTextInfo2, setShowTextInfo2] = useState(false)
  const [showEmailField, setShowEmailField] = useState(false)
  const [statusCpf, setStatusCpf] = useState<
    'semLinhaAtiva' | 'cpfAtivo' | 'semCadastro' | null
  >(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [showScan, setShowScan] = useState(false)
  const [iccidValue, setIccidValue] = useState('')
  const [isIccidValid, setIsIccidValid] = useState<boolean | null>(null)
  const [lastValidatedIccid, setLastValidatedIccid] = useState('')

  const [permission, requestPermission] = useCameraPermissions()

  const { validateAndCheck, isLoading: isCheckingCpf } = useCpfCnpjCheck()

  const { validateICCID, isLoading: loadingIccid } = useChecaICCID()

  const { fetchCep, loading: loadingCep, error } = useCep()
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation()

  const { colors } = useCompanyThemeSimple()
  const dispatch = useAppDispatch()

  const { width, height } = Dimensions.get('window')

  const tabs = [
    { id: 'tab1', title: 'Para Mim', icon: User2 },
    { id: 'tab2', title: 'Para Minha Empresa', icon: Briefcase },
  ]

  const typeChipTabs = [
    { id: 'simCard', title: 'SIM Card', icon: CardSim },
    { id: 'eSim', title: 'eSIM', icon: Smartphone },
  ]

  const {
    control,
    handleSubmit,
    watch,
    setValue,
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
      phone: '',
      whats: '',
      nascimento: '',
      cep: '',
      uf: '',
      cidade: '',
      district: '',
      street: '',
      number: undefined,
      complement: '',
      revendedor: '',
      porcentagem_recarga: undefined,
      porcentagem_ativacao: undefined,
      parceiro: '',
      nivel: 1,
      token: '',
      parentcompany: undefined,
    },
  })

  async function getCameraPermissions() {
    const { status } = await requestPermission()
    setHasPermission(status === 'granted')
  }

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return ''

    // Se a data já está no formato DD-MM-YYYY, retorna como está
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString
    }

    // Se a data está no formato DD/MM/YYYY, converte para DD-MM-YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString.replace(/\//g, '-')
    }

    // Se a data está no formato YYYY-MM-DD, converte para DD-MM-YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-')
      return `${day}-${month}-${year}`
    }

    // Se a data é um objeto Date ou string que pode ser parseada
    try {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const year = date.getFullYear()
        return `${day}-${month}-${year}`
      }
    } catch (error) {
      console.warn('Erro ao formatar data:', error)
    }

    return dateString // Retorna a string original se não conseguir formatar
  }

  const onSubmit = async (data: CadastroFormData) => {
    const documentValue = data.cpf ? unMask(data.cpf) : unMask(data.cnpj || '')

    try {
      const payload = {
        name: data.name,
        email: data.email,
        nascimento: formatDateForAPI(data.nascimento),
        cpf: documentValue,
        phone: unMask(data.phone),
        whats: unMask(data.whats || ''),
        nivel: data.nivel || 1,
        cep: unMask(data.cep),
        uf: data.uf,
        cidade: data.cidade,
        district: data.district,
        street: data.street,
        number: parseInt(data.number || '0', 10),
        complement: data.complement || '',
        revendedor: data.revendedor || '',
        porcentagem_recarga: data.porcentagem_recarga || 0,
        porcentagem_ativacao: data.porcentagem_ativacao || 0,
        parentcompany: data.parentcompany || 0,
        password: data.password,
        parceiro: env.COMPANY_ID,
      }

      console.log('Dados a serem enviados:', payload)

      console.log('=== PAYLOAD DEBUG ===')
      console.log('Dados originais do form:', data)
      console.log('Dados a serem enviados:', payload)
      console.log(
        'Tipo do número:',
        typeof payload.number,
        '- Valor:',
        payload.number,
      )
      console.log('====================')

      const result = await createUser(payload).unwrap()

      Toast.show({
        type: 'success',
        text1: 'Cadastro realizado com sucesso!',
        text2: result.message || 'Bem-vindo à nossa plataforma',
      })

      // Redirecionar ou fazer algo após sucesso
      dispatch(setMode('login'))
    } catch (err: any) {
      console.error('Erro ao cadastrar:', err)

      Toast.show({
        type: 'error',
        text1: 'Ops!!!',
        text2:
          'Algo de inesperado acontenceu ao cadastrar, tente novamente em instantes',
      })
    }
  }

  const handleCepChange = async (cep: string) => {
    const data = await fetchCep(cep)
    if (data) {
      setValue('cep', data.cep)
      setValue('uf', data.uf)
      setValue('cidade', data.localidade)
      setValue('district', data.bairro)
      setValue('street', data.logradouro)
      setValue('complement', data.complemento || '')
    }
  }

  const handleValidateICCID = async (iccid: string) => {
    if (iccid === lastValidatedIccid) return

    setLastValidatedIccid(iccid)

    const result: any = await validateICCID({
      token: '',
      iccid,
    })

    if (result.success && result.data) {
      setIsIccidValid(true)
      Toast.show({
        type: 'success',
        text1: 'ICCID válido',
        text2: `${result.data.descricao} - Rede: ${result.rede}`,
      })
    } else {
      setIsIccidValid(false)
      Toast.show({
        type: 'error',
        text1: 'ICCID inválido',
        text2: result.error || 'Verifique o ICCID e tente novamente',
      })
    }
  }

  const toggleButton1 = () => {
    setShowTextInfo1(!showTextInfo1)
  }

  const toggleButton2 = () => {
    setShowTextInfo2(!showTextInfo2)
  }

  // useEffect(() => {
  //   // Limpa os campos e reseta status quando mudar de aba
  //   setValue('cpf', '')
  //   setValue('cnpj', '')
  //   setStatusCpf(null)
  //   setStep(1)
  // }, [activeTab])

  // useEffect(() => {
  //   const docCpf = watch('cpf') || ''
  //   const docCnpj = watch('cnpj') || ''

  //   const checkDocumentStatus = async (value: string, type: string) => {
  //     const cleanValue = unMask(value)
  //     const expectedLength = type === 'cpf' ? 11 : 14

  //     // Valida apenas se o número estiver completo
  //     if (cleanValue.length !== expectedLength) {
  //       setStatusCpf(null)
  //       setStep(1)
  //       return
  //     }

  //     const result = await validateAndCheck(cleanValue, type)

  //     if (result.data) {
  //       // Documento existe no sistema mas sem linha ativa
  //       setStatusCpf('semLinhaAtiva')
  //       setStep(3)
  //       Toast.show({
  //         type: 'info',
  //         text1: `${type} já possui cadastro!`,
  //         text2: 'Só falta ativar uma linha, vamos lá',
  //       })
  //     } else if (result.error) {
  //       if (result.error.includes('não encontrado')) {
  //         setStatusCpf('semCadastro')
  //         setStep(2)
  //       } else if (result.error.includes('linha ativa')) {
  //         setStatusCpf('cpfAtivo')
  //         Toast.show({
  //           type: 'error',
  //           text1: `${type.toUpperCase()} já possui linha ativa`,
  //         })
  //         dispatch(setMode('login'))
  //       } else {
  //         Toast.show({
  //           type: 'info',
  //           text1: 'Precisamos de um CPF/CNPJ válido',
  //           text2: `Veja se o ${type.toUpperCase()} foi inserido corretamente`,
  //         })
  //       }
  //     }
  //   }

  //   // Prioriza CPF, se estiver completo, senão verifica CNPJ completo
  //   const cleanCpf = unMask(docCpf)
  //   const cleanCnpj = unMask(docCnpj)

  //   if (cleanCpf.length === 11) checkDocumentStatus(docCpf, 'cpf')
  //   else if (cleanCnpj.length === 14) checkDocumentStatus(docCnpj, 'cnpj')
  // }, [watch('cpf'), watch('cnpj')])

  const debouncedValidateICCID = useDebounce(handleValidateICCID, 500)

  function scanCode({ data }: { type: string; data: string }) {
    const cleanedData = data.replace(/\D/g, '').trim()
    setIccidValue(cleanedData)
    setShowScan(false)

    Toast.show({
      type: 'success',
      text1: 'ICCID escaneado!',
      text2: `ICCID: ${cleanedData}`,
    })
  }

  useEffect(() => {
    if (iccidValue.length >= 19) {
      handleValidateICCID(iccidValue)
    } else {
      setIsIccidValid(null)
    }
  }, [iccidValue])

  // 4. useEffect PARA PERMISSÕES
  useEffect(() => {
    getCameraPermissions()
  }, [])

  useEffect(() => {
    const cleanIccid = iccidValue.replace(/\D/g, '').trim()

    if (cleanIccid.length >= 19 && cleanIccid.length <= 20) {
      debouncedValidateICCID(cleanIccid)
    } else {
      setIsIccidValid(null)
      setLastValidatedIccid('')
      debouncedValidateICCID.cancel()
    }

    return () => {
      debouncedValidateICCID.cancel()
    }
  }, [iccidValue, debouncedValidateICCID])

  // Só mostra o campo email depois que o nome for preenchido
  useEffect(() => {
    const nameValue = watch('name')
    if (nameValue && nameValue.length > 2) {
      setTimeout(() => setShowEmailField(true), 100)
    }
  }, [watch('name')])

  useEffect(() => {
    const backAction = () => {
      if (step > 1) {
        setStep((prev) => prev - 1) // volta um step
        return true // impede o comportamento padrão (sair da tela)
      }

      if (step === 1) {
        dispatch(setMode('login'))
        return true
      }
      return false // deixa o sistema cuidar (sair da tela, voltar rota, etc.)
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    )

    return () => backHandler.remove()
  }, [step])

  useEffect(() => {
    if (step === 4) {
      const formData = watch()
      const documentValue = formData.cpf
        ? unMask(formData.cpf)
        : unMask(formData.cnpj || '')

      // Extrair DDD do telefone
      const phoneValue = unMask(formData.phone || '')
      const ddd = phoneValue.slice(0, 2)

      console.log('FormCadastro - Enviando dados para Redux:', {
        cpf: documentValue,
        name: formData.name || '',
        parceiro: env.PARCEIRO || '',
        iccid: iccidValue,
        ddd: ddd,
      })

      // Atualizar Redux com dados necessários para buscar planos
      dispatch(
        setUserInfo({
          parceiro: env.PARCEIRO || '46',
          token: '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
          // Estes campos são opcionais para visualização:
          iccid: iccidValue || '',

          // Campos que vamos precisar DEPOIS para ativação:
          cpf: documentValue || '',
          name: formData.name || '',
          ddd: ddd || '',
        }),
      )
    }
  }, [step, watch(), iccidValue, dispatch])

  const handleCpfChange = async (text: string) => {
    const cleanText = unMask(text)
    setValue('cpf', cleanText)

    if (cleanText.length === 11) {
      const result = await validateAndCheck(cleanText, 'cpf')
      if (!result.isValid) Toast.show({ type: 'error', text1: result.error })
    }
  }

  const handleCnpjChange = async (text: string) => {
    const cleanText = unMask(text)
    setValue('cnpj', cleanText)

    if (cleanText.length === 14) {
      const result = await validateAndCheck(cleanText, 'cnpj')
      if (!result.isValid) Toast.show({ type: 'error', text1: result.error })
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Box>
            <Box>
              <ArrowLeft
                color={colors.primary}
                onPress={() => dispatch(setMode('login'))}
              />
            </Box>
            <Box style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
              >
                Crie sua conta
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.subTitle,
                }}
              >
                Vamos fazer parte da melhor operadora 🚀
              </Text>
            </Box>
            <VStack space="md" style={{ marginBottom: 20 }}>
              <Text className="font-semibold" style={{ color: colors.text }}>
                A linha que deseja usar será para?
              </Text>
              <HStack
                space="sm"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
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
            {activeTab === 'tab1' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  CPF
                </Text>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field: { value } }) => (
                    <CustomInput
                      placeholder="000.000.000-00"
                      value={value ? mask(value, ['999.999.999-99']) : value}
                      maxlength={14}
                      onChangeText={handleCpfChange}
                      leftIcon={User}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {errors.cpf && (
                  <Text style={{ color: 'red' }}>{errors.cpf.message}</Text>
                )}
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  Informe seu CPF para fornecermos uma experiêcia com maior
                  qualidade na sua etapa de cadastro!
                </Text>
              </Box>
            )}

            {activeTab === 'tab2' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  CNPJ
                </Text>
                <Controller
                  control={control}
                  name="cnpj"
                  render={({ field: { value } }) => (
                    <CustomInput
                      placeholder="00.000.000/0000-00"
                      value={
                        value ? mask(value, ['99.999.999/9999-99']) : value
                      }
                      maxlength={18}
                      onChangeText={handleCnpjChange}
                      leftIcon={Briefcase}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {errors.cnpj && (
                  <Text style={{ color: 'red' }}>{errors.cnpj.message}</Text>
                )}
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  Informe seu CNPJ para fornecermos uma experiêcia com maior
                  qualidade na sua etapa de cadastro!
                </Text>
              </Box>
            )}
          </Box>
        )

      case 2:
        return (
          <Box>
            <Box>
              <ArrowLeft color={colors.primary} onPress={() => setStep(1)} />
            </Box>
            <Box style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
              >
                Complete seu cadastro
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.subTitle,
                }}
              >
                Finalize suas informações
              </Text>
            </Box>

            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginBottom: 16,
              }}
            >
              <Text className="font-semibold pt-2">
                Informações gerais para cadastro
              </Text>
              <IconButton
                icon={InfoIcon}
                size={12}
                color="white"
                bgColor={colors.primary}
                onPress={toggleButton1}
              />
            </Box>

            {showTextInfo1 && (
              <Box
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.disabled,
                  width: '100%',
                  borderRadius: 5,
                  padding: 5,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.textButton,
                  }}
                >
                  Essas informações serão usadas para criar um usuário em nosso
                  sistema. No futuro essas informações podem ser utilizadas caso
                  você precise de ajuda com seus benefícios ou em qualquer outro
                  serviço que disponibilizarmos.
                </Text>
              </Box>
            )}

            {/* Nome */}
            {activeTab === 'tab1' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
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
                      autoComplete="off"
                      autoCorrect={false}
                      textContentType="none"
                      leftIcon={User}
                      keyboardType="name-phone-pad"
                    />
                  )}
                />
                {errors.name && (
                  <Text style={{ color: 'red' }}>{errors.name.message}</Text>
                )}
              </Box>
            )}
            {activeTab === 'tab2' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  Razão social
                </Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      placeholder="Seu nome"
                      value={value}
                      onChangeText={onChange}
                      leftIcon={Briefcase}
                      keyboardType="name-phone-pad"
                    />
                  )}
                />
                {errors.name && (
                  <Text style={{ color: 'red' }}>{errors.name.message}</Text>
                )}
              </Box>
            )}

            {/* E-mail */}
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
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
            <Box style={{ marginBottom: 20 }}>
              <Controller
                control={control}
                name="nascimento"
                render={({ field: { value, onChange } }) => (
                  <DatePickerInput
                    label="Data de Nascimento"
                    value={value || ''} // garante que sempre seja string
                    onConfirm={(dateString) => {
                      onChange(dateString) // atualiza o RHF com string formatada
                    }}
                    error={!!errors.nascimento}
                    leftIcon={Calendar}
                    required
                  />
                )}
              />
              {errors.nascimento && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                  {errors.nascimento.message}
                </Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Celular
              </Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="(99) 9 9999-9999"
                    value={value}
                    onChangeText={(value) =>
                      onChange(mask(value, ['(99) 9 9999-9999']))
                    }
                    leftIcon={Phone}
                    maxlength={16}
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.phone && (
                <Text style={{ color: 'red' }}>{errors.phone.message}</Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                WhatsApp
              </Text>
              <Controller
                control={control}
                name="whats"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="(99) 9 9999-9999"
                    value={value}
                    onChangeText={(value) =>
                      onChange(mask(value, ['(99) 9 9999-9999']))
                    }
                    leftIcon={MessageCircle}
                    maxlength={16}
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.whats && (
                <Text style={{ color: 'red' }}>{errors.whats.message}</Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                CEP
              </Text>
              <Controller
                control={control}
                name="cep"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="12345-67"
                    value={value}
                    onChangeText={(text) => {
                      const masked = mask(text, '99999-999')
                      onChange(masked)

                      const cleanCep = masked.replace(/\D/g, '')
                      if (cleanCep.length === 8) {
                        handleCepChange(cleanCep)
                      }
                    }}
                    leftIcon={MessageCircle}
                    maxlength={9}
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.cep && (
                <Text style={{ color: 'red' }}>{errors.cep.message}</Text>
              )}
              {loadingCep && (
                <ProgressBar
                  progress={0}
                  indeterminate={loadingCep}
                  color={colors.primary}
                  style={{
                    marginTop: 5,
                    marginBottom: -5,
                    backgroundColor: colors.disabled,
                    borderRadius: 5,
                  }}
                />
              )}
            </Box>

            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                UF
              </Text>
              <Controller
                control={control}
                name="uf"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="AB"
                    value={value}
                    onChangeText={(value) => onChange(value.toUpperCase())}
                    leftIcon={MessageCircle}
                    maxlength={2}
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.uf && (
                <Text style={{ color: 'red' }}>{errors.uf.message}</Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Cidade
              </Text>
              <Controller
                control={control}
                name="cidade"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="Cidade"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={MessageCircle}
                    maxlength={16}
                    keyboardType="default"
                  />
                )}
              />
              {errors.cidade && (
                <Text style={{ color: 'red' }}>{errors.cidade.message}</Text>
              )}
            </Box>

            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Bairro
              </Text>
              <Controller
                control={control}
                name="district"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="Bairro"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={MessageCircle}
                    maxlength={16}
                    keyboardType="default"
                  />
                )}
              />
              {errors.district && (
                <Text style={{ color: 'red' }}>{errors.district.message}</Text>
              )}
            </Box>

            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Logradouro
              </Text>
              <Controller
                control={control}
                name="street"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="Logradouro"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={MessageCircle}
                    keyboardType="default"
                  />
                )}
              />
              {errors.street && (
                <Text style={{ color: 'red' }}>{errors.street.message}</Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Número
              </Text>
              <Controller
                control={control}
                name="number"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="1234"
                    value={value} // Simples string, sem conversão
                    onChangeText={(text) => {
                      // Remove caracteres não numéricos e atualiza
                      const numericOnly = text.replace(/\D/g, '')
                      onChange(numericOnly)
                    }}
                    leftIcon={MessageCircle}
                    maxLength={10} // Limite razoável para número de casa
                    keyboardType="number-pad"
                  />
                )}
              />
              {errors.number && (
                <Text style={{ color: 'red' }}>{errors.number.message}</Text>
              )}
            </Box>
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
              >
                Complemento
              </Text>
              <Controller
                control={control}
                name="complement"
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    placeholder="Complemento"
                    value={value}
                    onChangeText={onChange}
                    leftIcon={MessageCircle}
                    keyboardType="default"
                  />
                )}
              />
              {errors.whats && (
                <Text style={{ color: 'red' }}>{errors.whats.message}</Text>
              )}
            </Box>

            {/* Senha */}
            <Box style={{ marginBottom: 20 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
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
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  color: colors.subTitle,
                }}
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
      case 3:
        return (
          <Box>
            <Box>
              <ArrowLeft color={colors.primary} onPress={() => setStep(1)} />
            </Box>
            <Box style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                Escolha seu modelo de ativação
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.subTitle,
                }}
              >
                Finalize suas informações
              </Text>
            </Box>
            <HStack
              space="sm"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: 20,
              }}
            >
              {typeChipTabs.map((tab) => (
                <ThemeCard
                  key={tab.id}
                  title={tab.title}
                  icon={tab.icon}
                  active={activeTypeChipsTabs === tab.id}
                  onPress={() => setActiveTypeChipsTabs(tab.id)}
                />
              ))}
            </HStack>

            {activeTypeChipsTabs === 'simCard' && (
              <Box style={{ marginTop: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  ICCID do SIM Card
                </Text>

                <HStack style={{ alignItems: 'center', gap: 8 }}>
                  <Box style={{ flex: 1 }}>
                    <CustomInput
                      placeholder="Digite ou escaneie o ICCID"
                      value={iccidValue}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/\D/g, '').trim()
                        setIccidValue(cleaned)
                      }}
                      keyboardType="number-pad"
                      maxlength={20}
                      leftIcon={CardSim}
                      rightIcon={
                        isIccidValid !== null
                          ? isIccidValid
                            ? CheckCircle
                            : XCircle
                          : undefined
                      }
                    />
                  </Box>

                  <Button
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: 8,
                    }}
                    onPress={() => setShowScan(true)}
                  >
                    <ButtonIcon as={ScanBarcode} color={colors.textButton} />
                  </Button>
                </HStack>

                <Text
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: colors.subTitle,
                  }}
                >
                  ICCID é o número do código de barras do cartão do seu SIM
                  Card!
                </Text>

                {/* PROGRESS BAR PARA VALIDAÇÃO */}
                <ProgressBar
                  progress={0}
                  indeterminate={loadingIccid}
                  color={colors.primary}
                  style={{
                    marginTop: 5,
                    backgroundColor: colors.disabled,
                    borderRadius: 5,
                  }}
                />
              </Box>
            )}
          </Box>
        )
      case 4:
        return (
          <>
            <Box style={{ marginBottom: 20 }}>
              <ArrowLeft color={colors.primary} onPress={() => setStep(1)} />
            </Box>
            <Box style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                Escolha O melhor plano para você!
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.subTitle,
                  textAlign: 'center',
                }}
              >
                Nossa meta para você é o melhor custo e benefício baseado nos
                seus objetivos!
              </Text>
              <PlansCarousel />
            </Box>
          </>
        )
      default:
        return (
          <Box>
            <Box>
              <ArrowLeft
                color={colors.primary}
                onPress={() => dispatch(setMode('login'))}
              />
            </Box>
            <Box style={{ marginBottom: 32, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
              >
                Crie sua conta
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.subTitle,
                }}
              >
                Vamos fazer parte da melhor operadora 🚀
              </Text>
            </Box>
            <VStack space="md" style={{ marginBottom: 20 }}>
              <Text className="font-semibold" style={{ color: colors.text }}>
                A linha que deseja usar será para?
              </Text>
              <HStack
                space="sm"
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
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
            {activeTab === 'tab1' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  CPF
                </Text>
                <Controller
                  control={control}
                  name="cpf"
                  render={({ field: { value } }) => (
                    <CustomInput
                      placeholder="000.000.000-00"
                      value={value ? mask(value, ['999.999.999-99']) : value}
                      maxlength={14}
                      onChangeText={handleCpfChange}
                      leftIcon={User}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {errors.cpf && (
                  <Text style={{ color: 'red' }}>{errors.cpf.message}</Text>
                )}
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  Informe seu CPF para fornecermos uma experiêcia com maior
                  qualidade na sua etapa de cadastro!
                </Text>
              </Box>
            )}

            {activeTab === 'tab2' && (
              <Box style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  CNPJ
                </Text>
                <Controller
                  control={control}
                  name="cnpj"
                  render={({ field: { value } }) => (
                    <CustomInput
                      placeholder="00.000.000/0000-00"
                      value={
                        value ? mask(value, ['99.999.999/9999-99']) : value
                      }
                      maxlength={18}
                      onChangeText={handleCnpjChange}
                      leftIcon={Briefcase}
                      keyboardType="number-pad"
                    />
                  )}
                />
                {errors.cnpj && (
                  <Text style={{ color: 'red' }}>{errors.cnpj.message}</Text>
                )}
                <Text
                  style={{
                    marginBottom: 8,
                    fontSize: 14,
                    color: colors.subTitle,
                  }}
                >
                  Informe seu CNPJ para fornecermos uma experiêcia com maior
                  qualidade na sua etapa de cadastro!
                </Text>
              </Box>
            )}
          </Box>
        )
    }
  }

  return (
    <Box>
      {/* MODAL DO SCANNER */}
      <Portal>
        <Modal
          visible={showScan}
          onDismiss={() => setShowScan(false)}
          style={{ paddingHorizontal: 20, paddingVertical: 50 }}
        >
          <View
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 300,
              borderRadius: 10,
              borderWidth: 4,
              borderColor: colors.primary,
              overflow: 'hidden',
              backgroundColor: 'black',
            }}
          >
            <View
              style={{
                zIndex: 1,
                position: 'absolute',
                top: '50%',
                width: '80%',
                height: 2,
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 10,
                elevation: 5,
              }}
            />

            <CameraView
              onBarcodeScanned={showScan ? scanCode : undefined}
              barcodeScannerSettings={{
                barcodeTypes: ['code128', 'code39', 'ean13'],
              }}
              style={{
                position: 'absolute',
                height: height,
                width: width,
              }}
            />

            {/* BOTÃO FECHAR */}
            <View
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                zIndex: 2,
              }}
            >
              <IconButton
                icon={PanelRightCloseIcon}
                size={24}
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onPress={() => setShowScan(false)}
              />
            </View>

            {/* TEXTO INSTRUCIONAL */}
            <View
              style={{
                position: 'absolute',
                bottom: 50,
                alignSelf: 'center',
                zIndex: 2,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 20,
                }}
              >
                Aponte para o código de barras do chip
              </Text>
            </View>
          </View>
        </Modal>
      </Portal>

      {renderStep()}
    </Box>
  )
}
