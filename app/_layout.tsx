// app/_layout.tsx
import '@/global.css'
import React, { useContext, useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { useColorScheme } from 'nativewind'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'

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
import {
  useWhitelabelTheme,
  WhitelabelThemeProvider,
} from '@/contexts/theme-context/whitelabel-the,e-context'
import { PaperProvider } from 'react-native-paper'
import AuthGuard from '@/src/components/auth/AuthGuard'
import DevTools from '@/components/DevTools'
import { useAuth } from '@/hooks/useAuth'
import { ActivityIndicator, View } from 'react-native'

// Componente para carregar informações da empresa ANTES de tudo
const CompanyInfoLoader = ({ children }: { children: React.ReactNode }) => {
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

const MainLayout = () => {
  const { colorMode }: any = useContext(ThemeContext)
  const { setColorScheme } = useColorScheme()

  const [fontsLoaded] = useFonts({
    'dm-sans-regular': DMSans_400Regular,
    'dm-sans-medium': DMSans_500Medium,
    'dm-sans-bold': DMSans_700Bold,
  })

  // Sincronizar colorMode do ThemeContext com o NativeWind
  useEffect(() => {
    setColorScheme(colorMode)
  }, [colorMode, setColorScheme])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GluestackUIProvider config={createCustomConfig} colorMode={colorMode}>
      <BottomSheetModalProvider>
        <StatusBar style="light" translucent />
        <AuthProvider>
          <CompanyInfoLoader>
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
          <WhitelabelThemeProvider>
            <PaperProvider>
              <MainLayout />
              <Toast />
              <DevTools />
            </PaperProvider>
          </WhitelabelThemeProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  )
}
