import React from 'react'
import { Pressable } from '@gluestack-ui/themed'
import type { ColorValue, PressableProps } from 'react-native'

// Tipagem ajustada para Lucide + React Native
type IconButtonProps = PressableProps & {
  icon: React.FC<{ size?: number | string; color?: ColorValue }>
  size?: number
  color?: ColorValue
  bgColor?: ColorValue
  borderRadius?: number
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  size = 24,
  color = 'white',
  bgColor = 'primary',
  borderRadius = 50,
  ...props
}) => {
  return (
    <Pressable
      {...props}
      style={{
        width: size + 5,
        height: size + 5,
        borderRadius,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Icon size={size} color={color} />
    </Pressable>
  )
}
