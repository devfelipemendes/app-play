import React from 'react'
import { Pressable } from 'react-native'
import { Text } from '@/components/ui/text'
import { Icon } from '@/components/ui/icon'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

interface IThemeCard {
  title: string
  icon: any
  onPress: () => void
  active: boolean
}

const ThemeCard = ({ title, icon, onPress, active }: IThemeCard) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12, // py-3
        paddingHorizontal: 24, // px-6
        height: 56, // h-14
        borderRadius: 18,
        flex: 1,
        backgroundColor: active ? colors.primary : colors.primaryLight80,
        borderWidth: active ? 1 : 0,
        borderColor: active ? colors.primary : 'transparent',
      }}
    >
      <Icon
        as={icon}
        size="sm"
        style={{
          color: active ? colors.textButton : colors.text,
          marginRight: 12,
        }}
      />
      <Text
        style={{
          fontFamily: 'DM Sans-Medium',
          color: active ? colors.textButton : colors.text,
        }}
      >
        {title}
      </Text>
    </Pressable>
  )
}

export default ThemeCard
