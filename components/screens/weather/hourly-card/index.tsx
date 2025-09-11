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
        padding: 12,
        borderRadius: 24,
        backgroundColor: colors.background,
        flex: 1,
        alignItems: 'flex-start',
        gap: 16,
        shadowRadius: 4,
        boxShadow: colors.shadow,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <HStack
        style={{
          gap: 8,
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box
          style={{
            width: 28,
            height: 28,
            backgroundColor: colors.primary,
            borderRadius: 999,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Icon as={icon} size="sm" style={{ color: colors.textButton }} />
        </Box>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: colors.secondary,
            fontFamily: 'font-dm-sans-regular',
            fontWeight: '400',
            fontSize: 14,
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexWrap: 'nowrap',
          }}
        >
          {text}
        </Text>
      </HStack>

      <VStack
        style={{
          flex: 1,
          gap: 8,
          width: '100%',
          minWidth: 0,
        }}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{
            color: colors.secondary,
            fontFamily: 'font-dm-sans-regular',
            fontWeight: '400',
            fontSize: 24,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexWrap: 'nowrap',
          }}
        >
          {currentUpdate}
        </Text>

        <HStack
          style={{
            gap: 4,
            alignItems: 'center',
            width: '100%',
            minWidth: 0,
          }}
        >
          {arrowDownIcon && (
            <Icon
              as={Smartphone}
              size="xs"
              style={{
                color: colors.secondary,
                flexShrink: 0,
              }}
            />
          )}
          {arrowUpIcon && (
            <Icon
              as={GalleryVertical}
              size="xs"
              style={{
                color: colors.primary,
                flexShrink: 0,
              }}
            />
          )}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.secondary,
              fontFamily: 'font-dm-sans-regular',
              fontWeight: '500',
              fontSize: 12,
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexWrap: 'nowrap',
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
