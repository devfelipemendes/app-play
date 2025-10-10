import React, { useContext, useEffect } from 'react'
import { HStack } from '@/components/ui/hstack'
import { Icon, SearchIcon } from '@/components/ui/icon'
import { VStack } from '@/components/ui/vstack'
import { Box } from '@/components/ui/box'
import { ImageBackground } from '@/components/ui/image-background'
import { Image } from '@/components/ui/image'
import { ThemeContext } from '@/contexts/theme-context'
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useAppSelector } from '@/src/store/hooks'
import { selectDet2Data, selectDet2Loading, selectDet2Error } from '@/src/store/slices/det2Slice'
import { useDadosFormatter } from '@/src/utils/dadosFormatter'
import { formatPhoneNumber } from '@/src/utils/PhoneFormatter'
import { getCurrentFormattedDate } from '@/src/utils/getDateFormatter'

const Header = ({ height }: { height: number }) => {
  const { colorMode }: any = useContext(ThemeContext)
  const det2Data = useAppSelector(selectDet2Data)
  const loading = useAppSelector(selectDet2Loading)
  const det2Error = useAppSelector(selectDet2Error)

  const { convertMBtoGB } = useDadosFormatter()

  // Detectar se não tem MSISDN ativo
  const isNoMsisdn = det2Error === 'NO_MSISDN'

  // Mensagens motivadoras aleatórias
  const motivationalMessages = [
    '🚀 Pronto para decolar?',
    '✨ Comece sua jornada!',
    '🌟 Hora de se conectar!',
    '💫 Ative e aproveite!',
    '🎯 Seu mundo aguarda!',
    '📱 Conecte-se agora!',
  ]

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  // Shared value para height suavizada
  const smoothHeight = useSharedValue(height)

  // Atualiza smoothHeight quando height mudar com animação suave
  useEffect(() => {
    smoothHeight.value = withSpring(height, {
      damping: 20, // Maior = menos oscilação
      stiffness: 100, // Menor = mais suave
      mass: 1.2, // Maior = mais inércia
    })
  }, [height])

  // Estilos animados usando smoothHeight e extrapolation 'clamp'
  const locationTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(
      smoothHeight.value,
      [340, 140],
      [20, 16],
      'clamp', // Evita valores extremos
    ),
  }))

  const dateTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(smoothHeight.value, [340, 140], [16, 14], 'clamp'),
  }))

  const temperatureTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(smoothHeight.value, [600, 140], [112, 40], 'clamp'),
    marginLeft: interpolate(smoothHeight.value, [340, 140], [0, 15], 'clamp'),
  }))

  const feelsLikeTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(smoothHeight.value, [340, 140], [18, 14], 'clamp'),
  }))

  const weatherTextStyle = useAnimatedStyle(() => ({
    fontSize: interpolate(smoothHeight.value, [340, 140], [20, 14], 'clamp'),
  }))

  const imageStyle = useAnimatedStyle(() => ({
    width: interpolate(smoothHeight.value, [340, 140], [124, 56], 'clamp'),
    height: interpolate(smoothHeight.value, [340, 140], [112, 50], 'clamp'),
    marginTop: interpolate(smoothHeight.value, [340, 140], [6, 0], 'clamp'),
  }))

  // Estilo animado para o container principal
  const containerStyle = useAnimatedStyle(() => ({
    marginTop: interpolate(smoothHeight.value, [340, 140], [64, 70], 'clamp'),
  }))

  // Estilo animado para opacity do SearchIcon
  const searchIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(smoothHeight.value, [340, 200], [1, 0], 'clamp'),
  }))

  // Estilo animado para o container de temperatura
  const temperatureContainerStyle = useAnimatedStyle(() => ({
    left: interpolate(smoothHeight.value, [340, 140], [0, 170], 'clamp'),
    bottom: interpolate(smoothHeight.value, [340, 140], [0, -5], 'clamp'),
  }))

  // Estilo animado para o container de texto do tempo
  const weatherContainerStyle = useAnimatedStyle(() => ({
    bottom: interpolate(smoothHeight.value, [340, 140], [0, -5], 'clamp'),
  }))

  return (
    <Box className="bg-background-0 rounded-b-3xl overflow-hidden flex-1">
      <ImageBackground
        source={
          colorMode === 'dark'
            ? require('@/assets/images/backgroundImageApp.jpg')
            : require('@/assets/images/backgroundImageApp.jpg')
        }
        className="h-full"
      >
        <Animated.View
          style={[
            {
              margin: 20,
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
            },
            containerStyle,
          ]}
        >
          <HStack className="justify-between">
            <VStack className="gap-2">
              <Animated.Text
                style={[
                  {
                    fontFamily: 'dm-sans-medium',
                    color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                  },
                  locationTextStyle,
                ]}
              >
                Brasil
              </Animated.Text>
              <Animated.Text
                style={[
                  {
                    fontFamily: 'dm-sans-regular',
                    color: colorMode === 'dark' ? '#E5E5E5' : '#F5F5F5',
                  },
                  dateTextStyle,
                ]}
              >
                {getCurrentFormattedDate('full')}
              </Animated.Text>
            </VStack>
            <Animated.View style={searchIconStyle}>
              <Icon as={SearchIcon} size="xl" className="text-background-700" />
            </Animated.View>
          </HStack>

          <Animated.View
            style={[
              {
                justifyContent: 'space-between',
                position: 'absolute',
              },
              temperatureContainerStyle,
            ]}
          >
            {isNoMsisdn ? (
              // Visualização quando NÃO tem MSISDN ativo
              <>
                <Animated.Text
                  style={[
                    {
                      fontFamily: 'dm-sans-bold',
                      color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                    },
                    temperatureTextStyle,
                  ]}
                >
                  --
                </Animated.Text>
                <Animated.Text
                  style={[
                    {
                      fontFamily: 'dm-sans-medium',
                      color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                      opacity: 0.9,
                    },
                    feelsLikeTextStyle,
                  ]}
                >
                  {randomMessage}
                </Animated.Text>
              </>
            ) : (
              // Visualização normal quando TEM MSISDN ativo
              <>
                <Animated.Text
                  style={[
                    {
                      fontFamily: 'dm-sans-regular',
                      color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                    },
                    temperatureTextStyle,
                  ]}
                >
                  {det2Data?.dados && convertMBtoGB(det2Data.dados).formatted}
                </Animated.Text>
                <Animated.Text
                  style={[
                    {
                      fontFamily: 'dm-sans-regular',
                      color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                    },
                    feelsLikeTextStyle,
                  ]}
                >
                  {det2Data?.msisdn && formatPhoneNumber(det2Data?.msisdn)}
                </Animated.Text>
              </>
            )}
          </Animated.View>

          <Animated.View
            style={[
              {
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'absolute',
              },
              weatherContainerStyle,
            ]}
          >
            {/* <Animated.View style={imageStyle}>
              <Image
                source={require('@/assets/images/thunderstorm.png')}
                alt="thunderstorm"
                size="full"
              />
            </Animated.View> */}
            {/* <Animated.Text
              style={[
                {
                  fontFamily: 'dm-sans-regular',
                  color: colorMode === 'dark' ? '#F2EDFF' : '#FEFEFF',
                },
                weatherTextStyle,
              ]}
            >
              Play Móvel
            </Animated.Text> */}
          </Animated.View>
        </Animated.View>
      </ImageBackground>
    </Box>
  )
}

export default Header
