import React from 'react'
import { HStack } from '@/components/ui/hstack'
import { VStack } from '@/components/ui/vstack'
import { Box } from '@/components/ui/box'
import { Icon } from '@/components/ui/icon'
import { Text } from '@/components/ui/text'
import { ArrowUpIcon, ArrowDownIcon } from '@/components/shared/icon'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import {
  ArrowRight,
  ArrowRightIcon,
  ChevronUpIcon,
  GalleryVertical,
  Phone,
  Smartphone,
} from 'lucide-react-native'

interface IHourlyCard {
  icon: any
  text: string
  currentUpdate: string
  lastUpdate: string
  arrowDownIcon?: boolean
  arrowUpIcon?: boolean
}

const HourlyCard = ({
  icon,
  text,
  currentUpdate,
  lastUpdate,
  arrowDownIcon,
  arrowUpIcon,
}: IHourlyCard) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <VStack
      style={{
        padding: 12, // p-3
        borderRadius: 24, // rounded-2xl
        backgroundColor: colors.background,
        flex: 1,
        alignItems: 'flex-start',
        gap: 16, // gap-4

        shadowRadius: 4,
        boxShadow: ' 0px 1px 3px rgba(0, 0, 0, 0.24)',
        // Sombra (Android)
        elevation: 4,
      }}
    >
      <HStack
        style={{
          gap: 8, // gap-2
          alignItems: 'center',
        }}
      >
        <Box
          style={{
            width: 28, // w-7
            height: 28, // h-7
            backgroundColor: colors.primary,
            borderRadius: 999, // rounded-full
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon as={icon} size="sm" style={{ color: colors.textButton }} />
        </Box>
        <Text
          style={{
            color: colors.secondary,
            fontFamily: 'font-dm-sans-regular',
            fontWeight: '400',
            fontSize: 14,
          }}
        >
          {text}
        </Text>
      </HStack>

      <VStack
        style={{
          flex: 1,
          gap: 8, // gap-2
        }}
      >
        <Text
          style={{
            color: colors.secondary,
            fontFamily: 'font-dm-sans-regular',
            fontWeight: '400',
            fontSize: 24,
          }}
        >
          {currentUpdate}
        </Text>

        <HStack
          style={{
            gap: 4, // gap-1
            alignItems: 'center',
          }}
        >
          {arrowDownIcon && (
            <Icon
              as={Smartphone}
              size="xs"
              style={{ color: colors.secondary }}
            />
          )}
          {arrowUpIcon && (
            <Icon
              as={GalleryVertical}
              size="xs"
              style={{ color: colors.primary }}
            />
          )}
          <Text
            style={{
              color: colors.secondary,
              fontFamily: 'font-dm-sans-regular',
              fontWeight: '500',
              fontSize: 12, // tamanho xs
            }}
          >
            {lastUpdate}
          </Text>
        </HStack>
      </VStack>
    </VStack>
  )
}

export default HourlyCard
