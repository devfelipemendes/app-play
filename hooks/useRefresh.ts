import { useState, useCallback } from 'react'

/**
 * Hook genérico para implementar Pull-to-Refresh em qualquer tela
 *
 * @param refreshFunctions - Array de funções assíncronas que serão executadas ao fazer pull-to-refresh
 * @returns { refreshing, onRefresh } - Estado de loading e função para acionar o refresh
 *
 * @example
 * ```tsx
 * const { refreshing, onRefresh } = useRefresh([
 *   async () => await refetch(), // RTK Query refetch
 *   async () => await dispatch(fetchUserData()).unwrap(),
 * ])
 *
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
 *   }
 * >
 *   {children}
 * </ScrollView>
 * ```
 */
export const useRefresh = (refreshFunctions: Array<() => Promise<any>>) => {
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // Executa todas as funções em paralelo
      await Promise.all(refreshFunctions.map((fn) => fn()))
    } catch (error) {
      console.error('❌ Erro ao atualizar dados:', error)
    } finally {
      setRefreshing(false)
    }
  }, [refreshFunctions])

  return { refreshing, onRefresh }
}
