import React, { useContext, useEffect } from 'react'
import { VStack } from '@/components/ui/vstack'
import { CloudRain } from 'lucide-react-native'
import { ClockIcon, Icon } from '@/components/ui/icon'
import { HStack } from '@/components/ui/hstack'
import HourlyCard from '@/components/screens/weather/hourly-card'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import ForeCastCard from '@/components/screens/weather/forecast-card'
import RainCard from '@/components/screens/weather/rain-card'
import Chart from '@/components/screens/weather/chart'
import { ScrollView } from '@/components/ui/scroll-view'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import {
  WindAndPrecipitationData,
  PressureAndUVIndexData,
  HourlyForecastData,
  RainPredictionData,
  SunriseAndSunsetData,
} from '@/data/screens/weather/hourly-tab'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const Hourly = () => {
  const { childRefs, hasHourlyTabChild1Animated }: any =
    useContext(WeatherTabContext)
  const AnimatedVStack = Animated.createAnimatedComponent(VStack)
  const { colors } = useCompanyThemeSimple()

  useEffect(() => {
    hasHourlyTabChild1Animated.current = true
  }, [])

  return (
    <VStack
      style={{
        paddingHorizontal: 16, // px-4
        paddingBottom: 20, // pb-5
        gap: 16, // space="md"
      }}
    >
      <AnimatedVStack style={{ gap: 16 }}>
        <Animated.View
          entering={
            hasHourlyTabChild1Animated.current
              ? undefined
              : FadeInDown.delay(0 * 100)
                  .springify()
                  .damping(12)
          }
        >
          <HStack style={{ gap: 16 }}>
            {WindAndPrecipitationData.map((card: any) => (
              <HourlyCard
                key={card.id}
                icon={card.icon}
                text={card.text}
                currentUpdate={card.currentUpdate}
                lastUpdate={card.lastUpdate}
                arrowDownIcon={card.arrowDownIcon}
                arrowUpIcon={card.arrowUpIcon}
              />
            ))}
          </HStack>
        </Animated.View>

        <Animated.View
          entering={
            hasHourlyTabChild1Animated.current
              ? undefined
              : FadeInDown.delay(1 * 100)
                  .springify()
                  .damping(12)
          }
        >
          <HStack style={{ gap: 16 }}>
            {PressureAndUVIndexData.map((card: any) => (
              <HourlyCard
                key={card.id}
                icon={card.icon}
                text={card.text}
                currentUpdate={card.currentUpdate}
                lastUpdate={card.lastUpdate}
                arrowDownIcon={card.arrowDownIcon}
                arrowUpIcon={card.arrowUpIcon}
              />
            ))}
          </HStack>
        </Animated.View>
      </AnimatedVStack>

      {/* ---------------------------- Hourly forecast ---------------------------- */}
      <VStack
        style={{
          paddingVertical: 12, // py-3
          paddingHorizontal: 12, // p-3
          borderRadius: 24, // rounded-2xl
          backgroundColor: colors.background,
          boxShadow: ' 0px 1px 3px rgba(0, 0, 0, 0.24)',
          // Sombra (Android)
          elevation: 4,
          gap: 12, // gap-3
        }}
      >
        <HStack style={{ gap: 8, alignItems: 'center' }}>
          <Box
            style={{
              width: 28,
              height: 28,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 999,
            }}
          >
            <Icon
              as={ClockIcon}
              size="sm"
              style={{ color: colors.textButton }}
            />
          </Box>
          <Text
            style={{
              fontFamily: 'DM Sans',
              fontWeight: '400',
              color: colors.secondary,
            }}
          >
            Consumo Semanal
          </Text>
        </HStack>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 32, paddingHorizontal: 12 }}
        >
          {HourlyForecastData.map((card: any) => (
            <ForeCastCard
              key={card.id}
              time={card.time}
              imgUrl={card.imgUrl}
              temperature={card.temperature}
            />
          ))}
        </ScrollView>
      </VStack>

      <Chart chartRef={childRefs[0].ref} />
    </VStack>
  )
}

export default Hourly
