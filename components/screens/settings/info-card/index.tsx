import React, { useState } from 'react'
import { Pressable, LayoutAnimation, Platform, UIManager } from 'react-native'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { Box } from '@/components/ui/box'
import { VStack } from '@/components/ui/vstack'
import { HStack } from '@/components/ui/hstack'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

// Habilita animações de layout no Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

interface InfoCardProps {
  title: string
  content: string
  icon: any
}

const InfoCard = ({ title, content, icon }: InfoCardProps) => {
  const { colors } = useCompanyThemeSimple()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsExpanded(!isExpanded)
  }

  return (
    <Pressable
      onPress={toggleExpand}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.24,
        shadowRadius: 3,
        elevation: 4,
      }}
    >
      <HStack style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <HStack space="md" style={{ alignItems: 'center', flex: 1 }}>
          <Box
            style={{
              padding: 10,
              backgroundColor: colors.primary + '15',
              borderRadius: 12,
            }}
          >
            <Icon as={icon} size="sm" style={{ color: colors.primary }} />
          </Box>
          <VStack style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.primary,
                marginBottom: 2,
              }}
            >
              {title}
            </Text>
            {isExpanded && (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: colors.text,
                  marginTop: 8,
                }}
              >
                {content}
              </Text>
            )}
          </VStack>
        </HStack>
        <Icon
          as={isExpanded ? ChevronUp : ChevronDown}
          size="lg"
          style={{ color: colors.text }}
        />
      </HStack>
    </Pressable>
  )
}

export default InfoCard
