import React, { useEffect, useRef, useState } from 'react'

import { SafeAreaView } from '@/components/ui/safe-area-view'
import { Box } from '@/components/ui/box'

import IconLogo from '../../assets/AssetsPartners/adaptive-icon.png'

import { Keyboard, Animated, Platform, Image, Dimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import FormLogin from '@/components/Pages/forms/FormLogin'

import FormCadastro from '@/components/Pages/forms/FormCad'
import FormEsqueciSenha from '@/components/Pages/forms/FormEsqueciSenha'
import FormValidarToken from '@/components/Pages/forms/FormValidarToken'
import FormAlterarSenha from '@/components/Pages/forms/FormAlterarSenha'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function LoginScreen() {
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const { colors } = useCompanyThemeSimple()

  const mode = useAppSelector((state: RootState) => state.screenFlow.mode)

  // Detectar tamanho da tela
  const { height: screenHeight } = Dimensions.get('window')
  const isSmallScreen = screenHeight < 700 // iPhone SE, iPhone 8, etc.
  const isIOS = Platform.OS === 'ios'

  const animValue = useRef(new Animated.Value(0)).current

  const logoOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  useEffect(() => {
    // Esconde o logo quando não está no modo login
    Animated.timing(animValue, {
      toValue: mode !== 'login' ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start()
  }, [mode])

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardOpen(true)
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOpen(false)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.text }}>
      <StatusBar style="light" />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!keyboardOpen} // Desabilita scroll quando teclado aberto
      >
        {/* Área do logo */}

        <Box
          style={{
            // Em iOS e telas pequenas, não expande quando teclado fecha
            flex: isIOS || isSmallScreen ? 0 : keyboardOpen ? 0 : 1,

            // Altura mínima ajustada para iOS e telas pequenas
            minHeight:
              isIOS || isSmallScreen
                ? keyboardOpen
                  ? 0
                  : 80
                : keyboardOpen
                ? 60
                : 60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.text,
          }}
        >
          {mode === 'login' && !keyboardOpen && (
            <Animated.Image
              source={IconLogo}
              style={{
                // Tamanho menor do logo em telas pequenas
                width: isIOS || isSmallScreen ? 80 : 120,
                height: isIOS || isSmallScreen ? 80 : 120,
                opacity: logoOpacity,
                alignSelf: 'center',
                marginBottom: isIOS || isSmallScreen ? 16 : 32,
              }}
              resizeMode="contain"
            />
          )}
        </Box>

        {/* Área do formulário */}
        <Animated.View
          style={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: isIOS || isSmallScreen ? 24 : 32,
            paddingBottom: keyboardOpen ? 50 : 24,
            justifyContent: 'flex-start',
            borderTopLeftRadius: isIOS || isSmallScreen ? 50 : 70,
            backgroundColor: 'white',
          }}
        >
          {mode === 'login' && <FormLogin />}
          {mode === 'cadastro' && <FormCadastro />}
          {mode === 'esqueciSenha' && <FormEsqueciSenha />}
          {mode === 'validarToken' && <FormValidarToken />}
          {mode === 'alterarSenha' && <FormAlterarSenha />}
        </Animated.View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
