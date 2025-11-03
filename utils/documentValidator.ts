/**
 * Validador de CPF e CNPJ
 * Não depende de bibliotecas externas - implementação própria
 */

/**
 * Valida CPF usando o algoritmo oficial
 * @param cpf - CPF limpo (somente números)
 * @returns true se CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '')

  // CPF deve ter 11 dígitos
  if (cleaned.length !== 11) {
    return false
  }

  // CPFs inválidos conhecidos (todos dígitos iguais)
  const invalidCPFs = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
  ]

  if (invalidCPFs.includes(cleaned)) {
    return false
  }

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(9))) {
    return false
  }

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.charAt(10))) {
    return false
  }

  return true
}

/**
 * Valida CNPJ usando o algoritmo oficial
 * @param cnpj - CNPJ limpo (somente números)
 * @returns true se CNPJ é válido
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '')

  // CNPJ deve ter 14 dígitos
  if (cleaned.length !== 14) {
    return false
  }

  // CNPJs inválidos conhecidos (todos dígitos iguais)
  const invalidCNPJs = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999',
  ]

  if (invalidCNPJs.includes(cleaned)) {
    return false
  }

  // Validação do primeiro dígito verificador
  let size = cleaned.length - 2
  let numbers = cleaned.substring(0, size)
  const digits = cleaned.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(0))) {
    return false
  }

  // Validação do segundo dígito verificador
  size = size + 1
  numbers = cleaned.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(digits.charAt(1))) {
    return false
  }

  return true
}

/**
 * Valida CPF ou CNPJ automaticamente
 * @param document - Documento limpo (somente números)
 * @returns objeto com tipo e validade
 */
export function validateDocument(document: string): {
  isValid: boolean
  type: 'cpf' | 'cnpj' | 'unknown'
  error?: string
} {
  const cleaned = document.replace(/\D/g, '')

  if (cleaned.length === 11) {
    return {
      isValid: isValidCPF(cleaned),
      type: 'cpf',
      error: isValidCPF(cleaned) ? undefined : 'CPF inválido',
    }
  }

  if (cleaned.length === 14) {
    return {
      isValid: isValidCNPJ(cleaned),
      type: 'cnpj',
      error: isValidCNPJ(cleaned) ? undefined : 'CNPJ inválido',
    }
  }

  return {
    isValid: false,
    type: 'unknown',
    error: 'Documento incompleto ou inválido',
  }
}
