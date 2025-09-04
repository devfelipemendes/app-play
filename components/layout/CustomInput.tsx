import React from 'react'
import { Input, InputField, InputIcon, InputSlot } from '../ui/input'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { Text } from '@gluestack-ui/themed'
import { KeyboardTypeOptions } from 'react-native'

interface CustomInputProps {
  label?: string
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  leftIcon?: any
  rightIcon?: any
  secureTextEntry?: boolean
  onEndIconPress?: () => void
  keyboardType?: KeyboardTypeOptions // nova prop
  maxlength?: number
}

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  secureTextEntry,
  onEndIconPress,
  keyboardType = 'default', // valor padrão
  maxlength,
}: CustomInputProps) => {
  const { colors } = useCompanyThemeSimple()

  return (
    <Input
      variant="outline"
      className={`border-0 rounded-xl py-1 px-4 `}
      style={{
        borderColor: colors.primary,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: 8,
      }}
      size="lg"
    >
      {leftIcon && (
        <InputSlot>
          <InputIcon as={leftIcon} style={{ color: colors.disabled }} />
        </InputSlot>
      )}

      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#c3c3c3"
        style={{
          color: colors.text,
          fontSize: 12,
        }}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType} // aplica o tipo de teclado
        maxLength={maxlength}
      />

      {rightIcon && (
        <InputSlot onPress={onEndIconPress}>
          <InputIcon as={rightIcon} style={{ color: colors.disabled }} />
        </InputSlot>
      )}
    </Input>
  )
}
