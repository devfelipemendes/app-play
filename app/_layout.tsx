// app/_layout.tsx
import '@/global.css'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import * as SplashScreen from 'expo-splash-screen'

import { ThemeContext, ThemeProvider } from '@/contexts/theme-context'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'

import { Provider } from 'react-redux'
import { store } from '@/src/store'
import AuthProvider from '@/src/store/providers'
import Toast from 'react-native-toast-message'

import { createCustomConfig } from '@/config/theme'
import { PaperProvider } from 'react-native-paper'
import AuthGuard from '@/src/components/auth/AuthGuard'
import DevTools from '@/components/DevTools'
import { useAuth } from '@/hooks/useAuth'
import { ActivityIndicator, View } from 'react-native'

// ⭐ SDK 52: Prevenir que a splash suma automaticamente
// Isso garante que a splash screen (configurada por parceiro) fique visível
// até que o app esteja completamente carregado (fontes + company info)
SplashScreen.preventAutoHideAsync().catch(() => {
  // Em alguns casos (web), pode não estar disponível
  console.log('SplashScreen.preventAutoHideAsync não disponível')
})

// Componente para carregar informações da empresa ANTES de tudo
const CompanyInfoLoader = ({
  children,
  onLoadComplete,
}: {
  children: React.ReactNode
  onLoadComplete?: () => void
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const { getCompanyInfo } = useAuth()

  useEffect(() => {
    const loadCompanyInfo = async () => {
      try {
        console.log('🏢 Carregando informações da empresa (whitelabel)...')
        await getCompanyInfo()
        console.log('✅ Informações da empresa carregadas com sucesso')
      } catch (error) {
        console.error('❌ Erro ao carregar informações da empresa:', error)
      } finally {
        setIsLoading(false)
        // Notifica que terminou de carregar
        onLoadComplete?.()
      }
    }

    loadCompanyInfo()
  }, [])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    )
  }

  return <>{children}</>
}

const MainLayout = ({ onAppReady }: { onAppReady: () => void }) => {
  const { colorMode }: any = useContext(ThemeContext)
  const { setColorScheme } = useColorScheme()
  const [companyInfoLoaded, setCompanyInfoLoaded] = useState(false)

  const [fontsLoaded] = useFonts({
    'dm-sans-regular': DMSans_400Regular,
    'dm-sans-medium': DMSans_500Medium,
    'dm-sans-bold': DMSans_700Bold,
  })

  // Sincronizar colorMode do ThemeContext com o NativeWind
  useEffect(() => {
    setColorScheme(colorMode)
  }, [colorMode, setColorScheme])

  // Callback quando company info terminar de carregar
  const handleCompanyInfoLoaded = useCallback(() => {
    setCompanyInfoLoaded(true)
  }, [])

  // Quando fontes E company info estiverem carregados, notificar que o app está pronto
  useEffect(() => {
    if (fontsLoaded && companyInfoLoaded) {
      console.log('✨ App totalmente carregado (fontes + company info)')
      // Pequeno delay para garantir que a UI está renderizada
      setTimeout(() => {
        onAppReady()
      }, 100)
    }
  }, [fontsLoaded, companyInfoLoaded, onAppReady])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GluestackUIProvider config={createCustomConfig} colorMode={colorMode}>
      <BottomSheetModalProvider>
        <StatusBar style="light" translucent />
        <AuthProvider>
          <CompanyInfoLoader onLoadComplete={handleCompanyInfoLoaded}>
            <AuthGuard>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </AuthGuard>
          </CompanyInfoLoader>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GluestackUIProvider>
  )
}

export default function RootLayout() {
  // Callback para ocultar a splash screen quando o app estiver totalmente pronto
  const handleAppReady = useCallback(async () => {
    try {
      console.log('🎉 Ocultando splash screen...')
      await SplashScreen.hideAsync()
      console.log('✅ Splash screen ocultada com sucesso')
    } catch (error) {
      console.warn('⚠️ Erro ao ocultar splash screen:', error)
    }
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <PaperProvider>
            <MainLayout onAppReady={handleAppReady} />
            <Toast />
          </PaperProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}
