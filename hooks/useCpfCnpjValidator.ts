import { useCheckCpfMutation } from '@/src/api/endpoints/checkCpf'
import { isValidCPF, isValidCNPJ } from '@/utils/documentValidator'
import { useState } from 'react'
import { unMask } from 'remask'

type DocumentType = 'cpf' | 'cnpj'

export interface ValidationResult {
  // Validação local
  formatValid: boolean // Se o formato/algoritmo do CPF/CNPJ está correto

  // Validação no servidor
  serverChecked: boolean // Se a verificação no servidor foi feita
  hasAccount: boolean // Se já tem conta cadastrada
  hasActiveLine: boolean // Se tem linha ativa (deve ir para login)

  // Dados adicionais
  data?: any
  error?: string
  descricao?: string
  detalhes?: string
  codigo?: number
}

export function useCpfCnpjCheck() {
  const [checkCpf, { isLoading }] = useCheckCpfMutation()
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Valida apenas o formato/algoritmo do documento (SEM chamar API)
   */
  const validateDocumentLocally = (value: string, type: DocumentType): boolean => {
    const cleanValue = unMask(value)
    return type === 'cpf' ? isValidCPF(cleanValue) : isValidCNPJ(cleanValue)
  }

  /**
   * Validação COMPLETA: formato local + verificação no servidor
   * Retorna objeto com todas as informações necessárias para decidir o fluxo
   */
  const validateAndCheck = async (
    value: string,
    type: DocumentType,
  ): Promise<ValidationResult> => {
    const cleanValue = unMask(value)
    const expectedLength = type === 'cpf' ? 11 : 14

    // 🔍 ETAPA 1: Validação de formato/tamanho
    if (cleanValue.length !== expectedLength) {
      return {
        formatValid: false,
        serverChecked: false,
        hasAccount: false,
        hasActiveLine: false,
        error: 'Documento incompleto',
      }
    }

    // 🔍 ETAPA 2: Validação local do algoritmo
    const isFormatValid = validateDocumentLocally(cleanValue, type)

    if (!isFormatValid) {
      const errorMsg = type === 'cpf' ? 'CPF inválido' : 'CNPJ inválido'
      setLocalError(errorMsg)
      return {
        formatValid: false,
        serverChecked: false,
        hasAccount: false,
        hasActiveLine: false,
        error: errorMsg,
      }
    }

    setLocalError(null)

    // 🔍 ETAPA 3: Verificação no servidor
    try {
      const response = await checkCpf({ cpf: cleanValue }).unwrap()

      // ✅ CASO 1: Documento não encontrado (sem cadastro)
      if (response?.success === false && response?.descricao?.includes('não encontrado')) {
        return {
          formatValid: true,
          serverChecked: true,
          hasAccount: false,
          hasActiveLine: false,
          descricao: response.descricao,
          codigo: response.codigo,
        }
      }

      // ✅ CASO 2: Documento com linha ativa (deve fazer login)
      if (
        response?.success === false &&
        (response?.descricao?.toLowerCase().includes('linha ativa') ||
          response?.detalhes?.toLowerCase().includes('linha ativa'))
      ) {
        return {
          formatValid: true,
          serverChecked: true,
          hasAccount: true,
          hasActiveLine: true,
          descricao: response.descricao,
          detalhes: response.detalhes,
          codigo: response.codigo,
        }
      }

      // ✅ CASO 3: Documento cadastrado mas sem linha ativa (pode ativar)
      if (response?.success === true) {
        return {
          formatValid: true,
          serverChecked: true,
          hasAccount: true,
          hasActiveLine: false,
          data: response,
          descricao: response.descricao,
        }
      }

      // ✅ CASO 4: Outro tipo de erro do servidor
      return {
        formatValid: true,
        serverChecked: true,
        hasAccount: false,
        hasActiveLine: false,
        descricao: response?.descricao,
        detalhes: response?.detalhes,
        codigo: response?.codigo,
        error: response?.descricao || 'Erro ao validar documento',
      }
    } catch (err: any) {
      // ❌ Erro de rede ou resposta 4xx/5xx
      const data = err?.data || {}

      // Trata erro de "não encontrado" mesmo em catch
      if (data?.descricao?.includes('não encontrado')) {
        return {
          formatValid: true,
          serverChecked: true,
          hasAccount: false,
          hasActiveLine: false,
          descricao: data.descricao,
        }
      }

      return {
        formatValid: true,
        serverChecked: true,
        hasAccount: false,
        hasActiveLine: false,
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
