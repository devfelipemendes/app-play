import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import InfoCard from '@/components/screens/settings/info-card'
import {
  User,
  Mail,
  CreditCard,
  AlertCircle,
  LogOut,
  Fingerprint,
  ScanFace,
  Eye,
  EyeOff,
} from 'lucide-react-native'
import { StatusBar } from 'expo-status-bar'
import {
  Alert,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  View,
  Keyboard,
} from 'react-native'
import Countdown, { CountdownRenderProps } from 'react-countdown'

import CustomHeader from '@/components/shared/custom-header'
import { useAuth } from '@/hooks/useAuth'
import { ThemeContext } from '@/contexts/theme-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { Pressable } from '@/components/ui/pressable'
import { useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import { maskCpf } from '@/src/utils/masks'
import {
  useDeleteAccountMutation,
  useDeleteLineByIccidMutation,
} from '@/src/api/endpoints/profileApi'
import { useGetUserLinesMutation } from '@/src/api/endpoints/verLinhas'
import Toast from 'react-native-toast-message'
import { useBiometricAuth } from '@/hooks/useBiometricAuth'
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { Icon } from '@/components/ui/icon'
import { useLoginMutation } from '@/src/api/endpoints/AuthApi'
import { CustomInput } from '@/components/layout/CustomInput'
import { LockKeyhole } from 'lucide-react-native'
import { TesteFaturaButton } from '@/src/components/screens/TesteFaturaButton'

const Settings = () => {
  const { colorMode }: any = useContext(ThemeContext)
  const { signOut, loadingAuth } = useAuth()
  const { colors } = useCompanyThemeSimple()

  // Pegar dados do usuário
  const user = useAppSelector((state: RootState) => state.auth.user)

  // Estados para deletar conta
  const [showCountdown, setShowCountdown] = useState(true)
  const [userLines, setUserLines] = useState<any[]>([])

  const [deleteAccount, { isLoading: loadingDelete }] =
    useDeleteAccountMutation()
  const [deleteLine] = useDeleteLineByIccidMutation()
  const [getUserLines, { isLoading: loadingLines }] = useGetUserLinesMutation()

  // Biometria
  const {
    isBiometricSupported,
    biometricType,
    hasStoredCredentials,
    removeCredentials,
    saveCredentials,
    checkStoredCredentials,
  } = useBiometricAuth()

  // Estados e ref para BottomSheet de ativação de biometria
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isValidating, setIsValidating] = useState(false)

  const [keyboardOpen, setKeyboardOpen] = useState(false)

  // Mutation para validar senha
  const [loginMutation] = useLoginMutation()

  // Buscar linhas do usuário quando o componente montar
  useEffect(() => {
    if (user?.token && user?.cpf) {
      getUserLines({
        parceiro: user.parceiro || '',
        token: user.token,
        cpf: user.cpf,
        franquiado: user.companyid || 0,
        isApp: true,
        usuario_atual: user.cpf,
      })
        .unwrap()
        .then((lines) => {
          setUserLines(lines)
        })
        .catch((error) => {
          console.error('Erro ao buscar linhas:', error)
        })
    }
  }, [user?.token, user?.cpf])

  const handleDeleteAccount = async () => {
    if (!user?.token || !user?.cpf) {
      Alert.alert('Erro', 'Dados do usuário não encontrados')
      return
    }

    Alert.alert(
      'Deletar conta?',
      'Essa ação é irreversível! Tem certeza de que deseja prosseguir com a ação?',
      [
        {
          text: 'Não, cliquei por engano.',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Deletar conta
              await deleteAccount({
                token: user.token,
                cpf: user.cpf,
                profileid: '5',
              }).unwrap()

              // Deletar linhas
              if (userLines?.length) {
                for (const line of userLines) {
                  if (line.iccid && parseInt(line.iccid) > 0) {
                    await deleteLine({
                      token: user.token,
                      iccid: line.iccid,
                    }).unwrap()
                  }
                }
              }

              Toast.show({
                type: 'success',
                text1: 'Conta excluída com sucesso!',
                text2: 'Você será desconectado.',
              })

              setTimeout(() => {
                signOut()
              }, 1500)
            } catch (error: any) {
              console.error('Erro ao deletar conta:', error)
              Toast.show({
                type: 'error',
                text1: 'Erro ao excluir conta',
                text2: error.data?.message || 'Tente novamente mais tarde',
              })
            }
          },
        },
      ],
    )
  }

  const handleToggleBiometric = async () => {
    if (hasStoredCredentials) {
      // Desabilitar biometria
      Alert.alert(
        'Desabilitar Biometria',
        `Deseja remover o acesso com ${biometricType}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              const removed = await removeCredentials()
              if (removed) {
                Toast.show({
                  type: 'success',
                  text1: 'Biometria removida',
                  text2: 'Você precisará fazer login novamente.',
                })
              }
            },
          },
        ],
      )
    } else {
      // Abrir BottomSheet para pedir senha e ativar biometria
      setPassword('')
      bottomSheetRef.current?.present()
    }
  }

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text)
  }, [])

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const handleDismissBottomSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss()
  }, [])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  )

  const snapPoints = useMemo(
    () => (keyboardOpen ? ['80%'] : ['50%']),
    [keyboardOpen],
  )

  const handleEnableBiometric = useCallback(async () => {
    if (!password || !user?.cpf) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, digite sua senha',
      })
      return
    }

    setIsValidating(true)

    try {
      // Validar senha fazendo login
      const result = await loginMutation({
        cpf: user.cpf,
        password: password,
      }).unwrap()

      // Se chegou aqui, a senha está correta
      // Salvar credenciais
      const saved = await saveCredentials(user.cpf, password)

      if (saved) {
        Toast.show({
          type: 'success',
          text1: 'Biometria ativada!',
          text2: `Agora você pode usar ${biometricType} para login`,
        })
        bottomSheetRef.current?.dismiss()
        setPassword('')
        await checkStoredCredentials()
      } else {
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar',
          text2: 'Não foi possível ativar a biometria',
        })
      }
    } catch (error) {
      console.error('Erro ao validar senha:', error)
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Ocorreu um erro ao validar a senha',
      })
    } finally {
      setIsValidating(false)
    }
  }, [
    password,
    user?.cpf,
    loginMutation,
    saveCredentials,
    checkStoredCredentials,
    biometricType,
  ])

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true)
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return (
    <>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <VStack space="md" className=" dark:bg-gray-900 flex-1">
          <StatusBar style="light" />
          <CustomHeader
            variant="general"
            title="Perfil"
            description="Gerencie seu Perfil"
          />

          {/* Informações Pessoais */}
          <VStack className="px-4" space="md">
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Informações Pessoais
            </Text>

            <InfoCard title="Nome" content={user?.name || '-'} icon={User} />
            <InfoCard
              title="CPF"
              content={maskCpf(user?.cpf) || '-'}
              icon={CreditCard}
            />
            <InfoCard title="Email" content={user?.email || '-'} icon={Mail} />
          </VStack>

          {/* Segurança e Biometria */}
          {isBiometricSupported && (
            <VStack className="px-4" space="md" style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                Segurança
              </Text>

              <TouchableOpacity
                onPress={handleToggleBiometric}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.24,
                  shadowRadius: 3,
                  elevation: 4,
                }}
              >
                <HStack
                  style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <HStack space="md" style={{ alignItems: 'center', flex: 1 }}>
                    <HStack
                      style={{
                        backgroundColor: colors.primary + '15',
                        padding: 10,
                        borderRadius: 12,
                      }}
                    >
                      {biometricType?.toLowerCase().includes('face') ? (
                        <ScanFace size={24} color={colors.primary} />
                      ) : (
                        <Fingerprint size={24} color={colors.primary} />
                      )}
                    </HStack>
                    <VStack style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: colors.text,
                          marginBottom: 2,
                        }}
                      >
                        {biometricType}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.subTitle,
                        }}
                      >
                        {hasStoredCredentials
                          ? 'Acesso rápido habilitado'
                          : 'Acesso rápido desabilitado'}
                      </Text>
                    </VStack>
                  </HStack>
                  <Switch
                    value={hasStoredCredentials}
                    onValueChange={handleToggleBiometric}
                    trackColor={{
                      false: '#767577',
                      true: colors.primary + '80',
                    }}
                    thumbColor={
                      hasStoredCredentials ? colors.primary : '#f4f3f4'
                    }
                  />
                </HStack>
              </TouchableOpacity>
            </VStack>
          )}

          {/* Deletar Conta */}
          <VStack className="px-4" space="md" style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Zona de Perigo
            </Text>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={showCountdown || loadingDelete}
              style={{
                backgroundColor: showCountdown ? colors.disabled : '#EF4444',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                opacity: loadingDelete ? 0.6 : 1,
              }}
            >
              <HStack
                style={{ alignItems: 'center', justifyContent: 'center' }}
                space="sm"
              >
                <AlertCircle size={20} color="white" />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: 'white',
                    textAlign: 'center',
                  }}
                >
                  {loadingDelete ? 'Excluindo...' : 'Deletar Conta'}
                </Text>
              </HStack>
            </TouchableOpacity>

            {showCountdown && (
              <Countdown
                date={Date.now() + 20000}
                renderer={({ seconds }: CountdownRenderProps) => (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.subTitle,
                      textAlign: 'center',
                    }}
                  >
                    Faltam {seconds} segundos para a ação ser liberada.
                  </Text>
                )}
                onComplete={() => setShowCountdown(false)}
              />
            )}

            <Text
              style={{
                fontSize: 12,
                color: colors.subTitle,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              ATENÇÃO! Ao deletar sua conta todas as suas linhas serão excluídas
              e você perderá o acesso ao app.
            </Text>
          </VStack>

          {/* Seção de Desenvolvimento/Teste */}
          {/* {__DEV__ && (
            <VStack className="px-4" style={{ marginTop: 32 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Desenvolvimento
              </Text>
              <TesteFaturaButton />
            </VStack>
          )} */}

          {/* Botão Sair */}
          <VStack className="px-4" style={{ marginTop: 32, marginBottom: 32 }}>
            <Pressable
              onPress={signOut}
              disabled={loadingAuth}
              style={{
                backgroundColor: colors.background,
                borderWidth: 2,
                borderColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 16,
                opacity: loadingAuth ? 0.6 : 1,
              }}
            >
              <HStack
                style={{ alignItems: 'center', justifyContent: 'center' }}
                space="sm"
              >
                <LogOut size={20} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.primary,
                    textAlign: 'center',
                  }}
                >
                  {loadingAuth ? 'Saindo...' : 'Sair'}
                </Text>
              </HStack>
            </Pressable>
          </VStack>
        </VStack>
      </ScrollView>

      {/* BottomSheet para ativar biometria */}
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={() => {
          setPassword('')
          setShowPassword(false)
        }}
      >
        <View style={{ flex: 1, padding: 24 }}>
          {/* Header */}
          <View style={{ gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <Icon
              as={
                biometricType?.toLowerCase().includes('face')
                  ? ScanFace
                  : Fingerprint
              }
              size="xl"
              style={{ color: colors.primary }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: colors.text,
                textAlign: 'center',
              }}
            >
              Ativar {biometricType}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.secondary,
                textAlign: 'center',
              }}
            >
              Digite sua senha para habilitar o acesso rápido
            </Text>
          </View>

          {/* Campo de senha */}
          <View style={{ marginBottom: 20 }}>
            <CustomInput
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              leftIcon={LockKeyhole}
              rightIcon={showPassword ? EyeOff : Eye}
              onEndIconPress={handleTogglePassword}
              editable={!isValidating}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleEnableBiometric}
            />
          </View>

          {/* Botões */}
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleEnableBiometric}
              disabled={isValidating || !password}
              activeOpacity={0.7}
              style={{
                backgroundColor:
                  isValidating || !password
                    ? colors.secondary + '40'
                    : colors.primary,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              {isValidating ? (
                <ActivityIndicator color={colors.textButton} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.textButton,
                  }}
                >
                  Ativar Biometria
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismissBottomSheet}
              disabled={isValidating}
              activeOpacity={0.7}
              style={{
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.secondary,
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    </>
  )
}

export default Settings
