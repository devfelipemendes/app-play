// hooks/useCompanyTheme.ts
import { useEffect, useContext } from 'react'

import { useAppSelector } from '@/src/store/hooks'
import { useWhitelabelTheme } from '@/contexts/theme-context/whitelabel-the,e-context'
import { useLazyGetCompanyInfoQuery } from '@/src/api/endpoints/AuthApi'
import { lightenHexColor } from '@/src/utils/lightColorPrimary'
import { ThemeContext } from '@/contexts/theme-context'

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
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.colorMode === 'dark'

  const primaryColor = theme?.colors?.primary || '#cc3366'
  const secondaryColor = theme?.colors?.secondary || '#000000'

  return {
    theme,
    isLoading,
    error,
    isDark,

    // Cores prontas para usar com suporte a dark mode
    colors: {
      primary: primaryColor,
      primaryLight80: lightenHexColor(primaryColor, 80),
      primaryLight60: lightenHexColor(primaryColor, 60),
      primaryLight50: lightenHexColor(primaryColor, 50),
      secondary: secondaryColor,
      secondaryLight: lightenHexColor(secondaryColor, 80),

      // Cores que mudam com dark mode
      text: isDark ? '#ffffff' : '#1c1c22',
      textButton: '#ffffff',
      subTitle: isDark ? '#b0b0b0' : '#666',

      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',

      successLight: '#81c784',
      successDark: '#388e3c',

      errorLight: '#e57373',
      errorDark: '#d32f2f',

      warningLight: '#ffb74d',
      warningDark: '#f57c00',

      infoLight: '#64b5f6',
      infoDark: '#1976d2',

      disabled: isDark ? '#666666' : '#bdbdbd',
      divider: isDark ? '#333333' : '#e0e0e0',
      overlay: 'rgba(0,0,0,0.5)',

      background: isDark ? '#1a1a1a' : '#ffffff',
      backgroundSecondary: isDark ? '#2a2a2a' : '#f5f5f5',

      shadow: isDark ? '0px 1px 3px rgba(255, 255, 255, 0.1)' : '0px 1px 3px rgba(0, 0, 0, 0.24)',
      shadowLight: isDark ? '0px 1px 2px rgba(255, 255, 255, 0.05)' : '0px 1px 2px rgba(0, 0, 0, 0.12)',
      shadowMedium: isDark ? '0px 2px 4px rgba(255, 255, 255, 0.08)' : '0px 2px 4px rgba(0, 0, 0, 0.16)',
      shadowHeavy: isDark ? '0px 4px 8px rgba(255, 255, 255, 0.12)' : '0px 4px 8px rgba(0, 0, 0, 0.24)',
    },
  }
}
