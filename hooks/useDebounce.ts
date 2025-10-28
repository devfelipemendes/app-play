// useDebounce.ts - Hook customizado para debounce
import { useCallback, useRef } from 'react'

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T & { cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // eslint-disable-next-line
  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      // Cancela o timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Cria novo timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args)
        timeoutRef.current = null
      }, delay)
    }) as T,
    [callback, delay],
  )

  // Função para cancelar o debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Adiciona a função cancel ao callback
  Object.assign(debouncedCallback, { cancel })

  return debouncedCallback as T & { cancel: () => void }
}
