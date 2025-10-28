import React, { useContext, useState, useEffect } from 'react'
import { Slot } from 'expo-router'
import { RefreshControl } from 'react-native'
import { ScrollView } from '@/components/ui/scroll-view'
import { View } from '@/components/ui/view'
import Header from '@/components/screens/weather/header'
import Tabs from '@/components/screens/weather/tabs'
import useChildVisibility from '@/hooks/useChildVisibility'
import {
  WeatherTabProvider,
  WeatherTabContext,
} from '@/contexts/weather-screen-context'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
  withSpring,
} from 'react-native-reanimated'
import { useRefresh } from '@/hooks/useRefresh'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const WeatherLayout = () => {
  const { scrollViewRef, selectedTabIndex, refreshCurrentTab }: any =
    useContext(WeatherTabContext)
  const { handleScroll } = useChildVisibility()
  const scrollY = useSharedValue(0)
  const [height, setHeight] = useState(340)
  const animatedHeight = useSharedValue(340)
  const smoothAnimatedHeight = useSharedValue(340) // Nova shared value suavizada
  const isHeaderShrunk = useSharedValue(false)
  const { colors } = useCompanyThemeSimple()

  // Hook useRefresh para pull-to-refresh
  const { refreshing, onRefresh } = useRefresh([
    async () => {
      console.log(`🔄 Pull-to-refresh na tab ${selectedTabIndex}`)
      if (refreshCurrentTab) {
        await refreshCurrentTab()
      }
    },
  ])

  useEffect(() => {
    if (scrollViewRef.current) {
      const targetY = isHeaderShrunk.value ? 200 : 0

      scrollViewRef.current.scrollTo({
        y: targetY,
        animated: false,
      })

      scrollY.value = targetY
      animatedHeight.value = isHeaderShrunk.value ? 140 : 340

      // Atualiza também a versão suavizada
      smoothAnimatedHeight.value = withSpring(
        isHeaderShrunk.value ? 140 : 340,
        {
          damping: 18,
          stiffness: 120,
          mass: 1.4,
        },
      )
    }
    // eslint-disable-next-line
  }, [selectedTabIndex])

  const handleScrollWithPosition = (event: any) => {
    const y = event.nativeEvent.contentOffset.y
    scrollY.value = y

    // Se Y for negativo (bounce/pull-to-refresh), manter header no tamanho máximo
    const clampedY = Math.max(0, y)

    isHeaderShrunk.value = clampedY >= 200

    // Calcular a altura interpolada usando Y clamped
    const interpolatedHeight = interpolate(
      clampedY,
      [0, 200],
      [340, 140],
      Extrapolation.CLAMP,
    )

    // Atualizar a altura bruta
    animatedHeight.value = interpolatedHeight

    // Atualizar a altura suavizada com spring
    smoothAnimatedHeight.value = withSpring(interpolatedHeight, {
      damping: 16, // Mais responsivo que o Header
      stiffness: 90, // Ligeiramente mais rígido para acompanhar o scroll
      mass: 1.2, // Menos massa para ser mais responsivo
    })

    if (selectedTabIndex === 0) {
      handleScroll(event)
    }
  }

  const updateHeight = (value: number) => {
    'worklet'
    runOnJS(setHeight)(value)
  }

  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Usar a altura suavizada em vez da direta
    updateHeight(smoothAnimatedHeight.value)
    return {
      height: smoothAnimatedHeight.value,
    }
  })

  return (
    <View className="flex-1">
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <Animated.View style={[headerAnimatedStyle]}>
          <Header height={height} />
        </Animated.View>

        <Tabs />
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScrollWithPosition}
        scrollEventThrottle={16}
        className="bg-background-0"
        contentContainerClassName="pt-[419px]"
        bounces={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressViewOffset={419} // Offset para aparecer abaixo do header
          />
        }
      >
        <Slot />
        {/* consider it like a {children} */}
      </ScrollView>
    </View>
  )
}

export default function HomeLayout() {
  return (
    <WeatherTabProvider>
      <WeatherLayout />
    </WeatherTabProvider>
  )
}
