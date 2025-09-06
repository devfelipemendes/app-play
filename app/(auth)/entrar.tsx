import React, { useEffect, useRef, useState } from 'react'

import { SafeAreaView } from '@/components/ui/safe-area-view'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'

import IconLogo from '../../assets/AssetsPartners/adaptive-icon.png'

import { Keyboard, Animated, Platform, Image } from 'react-native'

import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import type { RootState } from '@/src/store'
import FormLogin from '@/components/Pages/forms/FormLogin'
import { setMode } from '@/src/store/slices/screenFlowSlice'
import FormCadastro from '@/components/Pages/forms/FormCad'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default function LoginScreen() {
  const [keyboardOpen, setKeyboardOpen] = useState(false)
  const { colors } = useCompanyThemeSimple()

  const dispatch = useAppDispatch()
  const mode = useAppSelector((state: RootState) => state.screenFlow.mode)

  const animValue = useRef(new Animated.Value(0)).current

  const logoOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  })

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: mode === 'cadastro' ? 1 : 0,
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
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        {/* Área do logo */}

        <Box
          style={{
            flex: keyboardOpen ? 0 : 1,

            minHeight: keyboardOpen ? 60 : 60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.text,
          }}
        >
          {mode === 'login' && !keyboardOpen && (
            <Animated.Image
              source={IconLogo}
              style={{
                width: 120,
                height: 120,
                opacity: logoOpacity,
                alignSelf: 'center',
                marginBottom: 32,
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
            paddingTop: 32,
            paddingBottom: keyboardOpen ? 50 : 32,
            justifyContent: 'flex-start',
            borderTopLeftRadius: 70,
            backgroundColor: 'white',
          }}
        >
          {mode === 'login' ? <FormLogin /> : <FormCadastro />}
        </Animated.View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}
