import { useCallback } from 'react'

// Hook para fazer retry em chamadas de API
export const useApiRetry = () => {
  const retryApiCall = useCallback(async <T,>(
    apiCall: () => Promise<T>,
    options: {
      maxRetries?: number
      onAttempt?: (attempt: number, maxRetries: number) => void
      onError?: (attempt: number, error: any) => void
      shouldRetry?: (error: any) => boolean
    } = {}
  ): Promise<T> => {
    const {
      maxRetries = 5,
      onAttempt,
      onError,
      shouldRetry = (err) => err?.status !== 401, // Por padrão, não retry em 401
    } = options

    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (onAttempt) {
          onAttempt(attempt, maxRetries)
        }

        const result = await apiCall()
        return result
      } catch (err: any) {
        lastError = err

        if (onError) {
          onError(attempt, err)
        }

        // Se não deve fazer retry ou é a última tentativa, lança o erro
        if (!shouldRetry(err) || attempt === maxRetries) {
          throw err
        }

        // Aguardar antes da próxima tentativa (backoff progressivo)
        const delayMs = attempt * 1000 // 1s, 2s, 3s, 4s
        console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    }

    throw lastError
  }, [])

  return { retryApiCall }
}
