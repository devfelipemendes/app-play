// hooks/useCompanyTheme.ts
import { useEffect, useContext, useMemo } from 'react'

import { useAppSelector } from '@/src/store/hooks'
import { useLazyGetCompanyInfoQuery } from '@/src/api/endpoints/AuthApi'
import { lightenHexColor } from '@/src/utils/lightColorPrimary'
import { ThemeContext } from '@/contexts/theme-context'

interface UseCompanyThemeParams {
  companyid?: number
  token?: string
  autoLoad?: boolean
}

// Hook para carregar dados da empresa e atualizar o Redux
export const useCompanyTheme = ({
  companyid,
  token,
  autoLoad = true,
}: UseCompanyThemeParams = {}) => {
  // RTK Query hook
  const [
    getCompanyInfo,
    { data: companyData, error: apiError, isLoading: apiLoading, isFetching },
  ] = useLazyGetCompanyInfoQuery()

  // Pegar dados do Redux usando useAppSelector
  const authData = useAppSelector((state: any) => {
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

      console.log('✅ Dados da empresa carregados:', result)
      return result
    } catch (error) {
      console.error('❌ Erro ao buscar dados da empresa:', error)
      throw error
    }
  }

  // Auto-carregar quando os dados estiverem disponíveis
  useEffect(() => {
    if (autoLoad && authData.companyid && authData.token) {
      loadCompanyTheme()
    }
    // eslint-disable-next-line
  }, [autoLoad, authData.companyid, authData.token])

  return {
    // Dados da empresa
    companyData,

    // Estados de loading
    isLoading: apiLoading || isFetching,

    // Erros
    error: apiError,

    // Funções
    loadCompanyTheme,
    refetch: () => loadCompanyTheme(),
  }
}

// Hook alternativo mais simples para usar em componentes
// Busca cores diretamente do companyInfo no Redux
export const useCompanyThemeSimple = () => {
  const themeContext = useContext(ThemeContext)
  const isDark = themeContext?.colorMode === 'dark'

  // Buscar apenas o appTheme do Redux para otimizar re-renders
  const appTheme = useAppSelector((state) => state.auth.companyInfo?.appTheme)

  // Usar useMemo para cachear o parse e só recalcular quando appTheme mudar
  const { primaryColor, secondaryColor } = useMemo(() => {
    let primary = '#636363' // Fallback padrão
    let secondary = '#520258' // Fallback padrão

    try {
      if (appTheme) {
        const parsedTheme =
          typeof appTheme === 'string' ? JSON.parse(appTheme) : appTheme

        if (parsedTheme.colors?.primary) {
          primary = parsedTheme.colors.primary
        }
        if (parsedTheme.colors?.secondary) {
          secondary = parsedTheme.colors.secondary
        }
      }
    } catch (error) {
      console.error('❌ Erro ao parsear appTheme:', error)
    }

    return { primaryColor: primary, secondaryColor: secondary }
  }, [appTheme])

  // Memoizar objeto colors para evitar recriação desnecessária
  const colors = useMemo(
    () => ({
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

      shadow: isDark
        ? '0px 1px 3px rgba(255, 255, 255, 0.1)'
        : '0px 1px 3px rgba(0, 0, 0, 0.24)',
      shadowLight: isDark
        ? '0px 1px 2px rgba(255, 255, 255, 0.05)'
        : '0px 1px 2px rgba(0, 0, 0, 0.12)',
      shadowMedium: isDark
        ? '0px 2px 4px rgba(255, 255, 255, 0.08)'
        : '0px 2px 4px rgba(0, 0, 0, 0.16)',
      shadowHeavy: isDark
        ? '0px 4px 8px rgba(255, 255, 255, 0.12)'
        : '0px 4px 8px rgba(0, 0, 0, 0.24)',
    }),
    [primaryColor, secondaryColor, isDark],
  )

  return {
    isDark,
    colors,
  }
}
