import { mask } from 'remask'
import { startsWith } from 'valibot'

function formatPhoneNumber(phone: string): string {
  if (phone.length === 13 && startsWith('55')) return phone.replace(/^55/, '') // Remove "55" apenas se estiver no início

  return phone // Default return if no conditions are met
}

export const maskCnpj = (value: any) => (!!value ? mask(value, ['99.999.999/9999-99']) : '')
export const maskCpf = (value: any) => (!!value ? mask(value, ['999.999.999-99']) : '')

export const maskCnpjCpf = (value: any) => {
  if (!value) return ''
  const cleanedValue = value.replace(/\D/g, '') // Remove non-numeric characters

  if (cleanedValue.length === 11) {
    return mask(cleanedValue, ['999.999.999-99']) // Apply CPF mask
  } else if (cleanedValue.length === 14) {
    return mask(cleanedValue, ['99.999.999/9999-99']) // Apply CNPJ mask
  }

  return value // Return original value if it doesn't match CPF or CNPJ length
}

export const maskCelular = (value: any) => {
  if (!value) return ''
  const formattedValue = formatPhoneNumber(value) // Remove o "55" se existir

  return mask(formattedValue, ['(99) 99999-9999']) // Aplica a máscara
}

export const maskTelefone = (value: any) => (!!value ? mask(value, ['(99) 9999-9999']) : '')
export const maskCep = (value: any) => (!!value ? mask(value, ['99999-999']) : '')
export const maskUF = (value: any) => (!!value ? mask(value, ['AA']) : '')

export const maskNumeroInteiro = (value: string) => {
  // Remove qualquer coisa que não seja número
  const cleanedValue = value.replace(/\D/g, '')

  // Adiciona o ponto a cada 3 dígitos, começando da direita
  const formattedValue = cleanedValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return formattedValue
}

export const unmaskValue = (value: string) => {
  // Remove todos os caracteres não numéricos (removendo pontos)
  const cleanedValue = value.replace(/\D/g, '')

  return cleanedValue
}

export const maskCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}
