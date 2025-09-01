import React from 'react'

import { SearchIcon, Mic } from 'lucide-react-native'
import { Input, InputField, InputIcon, InputSlot } from '../ui/input'

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
  return (
    <Input
      variant="outline"
      className="border-0 bg-background-300 rounded-xl py-1 px-4 "
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
        className="placeholder:text-typography-200"
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
