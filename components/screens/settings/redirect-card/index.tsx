import React from 'react'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { ChevronRightIcon, Icon } from '@/components/ui/icon'
import { Box } from '@/components/ui/box'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

const RedirectCard = ({ title, icon }: { title: string; icon: any }) => {
  const { colors } = useCompanyThemeSimple()
  return (
    <Pressable
      style={{
        padding: 12, // p-3
        height: 56, // h-14
        flexDirection: 'row', // flex-row
        alignItems: 'center',
        backgroundColor: '#ffffff', // bg-background-100 (substitua pelo valor do seu theme)
        borderRadius: 18, // rounded-[18px]
        gap: 12, // gap-3

        boxShadow: ' 0px 1px 3px rgba(0, 0, 0, 0.24)',
        elevation: 4,
      }}
    >
      <Box
        style={{
          padding: 12, // p-3
        }}
      >
        <Icon as={icon} size="sm" style={{ color: `${colors.primary}` }} />
      </Box>

      <Text
        style={{
          fontFamily: 'DM Sans Medium', // font-dm-sans-medium
          color: '#111827', // text-typography-900
          flex: 1,
        }}
      >
        {title}
      </Text>

      <Box
        style={{
          height: 24, // h-6
          width: 24, // w-6
          backgroundColor: '#FFFFFF', // bg-background-0
          borderRadius: 12, // rounded-full
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          as={ChevronRightIcon}
          size="md"
          style={{ color: '#1F2937' /* text-background-800 */ }}
        />
      </Box>
    </Pressable>
  )
}

export default RedirectCard
