import React, { useEffect, ReactNode } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { useAppSelector, useAppDispatch } from '../hooks'
import { setLoadingSystem } from '../slices/authSlice'

// ✅ Previne o splash screen de ser escondido automaticamente
SplashScreen.preventAutoHideAsync()

interface AuthProviderProps {
  children: ReactNode
}

// ✅ Provider simplificado - vamos implementar step-by-step
export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch()
  const { loadingSystem } = useAppSelector((state) => state.auth)

  // ✅ Simulação simples de inicialização - FUNCIONAL
  const loadApp = async () => {
    try {
      console.log('🚀 Inicializando aplicação...')

      // Simular carregamento (2 segundos)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Por enquanto, apenas marcar como carregado
      dispatch(setLoadingSystem(false))

      console.log('✅ Aplicação inicializada com sucesso')
    } catch (error) {
      console.error('❌ Erro ao inicializar aplicação:', error)
      dispatch(setLoadingSystem(false))
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

  // ✅ Usar React.Fragment explícito
  return React.createElement(React.Fragment, null, children)
}
