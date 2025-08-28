import { useRouter } from 'expo-router'
import { Alert, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAppSelector, useAppDispatch } from '../hooks'
import {
  clearUser,
  setLoadingAuth,
  setLoadingSystem,
  setUser,
  setCompanyInfo,
  setError,
} from '../slices/authSlice'
import {
  useLoginMutation,
  useGetCompanyInfoQuery,
  useLazyGetCompanyInfoQuery,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} from '@/src/api/endpoints/AuthApi'
import { env } from '@/config/env'

// ✅ Helper para mostrar alertas/toasts (adaptar depois)
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  console.log(`Toast ${type}:`, message)
  // TODO: Implementar Toast real depois
  // Toast.show({ text1: message, type });
}

// ✅ Helper para abrir URLs
const openUrl = (url: string) => {
  console.log('Opening URL:', url)
  // TODO: Implementar abertura de URL real depois
}

// ✅ Hook principal useAuth - API compatível com o código original
export function useAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // ✅ RTK Query hooks
  const [loginMutation] = useLoginMutation()
  const [getCompanyInfoQuery] = useLazyGetCompanyInfoQuery()
  const [forgotPasswordMutation] = useForgotPasswordMutation()
  const [changePasswordMutation] = useChangePasswordMutation()

  // ✅ Selectors do Redux
  const {
    user,
    isAuthenticated,
    companyInfo,
    loadingSystem,
    loadingAuth,
    error,
  } = useAppSelector((state) => state.auth)

  // ✅ Função para verificar se app está atualizado
  const isAppUpdated = (companyInfo: any) => {
    if (!companyInfo?.appversion || env.APP_VERSION >= companyInfo?.appversion)
      return true

    Alert.alert(
      'Seu aplicativo está desatualizado!',
      'Atualize-o para ter a melhor experiência e continuar utilizando o app!',
      [
        {
          text: 'Suporte',
          onPress: () => {
            openUrl(companyInfo?.link_chat || '')
          },
        },
        {
          text: 'Atualizar',
          onPress: () => {
            const linkLoja =
              Platform.OS === 'ios'
                ? companyInfo?.link_appstore
                : companyInfo?.link_playstore
            openUrl(linkLoja || '')
          },
        },
      ],
    )
    return false
  }

  // ✅ Buscar informações da empresa
  const getCompanyInfoData = async () => {
    try {
      dispatch(setLoadingSystem(true))

      const result = await getCompanyInfoQuery({
        companyid: env.COMPANY_ID,
        token: env.ACCESS_TK,
        app: 'reqtk',
      })

      if ('error' in result) {
        throw new Error('Erro ao carregar informações da empresa')
      }

      const companyData = result.data
      if (companyData) {
        dispatch(setCompanyInfo(companyData))
      }

      // TODO: Aplicar tema quando tiver ThemeContext
      // let tema = JSON.parse(companyData.appTheme);
      // setUserTheme((p) => ({ ...p, ...tema }));

      const isUpdated = isAppUpdated(companyData)
      dispatch(setLoadingSystem(false))

      return isUpdated
    } catch (error: any) {
      dispatch(setLoadingSystem(false))
      dispatch(
        setError(
          'Não foi possível carregar as informações do app. Verifique sua conexão.',
        ),
      )
      Alert.alert(
        'Erro',
        'Não foi possível carregar as informações do app. Por favor verifique sua conexão com a internet.',
      )
      return false
    }
  }

  // ✅ Login do usuário - mantém API original
  const signIn = async (
    cpf: string,
    senha: string,
    latitude: string,
    longitude: string,
    acao_realizada: string,
    tipo_login: string,
  ) => {
    dispatch(setLoadingAuth(true))

    try {
      const result = await loginMutation({
        cpf,
        password: senha,
        // TODO: Adicionar quando disponível
        expoPushToken: '', // expoPushToken,
        modelName: '', // modelName,
        companyid: env.COMPANY_ID,
        latitude,
        longitude,
        acao_realizada,
        tipo_login,
      })

      if ('error' in result) {
        const error = result.error as any
        dispatch(setLoadingAuth(false))

        // Tratamento de erros específicos
        if (error.status === 550) {
          return showToast('Senha incorreta!', 'error')
        }
        if (error.status === 551) {
          return showToast('CPF/CNPJ não encontrado!', 'error')
        }

        return showToast('Erro ao logar!', 'error')
      }

      const userData = result.data

      // Perfil está excluído
      if (userData.profileid === 5) {
        dispatch(setLoadingAuth(false))
        return showToast('CPF/CNPJ não encontrado!', 'error')
      }

      // Salvar usuário no Redux
      dispatch(setUser(userData))

      // Salvar credenciais no storage
      await AsyncStorage.setItem(
        'usr_c',
        JSON.stringify({ cpf: cpf, password: senha }),
      )

      // Finalizar login
      await finalizarLogin(userData)
    } catch (error: any) {
      console.error('Login error:', error)
      dispatch(setLoadingAuth(false))
      showToast('Erro ao logar!', 'error')
    }
  }

  // ✅ Finalizar login - lógica original
  const finalizarLogin = async (res: any) => {
    dispatch(setLoadingAuth(false))

    if (!!res.primeiroAcesso) {
      router.push('/alterar-senha-primeiro-acesso' as any)
      return
    }

    router.push('/' as any)
  }

  // ✅ Logout do usuário
  const signOut = async () => {
    dispatch(clearUser())
    await AsyncStorage.removeItem('usr_c')
    router.push('/bem-vindo' as any)
  }

  // ✅ Esqueci a senha - API original
  const forgotPassword = async (cpf: string) => {
    dispatch(setLoadingAuth(true))

    try {
      const result = await forgotPasswordMutation({ cpf })

      if ('error' in result) {
        const error = result.error as any
        dispatch(setLoadingAuth(false))

        if (error.status === 501) {
          return showToast(
            'Aguarde 5 minutos antes de tentar novamente!',
            'error',
          )
        }

        return showToast('Erro ao solicitar recuperação de senha!', 'error')
      }

      showToast(
        'Recuperação de senha solicitada! Confira seu email ou SMS para mais informações!',
        'success',
      )
      dispatch(setLoadingAuth(false))
      router.push('/entrar' as any)
    } catch (error: any) {
      console.error('Forgot password error:', error)
      dispatch(setLoadingAuth(false))
      showToast('Erro ao solicitar recuperação de senha!', 'error')
    }
  }

  // ✅ Alterar senha - API original
  const changePassword = async (newPassword: string) => {
    if (!user) {
      showToast('Usuário não logado!', 'error')
      return
    }

    dispatch(setLoadingAuth(true))

    try {
      const result = await changePasswordMutation({
        token: user.token,
        cpf: user.cpf,
        password: newPassword,
      })

      if ('error' in result) {
        dispatch(setLoadingAuth(false))
        return showToast('Erro ao alterar senha!', 'error')
      }

      dispatch(setLoadingAuth(false))
      showToast('Senha alterada!', 'success')
      router.push('/' as any)
    } catch (error) {
      console.error('Change password error:', error)
      dispatch(setLoadingAuth(false))
      showToast('Erro ao alterar senha!', 'error')
    }
  }

  // ✅ Setter para loadingAuth (compatibilidade)
  const setLoadingAuthState = (loading: boolean) => {
    dispatch(setLoadingAuth(loading))
  }

  // ✅ Computed values do código original
  const isClientePj = user?.profileid === 3 && user?.cpf?.length > 11
  const isDeleted = user?.profileid === 5
  const userInfoString = JSON.stringify({
    cpf: user?.cpf,
    name: user?.name,
    parceiro: user?.parceiro,
  })

  // ✅ Interface EXATAMENTE igual ao Context original
  return {
    // Funções principais - API idêntica ao código original
    signIn,
    signOut,
    forgotPassword,
    changePassword,
    finalizarLogin,

    // Estados - API idêntica ao código original
    user,
    companyInfo,
    loadingSystem,
    loadingAuth,

    // Setter - API idêntica ao código original
    setLoadingAuth: setLoadingAuthState,

    // Estados computados - extras úteis
    isAuthenticated,
    isClientePj,
    isDeleted,
    userInfoString,
    error,

    // Função utilitária
    getCompanyInfo: getCompanyInfoData,
  }
}
