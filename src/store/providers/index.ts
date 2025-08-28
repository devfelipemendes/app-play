import React, { useEffect, ReactNode } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { useAuth } from '../hooks/useAuth'

// ✅ Previne o splash screen de ser escondido automaticamente
SplashScreen.preventAutoHideAsync()

interface AuthProviderProps {
  children: ReactNode
}

// ✅ Provider que replica a lógica de inicialização do Context original
export default function AuthProvider({ children }: AuthProviderProps) {
  const { loadingSystem, getCompanyInfo } = useAuth()

  // ✅ Carrega todas as informações necessárias pro app funcionar antes de sair da SplashScreen
  const loadApp = async () => {
    try {
      console.log('🚀 Inicializando aplicação...')

      if (getCompanyInfo) {
        const companyInfoLoaded = await getCompanyInfo()

        if (!companyInfoLoaded) {
          console.warn('⚠️ Falha ao carregar informações da empresa')
          return
        }
      }

      console.log('✅ Aplicação inicializada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error)
    }
  }

  // ✅ Effect para carregar app na inicialização
  useEffect(() => {
    loadApp()
  }, [])

  // ✅ Esconde splash screen quando terminar de carregar
  useEffect(() => {
    async function hideSplash() {
      if (!loadingSystem) {
        console.log('🎬 Escondendo splash screen...')
        await SplashScreen.hideAsync()
      }
    }

    hideSplash()
  }, [loadingSystem])

  // ✅ Mantém splash screen visível enquanto carrega
  if (loadingSystem) {
    return null // Splash screen continua visível
  }

  // ✅ Usar React.Fragment explícito em vez de <>
  return React.createElement(React.Fragment, null, children)
}
