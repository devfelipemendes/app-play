// src/store/hooks/useAuth.ts - VERSÃO FUNCIONAL SIMPLES
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
  useLazyGetCompanyInfoQuery,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} from '@/src/api/endpoints/AuthApi'
import { env } from '@/config/env'

// ✅ Helper temporário para toasts
const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  console.log(`Toast ${type}:`, message)
  Alert.alert(type === 'error' ? 'Erro' : 'Sucesso', message)
}

// ✅ Hook useAuth - versão funcional básica
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

  // ✅ Buscar informações da empresa - FUNCIONAL
  const getCompanyInfo = async () => {
    try {
      console.log('🏢 Carregando informações da empresa...')
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
        console.log('✅ Informações da empresa carregadas')
      }

      dispatch(setLoadingSystem(false))
      return true
    } catch (error: any) {
      console.error('❌ Erro ao carregar company info:', error)
      dispatch(setLoadingSystem(false))
      dispatch(setError('Erro ao carregar informações da empresa'))
      return false
    }
  }

  // ✅ Login - versão simplificada e funcional
  const signIn = async (
    cpf: string,
    senha: string,
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
        return showToast('Erro ao logar!', 'error')
      }

      const userData = result.data

      if (userData.profileid === 5) {
        dispatch(setLoadingAuth(false))
        return showToast('CPF/CNPJ não encontrado!', 'error')
      }

      dispatch(setUser(userData))
      await AsyncStorage.setItem(
        'usr_c',
        JSON.stringify({ cpf, password: senha }),
      )

      dispatch(setLoadingAuth(false))

      if (userData.primeiroAcesso) {
        router.push('/alterar-senha-primeiro-acesso' as any)
      } else {
        router.push('/' as any)
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      dispatch(setLoadingAuth(false))
      showToast('Erro ao logar!', 'error')
    }
  }

  // ✅ Logout
  const signOut = async () => {
    dispatch(setLoadingAuth(true))
    try {
      dispatch(clearUser())
      await AsyncStorage.removeItem('usr_c')
      router.push('/' as any)
    } finally {
      dispatch(setLoadingAuth(false))
    }
  }

  // ✅ Esqueci senha
  const forgotPassword = async (cpf: string) => {
    dispatch(setLoadingAuth(true))

    try {
      const result = await forgotPasswordMutation({ cpf })

      if ('error' in result) {
        dispatch(setLoadingAuth(false))
        return showToast('Erro ao solicitar recuperação!', 'error')
      }

      showToast('Recuperação solicitada! Verifique seu email/SMS.', 'success')
      dispatch(setLoadingAuth(false))
      router.push('/entrar' as any)
    } catch (error: any) {
      dispatch(setLoadingAuth(false))
      showToast('Erro ao solicitar recuperação!', 'error')
    }
  }

  // ✅ Alterar senha
  const changePassword = async (newPassword: string) => {
    if (!user) {
      return showToast('Usuário não logado!', 'error')
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
      router.push('/' as any)
    } catch (error) {
      dispatch(setLoadingAuth(false))
      showToast('Erro ao alterar senha!', 'error')
    }
  }

  // ✅ Estados computados
  const isClientePj = user?.profileid === 3 && user?.cpf?.length > 11

  // ✅ Return - API simples e funcional
  return {
    // Estados principais
    user,
    companyInfo,
    loadingSystem,
    loadingAuth,
    isAuthenticated,
    error,

    // Funções principais
    signIn,
    signOut,
    forgotPassword,
    changePassword,
    getCompanyInfo, // ✅ Agora existe e é funcional

    // Setters
    setLoadingAuth: (loading: boolean) => dispatch(setLoadingAuth(loading)),

    // Estados computados
    isClientePj,
  }
}
