// app/_layout.tsx
import '@/global.css'
import React, { useContext } from 'react'
import { Stack } from 'expo-router'
import { useFonts } from 'expo-font'
import { StatusBar } from 'expo-status-bar'
import { GluestackUIProvider } from '@gluestack-ui/themed'

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

// Componente para carregar tema da empresa
const CompanyThemeLoader = ({ children }: { children: React.ReactNode }) => {
  const { loadTheme } = useWhitelabelTheme()

  React.useEffect(() => {
    // Aqui você carregaria os dados reais da empresa
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
  const { colorMode }: any = useContext(ThemeContext)
  const { theme: whitelabelTheme } = useWhitelabelTheme()

  const [fontsLoaded] = useFonts({
    'dm-sans-regular': DMSans_400Regular,
    'dm-sans-medium': DMSans_500Medium,
    'dm-sans-bold': DMSans_700Bold,
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <GluestackUIProvider config={createCustomConfig} colorMode={colorMode}>
      <StatusBar translucent />
      <AuthProvider>
        <CompanyThemeLoader>
          <AuthGuard>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </AuthGuard>
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
          <PaperProvider>
            <MainLayout />
            <Toast />
          </PaperProvider>
        </WhitelabelThemeProvider>
      </ThemeProvider>
    </Provider>
  )
}
