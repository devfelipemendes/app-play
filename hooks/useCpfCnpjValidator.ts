import { useCheckCpfMutation } from '@/src/api/endpoints/checkCpf'
import { cpf, cnpj } from 'cpf-cnpj-validator'
import { useState } from 'react'
import { unMask } from 'remask'

type DocumentType = 'cpf' | 'cnpj'

export interface ValidationResult {
  isValid: boolean
  data?: any
  error?: string
  descricao?: string
  detalhes?: string
  codigo?: number
}

export function useCpfCnpjCheck() {
  const [checkCpf, { isLoading }] = useCheckCpfMutation()
  const [localError, setLocalError] = useState<string | null>(null)

  const validateDocumentLocally = (value: string, type: DocumentType) => {
    const cleanValue = unMask(value)
    return type === 'cpf' ? cpf.isValid(cleanValue) : cnpj.isValid(cleanValue)
  }

  const validateAndCheck = async (
    value: string,
    type: DocumentType,
  ): Promise<ValidationResult> => {
    const cleanValue = unMask(value)

    // 🧩 Validação local
    if (!validateDocumentLocally(cleanValue, type)) {
      const errorMsg = type === 'cpf' ? 'CPF inválido' : 'CNPJ inválido'
      setLocalError(errorMsg)
      return { isValid: false, error: errorMsg }
    }

    // 🧩 Se o documento ainda está incompleto, não chama API
    const expectedLength = type === 'cpf' ? 11 : 14
    if (cleanValue.length !== expectedLength) {
      setLocalError(null)
      return { isValid: true }
    }

    setLocalError(null)

    try {
      const response = await checkCpf({ cpf: cleanValue }).unwrap()

      // 🟢 Caso sucesso
      if (response?.success) {
        return { isValid: true, data: response }
      }

      // 🔴 Caso com erro de "linha ativa" ou outro tipo
      return {
        isValid: false,
        descricao: response?.descricao,
        detalhes: response?.detalhes,
        codigo: response?.codigo,
        error: response?.descricao || 'Erro ao validar documento',
      }
    } catch (err: any) {
      // 🔴 Falha de rede ou resposta 4xx/5xx
      const data = err?.data || {}
      return {
        isValid: false,
        descricao: data.descricao,
        detalhes: data.detalhes,
        codigo: data.codigo,
        error: data.descricao || `Erro ao validar ${type.toUpperCase()}`,
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
