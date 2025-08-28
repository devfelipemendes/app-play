import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import {
  WeatherIcon,
  MapsIcon,
  UserIcon,
  ActiveUserIcon,
  ActiveMapsIcon,
  ActivePlanoIcon,
  PlanoIcon,
} from '@/components/shared/icon'
import { HStack } from '@/components/ui/hstack'
import { Box } from '@/components/ui/box'
import { Platform } from 'react-native'
import { Icon } from '@/components/ui/icon'
import { Home, HomeIcon } from 'lucide-react-native'

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
    name: 'location',
    label: 'Plano',
    path: 'location',
    inActiveIcon: ActivePlanoIcon,
    icon: PlanoIcon,
  },
  {
    name: 'maps',
    label: 'teste',
    path: 'maps',
    inActiveIcon: MapsIcon,
    icon: ActiveMapsIcon,
  },
  {
    name: 'settings',
    label: 'Perfil',
    path: 'settings',
    inActiveIcon: UserIcon,
    icon: ActiveUserIcon,
  },
]

function BottomTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <Box className="bg-background-0">
      <HStack
        className="bg-background-0 pt-4 px-7 rounded-t-3xl min-h-[78px]"
        style={{
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16,
          boxShadow: '0px -10px 12px 0px rgba(0, 0, 0, 0.04)',
        }}
        space="md"
      >
        {tabItems.map((item) => {
          const isActive =
            props.state.routeNames[props.state.index] === item.path
          return (
            <Pressable
              key={item.name}
              className="flex-1 items-center justify-center"
              onPress={() => {
                props.navigation.navigate(item.path)
              }}
            >
              <Icon
                as={isActive ? item.icon : item.inActiveIcon}
                size="xl"
                className={`${
                  isActive
                    ? item.icon === ActiveMapsIcon
                      ? 'fill-primary-800 text-background-0'
                      : 'fill-primary-800 text-primary-800'
                    : 'text-background-500'
                }`}
              />
              <Text
                size="xs"
                className={`mt-1 font-medium ${
                  isActive ? 'text-primary-800' : 'text-background-500'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </HStack>
    </Box>
  )
}

export default BottomTabBar
