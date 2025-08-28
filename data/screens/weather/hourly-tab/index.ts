import {
  Wind,
  CloudRainWind,
  Waves,
  Sunrise,
  Sunset,
} from 'lucide-react-native'
import { SunIcon } from '@/components/ui/icon'

export const WindAndPrecipitationData = [
  {
    id: 1,
    icon: Wind,
    text: 'Gasto de dados',
    currentUpdate: '10 GB',
    lastUpdate: 'Disponivel 13 GB',
    arrowDownIcon: true,
    arrowUpIcon: false,
  },
  {
    id: 2,
    icon: CloudRainWind,
    text: 'Plano',
    currentUpdate: '24%',
    lastUpdate: 'Porcentagem de uso ',
    arrowDownIcon: false,
    arrowUpIcon: true,
  },
]

export const PressureAndUVIndexData = [
  {
    id: 3,
    icon: Waves,
    text: 'SMS',
    currentUpdate: '0',
    lastUpdate: 'Ilimitado',
    arrowDownIcon: false,
    arrowUpIcon: true,
  },
  {
    id: 4,
    icon: SunIcon,
    text: 'Apps disponiveis',
    currentUpdate: '2',
    lastUpdate: 'Aplicativos SVA',
    arrowDownIcon: true,
    arrowUpIcon: false,
  },
]

export const HourlyForecastData = [
  {
    id: 1,
    time: 'Hoje',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 10,
  },
  {
    id: 2,
    time: 'seg',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 8,
  },
  {
    id: 3,
    time: 'ter',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 5,
  },
  {
    id: 4,
    time: 'quar',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 12,
  },
  {
    id: 5,
    time: 'qui',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 9,
  },
  {
    id: 6,
    time: 'sex',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 12,
  },
  {
    id: 7,
    time: 'sab',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 15,
  },
  {
    id: 8,
    time: 'dom',
    imgUrl: require('@/assets/images/connectMobile.png'),
    temperature: 13,
  },
]

export const RainPredictionData = [
  {
    id: 1,
    time: 6,
    value: 27,
  },
  {
    id: 2,
    time: 7,
    value: 44,
  },
  {
    id: 3,
    time: 8,
    value: 56,
  },
  {
    id: 4,
    time: 9,
    value: 88,
  },
]

export const SunriseAndSunsetData = [
  {
    id: 5,
    icon: Sunrise,
    text: 'Sunrise',
    currentUpdate: '4:30 AM',
    lastUpdate: '4h ago',
  },
  {
    id: 6,
    icon: Sunset,
    text: 'Sunset',
    currentUpdate: '6:50 PM',
    lastUpdate: 'in 9h',
  },
]
