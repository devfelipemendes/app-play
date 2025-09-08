import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'

import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Animated, Platform, LayoutChangeEvent } from 'react-native'
import { Icon } from '@/components/ui/icon'
import {
  ChartArea,
  GalleryHorizontal,
  Home,
  HomeIcon,
  MessageCircle,
  MessageCircleQuestion,
  Settings,
  SignalHigh,
  User,
} from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useEffect, useRef, useState } from 'react'

interface TabItem {
  name: string
  label: string
  path: string
  inActiveIcon: React.ElementType
  icon: React.ElementType
}

const tabItems: TabItem[] = [
  {
    name: '(weather)',
    label: 'Home',
    path: '(weather)',
    inActiveIcon: HomeIcon,
    icon: Home,
  },
  {
    name: 'maps',
    label: 'Plano',
    path: 'maps',
    inActiveIcon: SignalHigh,
    icon: SignalHigh,
  },
  {
    name: 'location',
    label: 'Chat',
    path: 'location',
    inActiveIcon: MessageCircle,
    icon: MessageCircle,
  },
  {
    name: 'settings',
    label: 'Perfil',
    path: 'settings',
    inActiveIcon: User,
    icon: User,
  },
]

function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const { colors } = useCompanyThemeSimple()

  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    [],
  )
  const underlineAnim = useRef(new Animated.Value(0)).current
  const widthAnim = useRef(new Animated.Value(0)).current

  const activeIndex = props.state.index

  // Atualiza animação quando muda a aba ou layout
  useEffect(() => {
    if (!tabLayouts[activeIndex]) return
    const { x, width } = tabLayouts[activeIndex]

    Animated.parallel([
      Animated.spring(underlineAnim, {
        toValue: x + width / 4,
        useNativeDriver: false,
      }),
      Animated.spring(widthAnim, {
        toValue: width / 2,
        useNativeDriver: false,
      }),
    ]).start()
  }, [activeIndex, tabLayouts])

  return (
    <Box style={{ backgroundColor: colors.background }}>
      <HStack
        style={{
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
          paddingTop: 16,
          paddingHorizontal: 28,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: colors.background,

          // iOS
          boxShadow: '0px -2px 6px 0px rgba(0, 0, 0, 0.182)',

          // Android
          elevation: 4,
        }}
        space="md"
      >
        {tabItems.map((item, index) => {
          const isActive = activeIndex === index

          return (
            <Pressable
              key={item.name}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => props.navigation.navigate(item.path)}
              onLayout={(e: LayoutChangeEvent) => {
                const layout = e.nativeEvent.layout
                setTabLayouts((prev) => {
                  const copy = [...prev]
                  copy[index] = { x: layout.x, width: layout.width }
                  return copy
                })
              }}
            >
              <Icon
                as={isActive ? item.icon : item.inActiveIcon}
                size="xl"
                style={{ color: isActive ? colors.primary : colors.secondary }}
              />
              <Text
                size="xs"
                style={{
                  marginTop: 4,
                  fontWeight: '500',
                  color: isActive ? colors.primary : colors.secondary,
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}

        {/* Barrinha animada */}
        {tabLayouts[activeIndex] && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: Platform.OS === 'ios' ? insets.bottom + 8 : 8,
              left: underlineAnim,
              width: widthAnim,
              height: 3,
              borderRadius: 2,
              backgroundColor: colors.primary,
            }}
          />
        )}
      </HStack>
    </Box>
  )
}

export default BottomTabBar
