import React, { type ComponentProps } from 'react'
import { Input, InputField, InputIcon, InputSlot } from '../ui/input'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'
import { Text } from '@gluestack-ui/themed'
import { KeyboardTypeOptions } from 'react-native'
import { any, boolean } from 'valibot'
import { ArrowUpToLineIcon } from 'lucide-react-native'

interface CustomInputProps extends InputFieldProps {
  label?: string
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  leftIcon?: any
  rightIcon?: any
  secureTextEntry?: boolean
  onEndIconPress?: () => void
  keyboardType?: KeyboardTypeOptions
  maxlength?: number
  editable?: boolean // nova prop para DatePicker
  pointerEvents?: 'none' | 'auto' | 'box-none' | 'box-only' // nova prop para DatePicker
  autoComplete?: any
}
type InputFieldProps = ComponentProps<typeof InputField>

export const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  leftIcon,
  rightIcon,
  secureTextEntry,
  onEndIconPress,
  keyboardType = 'default',
  maxlength,
  editable = true, // padrão true para manter compatibilidade
  pointerEvents = 'auto', // padrão auto para manter compatibilidade

  ...inputFieldProps
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
        // Muda aparência visual quando não editável
        backgroundColor: !editable ? colors.disabled + '20' : 'transparent',
      }}
      size="lg"
      pointerEvents={pointerEvents}
    >
      {leftIcon && (
        <InputSlot>
          <InputIcon as={leftIcon} style={{ color: colors.disabled }} />
        </InputSlot>
      )}

      <InputField
        {...inputFieldProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || label}
        placeholderTextColor="#eaeaea"
        style={{
          color: colors.text,
          fontSize: 12,
        }}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxlength}
        editable={editable}
      />

      {rightIcon && (
        <InputSlot onPress={onEndIconPress}>
          <InputIcon as={rightIcon} style={{ color: colors.disabled }} />
        </InputSlot>
      )}
    </Input>
  )
}
