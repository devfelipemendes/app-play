import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { useRouter, usePathname } from 'expo-router'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Animated, Platform, LayoutChangeEvent } from 'react-native'
import { Icon } from '@/components/ui/icon'
import {
  Home,
  HomeIcon,
  MessageCircle,
  SignalHigh,
  User,
} from 'lucide-react-native'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useEffect, useRef, useState } from 'react'
import { moderateScale } from '@/utils/responsive'
import { TAB_BAR, SHADOW } from '@/config/responsiveDimensions'
import { useDeviceSize } from '@/hooks/useDeviceSize'

interface TabItem {
  name: string
  label: string
  path: string
  inActiveIcon: React.ElementType
  icon: React.ElementType
}

const tabItems: TabItem[] = [
  {
    name: '(home)',
    label: 'Home',
    path: '(home)',
    inActiveIcon: HomeIcon,
    icon: Home,
  },
  {
    name: 'plans',
    label: 'Operadora',
    path: 'plans',
    inActiveIcon: SignalHigh,
    icon: SignalHigh,
  },
  {
    name: 'support',
    label: 'Suporte',
    path: 'support',
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

function BottomTabBar() {
  const insets = useSafeAreaInsets()
  const { colors } = useCompanyThemeSimple()
  const router = useRouter()
  const pathname = usePathname()

  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>(
    [],
  )
  const underlineAnim = useRef(new Animated.Value(0)).current
  const widthAnim = useRef(new Animated.Value(0)).current

  const { isMediumHeight } = useDeviceSize()

  // Mapeia o nome da rota para o índice visual da navbar
  const routeNameToIndex: Record<string, number> = {
    '(home)': 0,
    plans: 1,
    support: 2,
    settings: 3,
  }

  // Determinar a rota ativa baseada no pathname
  const getCurrentRoute = () => {
    if (pathname.includes('(home)')) return '(home)'
    if (pathname.includes('plans')) return 'plans'
    if (pathname.includes('support')) return 'support'
    if (pathname.includes('settings')) return 'settings'
    return '(home)'
  }

  const currentRoute = getCurrentRoute()
  const activeIndex = routeNameToIndex[currentRoute] ?? 0

  const shadowStyle = {
    ...SHADOW.medium,
    shadowOffset: { width: 0, height: -2 }, // Sombra para cima
  }

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
    // eslint-disable-next-line
  }, [activeIndex, tabLayouts])

  return (
    <Box style={{ backgroundColor: '#f2f2f2' }}>
      <HStack
        style={[
          {
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom : moderateScale(16),
            paddingTop: TAB_BAR.padding.top,
            paddingHorizontal: TAB_BAR.padding.horizontal,
            borderTopLeftRadius: TAB_BAR.borderTopLeftRadius,
            borderTopRightRadius: TAB_BAR.borderTopRightRadius,
            backgroundColor: colors.background,
          },
          shadowStyle,
        ]}
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
              onPress={() => router.push(`/(tabs)/${item.path}` as any)}
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
                  marginTop: moderateScale(4),
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
              top: isMediumHeight
                ? Platform.OS === 'ios'
                  ? TAB_BAR.heightIOS
                  : TAB_BAR.height + 12
                : Platform.OS === 'ios'
                ? TAB_BAR.heightIOS
                : TAB_BAR.height,
              left: underlineAnim,
              width: widthAnim,
              height: TAB_BAR.indicatorHeight,
              borderRadius: TAB_BAR.indicatorBorderRadius,
              backgroundColor: colors.primary,
            }}
          />
        )}
      </HStack>
    </Box>
  )
}

export default BottomTabBar
