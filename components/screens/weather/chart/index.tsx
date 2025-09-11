import React, { useContext } from 'react'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Icon, CalendarDaysIcon } from '@/components/ui/icon'
import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import { LineChart } from 'react-native-gifted-charts'
import { ThemeContext } from '@/contexts/theme-context'
import { WeatherTabContext } from '@/contexts/weather-screen-context'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const Chart = ({ chartRef }: any) => {
  const { colorMode }: any = useContext(ThemeContext)
  const { childRefs }: any = useContext(WeatherTabContext)

  const { colors } = useCompanyThemeSimple()
  const lineData = [
    {},
    { value: 18, label: 'jan' },
    { value: 23, label: 'fev' },
    { value: 15, label: 'mar' },
    { value: 18, label: 'abr' },
    { value: 10, label: 'mai' },
    { value: 25, label: 'jun' },
    { value: 19, label: 'jul' },
    {},
  ]

  return (
    <VStack
      className="p-3 rounded-2xl bg-background-100 gap-3"
      style={{
        backgroundColor: colors.background,
        boxShadow: colors.shadow,
        // Sombra (Android)
      }}
    >
      <HStack className="items-center gap-2">
        <Box className="h-7 w-7 bg-background-50 items-center justify-center rounded-full">
          <Icon
            as={CalendarDaysIcon}
            className="text-typography-400"
            size="sm"
          />
        </Box>
        <Text className="font-dm-sans-medium text-typography-400">
          Consumo Mensal
        </Text>
      </HStack>

      <VStack className="overflow-hidden" ref={chartRef}>
        {childRefs[0].isVisible && (
          <LineChart
            curved
            isAnimated
            areaChart
            data={lineData}
            initialSpacing={0}
            hideDataPoints
            rulesColor={colorMode === 'dark' ? '#414141' : '#d3d3d3'}
            rulesType="solid"
            color={colors.primary}
            startFillColor={colors.primary}
            endFillColor={colorMode === 'dark' ? '#30203c' : '#f1ebff'}
            startOpacity={1}
            endOpacity={0}
            xAxisLabelTextStyle={{
              color: colorMode === 'dark' ? '#F5F5F5' : '#262627',
              textAlign: 'right',
              fontSize: 12,
            }}
            xAxisColor={colorMode === 'dark' ? '#414141' : '#d3d3d3'}
            yAxisThickness={0}
            yAxisLabelSuffix="GB"
            yAxisTextStyle={{
              color: colorMode === 'dark' ? '#F5F5F5' : '#262627',
              fontSize: 12,
            }}
            noOfSections={4}
            stepHeight={30}
            spacing={36}
            pointerConfig={{
              hidePointerForMissingValues: true,
              pointerStripHeight: 86,
              pointerStripColor: colorMode === 'dark' ? 'lightgray' : '#5b416d',
              pointerStripWidth: 1,
              pointerColor: colorMode === 'dark' ? 'lightgray' : '#5b416d',
              radius: 5,
              pointerLabelWidth: 100,
              pointerLabelHeight: 100,
              pointerLabelComponent: (items: any) => {
                return (
                  <VStack className="h-[100px] w-[100px] justify-center items-start -ml-1.5">
                    <VStack className="px-2 rounded-full bg-background-0">
                      <Text size="sm" className="text-typography-900">
                        {items[0].value} GB
                      </Text>
                    </VStack>
                  </VStack>
                )
              },
            }}
          />
        )}
      </VStack>
    </VStack>
  )
}

export default Chart
