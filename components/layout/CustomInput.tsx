import React from 'react'

import { Input, InputField, InputIcon, InputSlot } from '../ui/input'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

interface CustomInputProps {
  label?: string
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  leftIcon?: any
  rightIcon?: any
  secureTextEntry?: boolean
}

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  secureTextEntry,
}: CustomInputProps) => {
  const { color } = useCompanyThemeSimple
  return (
    <Input
      variant="outline"
      className={`border-0 rounded-xl py-1 px-4 `}
      size="lg"
    >
      {leftIcon && (
        <InputSlot>
          <InputIcon as={leftIcon} className="text-outline-200" />
        </InputSlot>
      )}

      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        className="placeholder:text-[#c3c3c3]"
        secureTextEntry={secureTextEntry}
      />

      {rightIcon && (
        <InputSlot>
          <InputIcon as={rightIcon} className="text-outline-200" />
        </InputSlot>
      )}
    </Input>
  )
}
