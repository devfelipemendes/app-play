import moment from 'moment'
import { useState } from 'react'
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native'
import { Portal } from 'react-native-paper'
import {
  DatePickerModal,
  DatePickerModalSingleProps,
} from 'react-native-paper-dates'
import { Text } from '@gluestack-ui/themed'
import { useCompanyThemeSimple } from '@/hooks/theme/useThemeLoader'

import { CustomInput } from './CustomInput'

// Remove os campos obrigatórios de DatePickerProps
type DatePickerPropsOmitted = Omit<
  DatePickerModalSingleProps,
  'locale' | 'mode' | 'onDismiss' | 'visible' | 'date' | 'onConfirm'
>

interface DatePickerInputProps extends DatePickerPropsOmitted {
  inputMode?: 'flat' | 'outlined'
  style?: StyleProp<ViewStyle>
  initialValue?: string
  required?: boolean
  itemIcon?: string
  label?: string
  error?: boolean
  leftIcon?: any
  rightIcon?: any
  value: string // string no formato YYYY-MM-DD ou vazio
  onConfirm: (date: string) => void // recebe string formatada
}

export default function DatePickerInput({
  initialValue,
  onConfirm,
  inputMode,
  required,
  label,
  style,
  error,
  leftIcon,
  rightIcon,
  value,
  ...props
}: DatePickerInputProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const { colors } = useCompanyThemeSimple()

  // Converte string para Date para o DatePicker
  const getDateFromValue = (dateString: string): Date | undefined => {
    if (!dateString) return undefined

    // Tenta diferentes formatos de data
    const formats = ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']

    for (const format of formats) {
      const date = moment(dateString, format, true)
      if (date.isValid()) {
        return date.toDate()
      }
    }

    return undefined
  }

  // Formata a data para exibição no input
  const getDisplayValue = (dateString: string): string => {
    if (!dateString) return ''

    const date = getDateFromValue(dateString)
    if (!date) return dateString // retorna o valor original se não conseguir parsear

    return moment(date).format('DD/MM/YYYY')
  }

  return (
    <View style={style}>
      {/* Label opcional acima do input */}
      {label && (
        <Text
          style={{
            marginBottom: 8,
            fontSize: 14,
            color: colors.subTitle,
          }}
        >
          {label}
          {required && <Text style={{ color: 'red' }}>*</Text>}
        </Text>
      )}

      <Portal>
        <DatePickerModal
          {...props}
          locale="pt-BR"
          mode="single"
          visible={datePickerOpen}
          date={getDateFromValue(value)}
          onDismiss={() => setDatePickerOpen(false)}
          onConfirm={(params) => {
            if (params.date) {
              // Converte para formato YYYY-MM-DD para consistência
              const formattedDate = moment(params.date).format('YYYY-MM-DD')
              onConfirm(formattedDate)
            }
            setDatePickerOpen(false)
          }}
          allowEditing={false}
          // Configurações adicionais para melhor UX
          saveLabel="Confirmar"
          saveLabelDisabled={false}
          uppercase={false}
        />
      </Portal>

      <TouchableOpacity
        onPress={() => setDatePickerOpen(true)}
        activeOpacity={0.7}
      >
        <CustomInput
          value={getDisplayValue(value)}
          onChangeText={() => {}} // Não permite edição manual
          placeholder={label || 'Selecionar data'}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          autoComplete="off" // 🛡️ Desabilita autocomplete
          autoCorrect={false} // 🛡️ Desabilita correção automática
          autoCapitalize="none" // 🛡️ Senha sem capitalização
          textContentType="none" // 🛡️ iOS - remove sugestões
          // Torna o input visualmente "não editável"
          editable={false}
          pointerEvents="none" // Impede interação direta com o input
        />
      </TouchableOpacity>

      {/* Mensagem de erro opcional */}
      {error && (
        <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
          Data é obrigatória
        </Text>
      )}
    </View>
  )
}
