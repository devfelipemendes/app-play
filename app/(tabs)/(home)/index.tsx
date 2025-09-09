import React, { useContext, useEffect } from 'react'
import { VStack } from '@/components/ui/vstack'
import { Globe } from 'lucide-react-native'
import { ClockIcon, Icon } from '@/components/ui/icon'
import { HStack } from '@/components/ui/hstack'
import HourlyCard from '@/components/screens/weather/hourly-card'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import ForeCastCard from '@/components/screens/weather/forecast-card'

import Chart from '@/components/screens/weather/chart'
import { ScrollView } from '@/components/ui/scroll-view'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import {
  WindAndPrecipitationData,
  PressureAndUVIndexData,
  HourlyForecastData,
} from '@/data/screens/weather/hourly-tab'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { useAppDispatch, useAppSelector } from '@/src/store/hooks'
import { useGetDet2Mutation } from '@/src/api/endpoints/getDetails'
import { useAuth } from '@/hooks/useAuth'
import { setError, setLoading, setSelected } from '@/src/store/slices/det2Slice'

const Home = () => {
  const { childRefs, hasHourlyTabChild1Animated }: any =
    useContext(WeatherTabContext)
  const AnimatedVStack = Animated.createAnimatedComponent(VStack)

  const {
    selected: det2Data,
    loading: det2Loading,
    error: det2Error,
  } = useAppSelector((state) => state.det2View)
  const { colors } = useCompanyThemeSimple()

  const { user } = useAuth()

  const dispatch = useAppDispatch()

  const [getDet2] = useGetDet2Mutation()

  useEffect(() => {
    hasHourlyTabChild1Animated.current = true
  }, [])

  const iccid = user?.icc

  useFocusEffect(
    useCallback(() => {
      if (!iccid) return

      const fetchDet2 = async () => {
        try {
          dispatch(setLoading(true))
          const result = await getDet2({
            atualizadet: 'SIM',
            iccid,
            parceiro: user.parceiro,
            token: user.token,
            userInfo: JSON.stringify({
              cpf: user.cpf,
              name: user.name,
              parceiro: user.parceiro,
            }),
          }).unwrap()

          dispatch(setSelected(result))
          dispatch(setError(null))
        } catch (err: any) {
          dispatch(setError(err?.message || 'Erro ao carregar dados'))
        } finally {
          dispatch(setLoading(false))
        }
      }

      fetchDet2()
    }, [iccid, user?.parceiro, user?.token, user?.cpf, user?.name]),
  )

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
          <HStack style={{ gap: 16 }}>
            <HourlyCard
              icon={Globe}
              text={det2Data?.dados || ''}
              currentUpdate=""
              lastUpdate=""
              arrowDownIcon={true}
              arrowUpIcon={true}
            />
            <HourlyCard
              icon={Globe}
              text=""
              currentUpdate=""
              lastUpdate=""
              arrowDownIcon={true}
              arrowUpIcon={true}
            />
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

export default Home
