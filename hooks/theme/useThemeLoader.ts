// hooks/useCompanyTheme.ts
import { useEffect } from 'react'

import { useSelector } from 'react-redux'
import { RootState } from '@/src/store' // Ajuste conforme sua estrutura
import { useAppSelector } from '@/src/store/hooks'
import { useWhitelabelTheme } from '@/contexts/theme-context/whitelabel-the,e-context'
import { useLazyGetCompanyInfoQuery } from '@/src/api/endpoints/AuthApi'

interface UseCompanyThemeParams {
  companyid?: number
  token?: string
  autoLoad?: boolean
}

export const useCompanyTheme = ({
  companyid,
  token,
  autoLoad = true,
}: UseCompanyThemeParams = {}) => {
  const {
    loadTheme,
    theme,
    isLoading: themeLoading,
    error: themeError,
  } = useWhitelabelTheme()

  // RTK Query hook
  const [
    getCompanyInfo,
    { data: companyData, error: apiError, isLoading: apiLoading, isFetching },
  ] = useLazyGetCompanyInfoQuery()

  // Pegar dados do Redux usando useAppSelector
  const authData = useAppSelector((state: any) => {
    // Ajuste conforme sua estrutura do Redux
    return {
      token: state.auth?.token || token,
      companyid: state.auth?.companyid || companyid,
    }
  })

  // Função para carregar dados da empresa
  const loadCompanyTheme = async (
    customCompanyId?: number,
    customToken?: string,
  ) => {
    const finalCompanyId = customCompanyId || authData.companyid
    const finalToken = customToken || authData.token

    if (!finalCompanyId || !finalToken) {
      console.warn('CompanyId ou Token não encontrados para carregar tema')
      return
    }

    try {
      const result = await getCompanyInfo({
        token: finalToken ?? finalToken,
        companyid: finalCompanyId ?? finalCompanyId,
        app: 'reqtk',
      }).unwrap()

      // Carregar tema com os dados recebidos
      if (result) {
        loadTheme(result)
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error)
    }
  }

  // Auto-carregar quando os dados estiverem disponíveis
  useEffect(() => {
    if (autoLoad && authData.companyid && authData.token) {
      loadCompanyTheme()
    }
  }, [autoLoad, authData.companyid, authData.token])

  return {
    // Dados da empresa
    companyData,

    // Tema whitelabel
    theme,

    // Estados de loading
    isLoading: apiLoading || isFetching || themeLoading,

    // Erros
    error: apiError || themeError,

    // Funções
    loadCompanyTheme,
    refetch: () => loadCompanyTheme(),
  }
}

// Hook alternativo mais simples para usar em componentes
export const useCompanyThemeSimple = () => {
  const { theme, isLoading, error } = useWhitelabelTheme()

  return {
    theme,
    isLoading,
    error,

    // Cores prontas para usar
    colors: theme
      ? {
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
        }
      : {
          primary: '#007AFF',
          secondary: '#000000',
        },
  }
}
