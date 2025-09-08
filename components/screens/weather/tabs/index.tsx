import React, { useContext } from 'react'
import { Link } from 'expo-router'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import {
  useCompanyTheme,
  useCompanyThemeSimple,
} from '@/hooks/theme/useThemeLoader'
import { lightenHexColor } from '@/src/utils/lightColorPrimary'

const tabs = [
  {
    id: 0,
    path: '/',
    label: 'Home',
  },
  {
    id: 1,
    path: '/days',
    label: 'Faturas',
  },
  {
    id: 2,
    path: '/monthly',
    label: 'Consumo',
  },
]

const Tabs = () => {
  const { selectedTabIndex, setSelectedTabIndex }: any =
    useContext(WeatherTabContext)

  const handlePress = (index: number) => {
    setSelectedTabIndex(index)
  }

  const { colors } = useCompanyThemeSimple()

  return (
    <HStack space="xs" className="px-4 pt-5 pb-4 bg-background-0 gap-2">
      {tabs.map((tab, index) => (
        //@ts-ignore
        <Link href={tab.path} asChild key={tab.id}>
          <Pressable
            onPress={() => handlePress(index)}
            style={{
              flex: 1,
              borderRadius: 999, // rounded-full
              height: 43,

              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor:
                selectedTabIndex === index
                  ? colors.secondary
                  : lightenHexColor(colors.primary, 0),
            }}
          >
            <Text
              style={{
                fontFamily: 'font-dm-sans-regular', // ou o nome correto da sua fonte
                color:
                  selectedTabIndex === index
                    ? colors.textButton
                    : colors.textButton,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        </Link>
      ))}
    </HStack>
  )
}

export default Tabs
