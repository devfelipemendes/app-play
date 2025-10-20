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
import { TYPOGRAPHY, BORDER_RADIUS, moderateScale, scale } from '@/utils/responsive'
import { CARD, ICON, SHADOW } from '@/config/responsiveDimensions'

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
        padding: CARD.paddingSmall,
        borderRadius: BORDER_RADIUS.large,
        backgroundColor: colors.background,
        flex: 1,
        alignItems: 'flex-start',
        gap: moderateScale(16),
        ...SHADOW.small,
        boxShadow: colors.shadow,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <HStack
        style={{
          gap: moderateScale(8),
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
        }}
      >
        <Box
          style={{
            width: scale(28),
            height: scale(28),
            backgroundColor: colors.primary,
            borderRadius: BORDER_RADIUS.full,
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
            fontSize: TYPOGRAPHY.bodySmall,
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
          gap: moderateScale(8),
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
            fontSize: TYPOGRAPHY.h3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexWrap: 'nowrap',
          }}
        >
          {currentUpdate}
        </Text>

        <HStack
          style={{
            gap: moderateScale(4),
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
              fontSize: TYPOGRAPHY.caption,
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
