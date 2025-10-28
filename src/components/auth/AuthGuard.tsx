// src/components/auth/AuthGuard.tsx
import React, { useEffect, useRef } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const {
    isAuthenticated,
    isCheckingAuth,
    loadingSystem,
    checkAuthentication,
  } = useAuth()

  const segments = useSegments()
  const router = useRouter()
  const hasInitialized = useRef(false)
  const hasLoggedOut = useRef(false)

  // Verificar autenticação ao montar o componente - APENAS UMA VEZ
  // Nota: getCompanyInfo já foi chamado no CompanyInfoLoader
  useEffect(() => {
    if (hasInitialized.current) return
    hasInitialized.current = true

    checkAuthentication()
    // eslint-disable-next-line
  }, [])

  // Gerenciar redirecionamento baseado no estado de autenticação
  useEffect(() => {
    // Não fazer nada enquanto está verificando
    if (isCheckingAuth || loadingSystem) return

    const inAuthGroup = segments[0] === '(auth)'

    if (isAuthenticated && inAuthGroup) {
      // Usuário autenticado tentando acessar tela de login
      router.replace('/(tabs)/(home)')
    } else if (!isAuthenticated && !inAuthGroup) {
      // Usuário não autenticado tentando acessar área protegida
      router.replace('/(auth)/entrar')
    }
    // eslint-disable-next-line
  }, [isAuthenticated, segments, isCheckingAuth, loadingSystem])

  useEffect(() => {
    if (!isAuthenticated && hasInitialized.current) {
      hasLoggedOut.current = true
    }
  }, [isAuthenticated])

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth || loadingSystem) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="red" />
      </View>
    )
  }

  return <>{children}</>
}
