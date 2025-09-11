// src/utils/phoneFormatter.ts
import { mask } from 'remask'

export const usePhoneFormatter = () => {
  const formatPhone = (phoneNumber: string | number): string => {
    if (!phoneNumber) return ''

    // Converter para string e remover caracteres não numéricos
    const cleanNumber = phoneNumber.toString().replace(/\D/g, '')

    // Se tiver 13 dígitos e começar com 55, remover o 55
    let numberToFormat = cleanNumber
    if (cleanNumber.length === 13 && cleanNumber.startsWith('55')) {
      numberToFormat = cleanNumber.substring(2) // Remove os primeiros 2 dígitos (55)
    }

    // Aplicar máscara apenas se tiver 11 dígitos
    if (numberToFormat.length === 11) {
      return mask(numberToFormat, ['(99) 9 9999-9999'])
    }

    // Se não tiver 11 dígitos, retornar sem máscara ou com máscara parcial
    if (numberToFormat.length <= 11) {
      return mask(numberToFormat, ['(99) 9 9999-9999'])
    }

    // Se tiver mais de 11 dígitos, truncar e aplicar máscara
    return mask(numberToFormat.substring(0, 11), ['(99) 9 9999-9999'])
  }

  return {
    formatPhone,
  }
}

// Função standalone para usar fora de componentes
export const formatPhoneNumber = (phoneNumber: string | number): string => {
  if (!phoneNumber) return ''

  // Converter para string e remover caracteres não numéricos
  const cleanNumber = phoneNumber.toString().replace(/\D/g, '')

  // Se tiver 13 dígitos e começar com 55, remover o 55
  let numberToFormat = cleanNumber
  if (cleanNumber.length === 13 && cleanNumber.startsWith('55')) {
    numberToFormat = cleanNumber.substring(2) // Remove os primeiros 2 dígitos (55)
  }

  // Aplicar máscara apenas se tiver 11 dígitos
  if (numberToFormat.length === 11) {
    return mask(numberToFormat, ['(99) 9 9999-9999'])
  }

  // Se não tiver 11 dígitos, retornar sem máscara ou com máscara parcial
  if (numberToFormat.length <= 11) {
    return mask(numberToFormat, ['(99) 9 9999-9999'])
  }

  // Se tiver mais de 11 dígitos, truncar e aplicar máscara
  return mask(numberToFormat.substring(0, 11), ['(99) 9 9999-9999'])
}

// Exemplos de uso:
/*
formatPhoneNumber('5561999887766') // 13 dígitos com 55 -> (61) 9 9988-7766
formatPhoneNumber('61999887766')   // 11 dígitos -> (61) 9 9988-7766
formatPhoneNumber('11999887766')   // 11 dígitos -> (11) 9 9988-7766
formatPhoneNumber('5511999887766') // 13 dígitos com 55 -> (11) 9 9988-7766
formatPhoneNumber('999887766')     // 9 dígitos -> 9 9988-7766 (máscara parcial)
*/
