// src/store/hooks/useAuth.ts
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'
import { useAppSelector, useAppDispatch } from '@/src/store/hooks'
import {
  clearUser,
  setLoadingAuth,
  setLoadingSystem,
  setCheckingAuth,
  setUser,
  setCompanyInfo,
  setError,
  resetAuthState,
} from '@/src/store/slices/authSlice'
import {
  useLoginMutation,
  useLazyGetCompanyInfoQuery,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} from '@/src/api/endpoints/AuthApi'
import { env } from '@/config/env'
import SecureStorage from '@/services/secureStorage'

// Helper para toasts
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  console.log(`Toast ${type}:`, message)
  Alert.alert(type === 'error' ? 'Erro' : 'Sucesso', message)
}

export function useAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()

  // RTK Query hooks
  const [loginMutation] = useLoginMutation()
  const [getCompanyInfoQuery] = useLazyGetCompanyInfoQuery()
  const [forgotPasswordMutation] = useForgotPasswordMutation()
  const [changePasswordMutation] = useChangePasswordMutation()

  // Selectors do Redux
  const {
    user,
    isAuthenticated,
    companyInfo,
    loadingSystem,
    loadingAuth,
    isCheckingAuth,

    error,
  } = useAppSelector((state) => state.auth)

  // Verificar autenticação ao inicializar
  const checkAuthentication = async (force = false) => {
    if (!force && isAuthenticated) return

    dispatch(setCheckingAuth(true))

    try {
      // Verificar se tem token salvo
      const token = await SecureStorage.getToken()
      const userData = await SecureStorage.getUserData()

      if (token && userData) {
        // Validar token com o backend (opcional)
        // Se válido, restaurar sessão
        dispatch(setUser({ ...userData, token }))
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      dispatch(setCheckingAuth(false))
    }
  }

  // Buscar informações da empresa com retry logic
  const getCompanyInfo = async (retryCount = 0) => {
    try {
      console.log('🏢 Carregando informações da empresa...')
      dispatch(setLoadingSystem(true))

      const result = await getCompanyInfoQuery({
        companyid: env.COMPANY_ID,
        token: env.ACCESS_TK,
        app: 'reqtk',
      })

      if ('error' in result) {
        const error = result.error as any

        // Se for erro 429 (rate limit), aguardar e tentar novamente
        if (error?.status === 429 && retryCount < 3) {
          const retryAfter = error?.data?.retry_after || 30
          console.log(
            `⏳ Rate limit atingido. Aguardando ${retryAfter} segundos...`,
          )

          // Aguardar o tempo necessário
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000))

          // Tentar novamente
          return getCompanyInfo(retryCount + 1)
        }

        throw new Error('Erro ao carregar informações da empresa')
      }

      const companyData = result.data
      if (companyData) {
        dispatch(setCompanyInfo(companyData))
        console.log('✅ Informações da empresa carregadas')
      }

      dispatch(setLoadingSystem(false))
      return true
    } catch (error: any) {
      console.error('❌ Erro ao carregar company info:', error)
      dispatch(setLoadingSystem(false))

      // Não bloquear o app se falhar ao carregar info da empresa
      // Pode continuar funcionando com configurações padrão
      console.warn('⚠️ Continuando sem informações da empresa...')
      return false
    }
  }

  // Login
  const signIn = async (
    cpf: string,
    senha: string,
    rememberMe: boolean = false,
    latitude: string = '0',
    longitude: string = '0',
    acao_realizada: string = 'login',
    tipo_login: string = 'app',
  ) => {
    dispatch(setLoadingAuth(true))

    try {
      const result = await loginMutation({
        cpf,
        password: senha,
        expoPushToken: '',
        modelName: '',
        companyid: env.COMPANY_ID,
        latitude,
        longitude,
        acao_realizada,
        tipo_login,
      })

      if ('error' in result) {
        const error = result.error as any
        dispatch(setLoadingAuth(false))

        if (error.status === 550) {
          return showToast('Senha incorreta!', 'error')
        }
        if (error.status === 551) {
          return showToast('CPF/CNPJ não encontrado!', 'error')
        }
        return showToast('Erro ao fazer login!', 'error')
      }

      const userData = result.data

      if (userData.profileid === 5) {
        dispatch(setLoadingAuth(false))
        return showToast('Usuário inativo!', 'error')
      }

      // Salvar token de forma segura
      await SecureStorage.saveToken(userData.token)

      // Salvar dados do usuário
      await SecureStorage.saveUserData({
        cpf: userData.cpf,
        name: userData.name,
        email: userData.email,
        profileid: userData.profileid,
        parceiro: userData.parceiro,
      })

      // Salvar credenciais se "Lembrar-me" estiver marcado
      if (rememberMe) {
        await SecureStorage.saveRememberMe(cpf, senha)
      } else {
        await SecureStorage.clearRememberMe()
      }

      dispatch(setUser(userData))
      dispatch(setLoadingAuth(false))

      if (userData.primeiroAcesso) {
        router.replace('/alterar-senha-primeiro-acesso' as any)
      } else {
        router.replace('/(tabs)/(home)' as any)
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      dispatch(setLoadingAuth(false))
      showToast('Erro ao fazer login!', 'error')
    }
  }

  // Logout
  const signOut = async () => {
    dispatch(setLoadingAuth(true))
    console.log('Iniciando logout...')

    try {
      // Limpar dados seguros com timeout
      const clearStoragePromise = SecureStorage.clearAll()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000),
      )

      await Promise.race([clearStoragePromise, timeoutPromise])
      console.log('Storage limpo com sucesso')
    } catch (error) {
      console.error('Erro ao limpar storage:', error)
      // Continua mesmo se falhar
    }

    try {
      await SecureStorage.clearAll()

      // Limpar estado do Redux
      dispatch(resetAuthState())

      // ✅ FORÇA todos os loadings como false
      dispatch(setCheckingAuth(false))
      dispatch(setLoadingSystem(false))
      dispatch(setLoadingAuth(false))

      router.replace('/(auth)/entrar' as any)
    } catch (error) {
      console.error('Erro:', error)
      dispatch(setLoadingAuth(false))
      dispatch(setCheckingAuth(false))
      dispatch(setLoadingSystem(false))
    }
  }

  // Esqueci senha
  const forgotPassword = async (cpf: string) => {
    dispatch(setLoadingAuth(true))

    try {
      const result = await forgotPasswordMutation({ cpf })

      if ('error' in result) {
        dispatch(setLoadingAuth(false))
        return showToast('Erro ao solicitar recuperação!', 'error')
      }

      showToast('Instruções enviadas para seu email/SMS!', 'success')
      dispatch(setLoadingAuth(false))
      router.push('/(auth)/entrar' as any)
    } catch (error: any) {
      dispatch(setLoadingAuth(false))
      showToast('Erro ao solicitar recuperação!', 'error')
    }
  }

  // Alterar senha
  const changePassword = async (newPassword: string) => {
    if (!user) {
      return showToast('Usuário não autenticado!', 'error')
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
      showToast('Senha alterada com sucesso!', 'success')
      router.replace('/(tabs)/(home)' as any)
    } catch (error) {
      dispatch(setLoadingAuth(false))
      showToast('Erro ao alterar senha!', 'error')
    }
  }

  // Estados computados
  const isClientePj = user?.profileid === 3 && user?.cpf?.length > 11

  return {
    // Estados
    user,
    companyInfo,
    loadingSystem,
    loadingAuth,
    isCheckingAuth,
    isAuthenticated,
    error,

    // Funções
    signIn,
    signOut,
    forgotPassword,
    changePassword,
    getCompanyInfo,
    checkAuthentication,

    // Estados computados
    isClientePj,
  }
}
