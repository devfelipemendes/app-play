// app/_layout.tsx - Versão mais simples sem conflitos
import '@/global.css'
import React, { useContext, useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { config } from '@gluestack-ui/config'

import { ThemeContext, ThemeProvider } from '@/contexts/theme-context'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'

import { Provider } from 'react-redux'
import { store } from '@/src/store'
import AuthProvider from '@/src/store/providers'
import { useAuth } from '@/src/store/hooks/useAuth'

// Novo contexto para tema whitelabel (separado do existente)

import { createCustomConfig } from '@/config/theme'
import {
  useWhitelabelTheme,
  WhitelabelThemeProvider,
} from '@/contexts/theme-context/whitelabel-the,e-context'

// Componente para carregar tema da empresa
const CompanyThemeLoader = ({ children }: { children: React.ReactNode }) => {
  const { loadTheme } = useWhitelabelTheme()

  // Aqui você carregaria os dados da empresa do Redux
  // const companyData = useSelector(state => state.company.data)

  useEffect(() => {
    // Simular carregamento dos dados da empresa
    const mockCompanyData = {
      companyId: 46,
      companyname: 'PLAY MÓVEL',
      appTheme:
        '{"darkLightMode":false,"colors":{"primary":"#df3b67","secondary":"#000624"}}',
      logotipo: '',
    }

    // Carregar tema quando dados chegarem
    setTimeout(() => {
      loadTheme(mockCompanyData)
    }, 1000)
  }, [])

  return <>{children}</>
}

const MainLayout = () => {
  // Manter seu contexto original
  const { colorMode }: any = useContext(ThemeContext) // Seu contexto existente

  // Novo contexto whitelabel
  const { theme: whitelabelTheme } = useWhitelabelTheme()

  const [fontsLoaded] = useFonts({
    'dm-sans-regular': DMSans_400Regular,
    'dm-sans-medium': DMSans_500Medium,
    'dm-sans-bold': DMSans_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  function NavigationController({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loadingSystem } = useAuth()
    const segments = useSegments()
    const router = useRouter()

    useEffect(() => {
      if (loadingSystem) return

      const inAuthGroup = segments[0] === '(auth)'

      if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/(weather)')
      } else if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/entrar')
      }
    }, [isAuthenticated, segments, loadingSystem])

    return <>{children}</>
  }

  return (
    <GluestackUIProvider config={createCustomConfig} colorMode={colorMode}>
      <StatusBar translucent />
      <AuthProvider>
        <CompanyThemeLoader>
          <NavigationController>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </NavigationController>
        </CompanyThemeLoader>
      </AuthProvider>
    </GluestackUIProvider>
  )
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <WhitelabelThemeProvider>
          <MainLayout />
        </WhitelabelThemeProvider>
      </ThemeProvider>
    </Provider>
  )
}
