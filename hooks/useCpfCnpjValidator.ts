import { useCheckCpfMutation } from '@/src/api/endpoints/checkCpf'
import { cpf, cnpj } from 'cpf-cnpj-validator'
import { useState } from 'react'
import { unMask } from 'remask'

type DocumentType = 'cpf' | 'cnpj'

type ValidationResult = {
  isValid: boolean
  error?: string
  data?: any
}

export function useCpfCnpjCheck() {
  const [checkCpf, { isLoading }] = useCheckCpfMutation()
  const [localError, setLocalError] = useState<string | null>(null)

  const validateDocumentLocally = (value: string, type: string) => {
    const cleanValue = unMask(value)
    return type === 'cpf' ? cpf.isValid(cleanValue) : cnpj.isValid(cleanValue)
  }

  const validateAndCheck = async (
    value: string,
    type: string,
  ): Promise<ValidationResult> => {
    const cleanValue = unMask(value)

    // Validação local
    if (!validateDocumentLocally(cleanValue, type)) {
      const errorMsg = type === 'cpf' ? 'CPF inválido' : 'CNPJ inválido'
      setLocalError(errorMsg)
      return { isValid: false, error: errorMsg }
    }

    // Verifica se o documento está completo
    const expectedLength = type === 'cpf' ? 11 : 14
    if (cleanValue.length !== expectedLength) {
      setLocalError(null)
      return { isValid: true } // válido, mas incompleto
    }

    setLocalError(null)

    // Chama endpoint sempre via campo "cpf", backend entende CPF ou CNPJ
    try {
      const response = await checkCpf({ cpf: cleanValue }).unwrap()
      return { isValid: true, data: response }
    } catch (err: any) {
      return {
        isValid: true,
        error: err?.data?.descricao || `Erro ao validar ${type.toUpperCase()}`,
      }
    }
  }

  const clearError = () => setLocalError(null)

  return {
    validateAndCheck,
    validateDocumentLocally,
    clearError,
    isLoading,
    localError,
  }
}
