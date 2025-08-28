import '@/global.css'
import { useContext, useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useFonts } from 'expo-font'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { StatusBar } from 'expo-status-bar'
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

const MainLayout = () => {
  const { colorMode }: any = useContext(ThemeContext)
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
      if (loadingSystem) return // Aguarda carregar

      const inAuthGroup = segments[0] === '(auth)'

      if (isAuthenticated && inAuthGroup) {
        // Usuário logado mas está nas telas de auth -> redireciona pro app
        router.replace('/(tabs)/(weather)')
      } else if (!isAuthenticated && !inAuthGroup) {
        // Usuário NÃO logado mas está no app -> redireciona pro login
        router.replace('/(auth)/entrar')
      }
    }, [isAuthenticated, segments, loadingSystem])

    return <>{children}</>
  }

  return (
    <GluestackUIProvider mode={colorMode}>
      <StatusBar translucent />
      <AuthProvider>
        <NavigationController>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </NavigationController>
      </AuthProvider>
    </GluestackUIProvider>
  )
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
    </Provider>
  )
}
