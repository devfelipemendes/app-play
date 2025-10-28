// contexts/theme-context.tsx - Tema para Play Móvel com suporte a cores do backend
import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface AppThemeColors {
  primary: string
  secondary: string
  accent: string
}

export interface AppTheme {
  darkLightMode: boolean
  colors: AppThemeColors
  branding: {
    companyName: string
    tagline: string
  }
}

export interface CompanyData {
  companyId?: number
  companyname?: string
  appTheme?: string // JSON string com cores
  logotipo?: string
}

// Tema padrão do Play Móvel (Partner 46)
const DEFAULT_THEME: AppTheme = {
  darkLightMode: true,
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF9500',
  },
  branding: {
    companyName: 'PLAY MÓVEL',
    tagline: 'Conecte-se com liberdade',
  },
}

interface ThemeState {
  colorMode: 'light' | 'dark'
  theme: AppTheme
  isLoading: boolean
}

type ThemeAction =
  | { type: 'SET_COLOR_MODE'; payload: 'light' | 'dark' }
  | { type: 'SET_THEME'; payload: AppTheme }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: ThemeState = {
  colorMode: 'light',
  theme: DEFAULT_THEME,
  isLoading: false,
}

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    default:
      return state
  }
}

interface ThemeContextType {
  colorMode: 'light' | 'dark'
  theme: AppTheme
  isLoading: boolean
  toggleColorMode: () => void
  setColorMode: (mode: 'light' | 'dark') => void
  loadThemeFromCompany: (companyData: CompanyData) => void
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState)

  const toggleColorMode = () => {
    dispatch({
      type: 'SET_COLOR_MODE',
      payload: state.colorMode === 'light' ? 'dark' : 'light',
    })
  }

  const setColorMode = (mode: 'light' | 'dark') => {
    dispatch({
      type: 'SET_COLOR_MODE',
      payload: mode,
    })
  }

  const loadThemeFromCompany = (companyData: CompanyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Se não tiver appTheme, usa o tema padrão
      if (!companyData.appTheme) {
        dispatch({ type: 'SET_THEME', payload: DEFAULT_THEME })
        return
      }

      // Parse do JSON do appTheme vindo do getCompany
      const parsedTheme = JSON.parse(companyData.appTheme)

      // Validação básica
      if (
        !parsedTheme.colors ||
        !parsedTheme.colors.primary ||
        !parsedTheme.colors.secondary
      ) {
        console.warn('Formato de theme inválido, usando tema padrão')
        dispatch({ type: 'SET_THEME', payload: DEFAULT_THEME })
        return
      }

      // Constrói o tema com as cores do backend
      const theme: AppTheme = {
        darkLightMode: parsedTheme.darkLightMode ?? DEFAULT_THEME.darkLightMode,
        colors: {
          primary: parsedTheme.colors.primary,
          secondary: parsedTheme.colors.secondary,
          accent: parsedTheme.colors.accent || DEFAULT_THEME.colors.accent,
        },
        branding: {
          companyName: companyData.companyname || DEFAULT_THEME.branding.companyName,
          tagline: DEFAULT_THEME.branding.tagline,
        },
      }

      dispatch({ type: 'SET_THEME', payload: theme })

      // Aplica o color mode se especificado
      if (theme.darkLightMode !== undefined) {
        dispatch({
          type: 'SET_COLOR_MODE',
          payload: theme.darkLightMode ? 'dark' : 'light',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar tema da empresa:', error)
      // Fallback para tema padrão em caso de erro
      dispatch({ type: 'SET_THEME', payload: DEFAULT_THEME })
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        colorMode: state.colorMode,
        theme: state.theme,
        isLoading: state.isLoading,
        toggleColorMode,
        setColorMode,
        loadThemeFromCompany,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
