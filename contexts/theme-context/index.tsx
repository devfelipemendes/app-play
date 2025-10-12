// contexts/theme-context.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react'

export interface AppThemeColors {
  primary: string
  secondary: string
}

export interface WhitelabelTheme {
  darkLightMode: boolean
  colors: AppThemeColors
}

export interface CompanyData {
  companyId: number
  companyname: string
  appTheme: string // JSON string
  logotipo: string
  // outros campos conforme necessário
}

interface ThemeState {
  // Modo de cor existente (light/dark)
  colorMode: 'light' | 'dark'
  // Tema whitelabel da empresa
  whitelabelTheme: WhitelabelTheme | null
  // Estados de carregamento
  isLoading: boolean
  error: string | null
}

type ThemeAction =
  | { type: 'SET_COLOR_MODE'; payload: 'light' | 'dark' }
  | { type: 'SET_WHITELABEL_THEME'; payload: WhitelabelTheme }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }

const initialState: ThemeState = {
  colorMode: 'light',
  whitelabelTheme: null,
  isLoading: false,
  error: null,
}

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_COLOR_MODE':
      return { ...state, colorMode: action.payload }
    case 'SET_WHITELABEL_THEME':
      return {
        ...state,
        whitelabelTheme: action.payload,
        isLoading: false,
        error: null,
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'RESET':
      return { ...initialState, colorMode: state.colorMode } // Mantém colorMode
    default:
      return state
  }
}

interface ThemeContextType {
  // Compatibilidade com código existente
  colorMode: 'light' | 'dark'
  toggleColorMode: () => void
  setColorMode: (mode: 'light' | 'dark') => void

  // Novas funcionalidades whitelabel
  whitelabelTheme: WhitelabelTheme | null
  isLoading: boolean
  error: string | null
  setWhitelabelTheme: (theme: WhitelabelTheme) => void
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

  const setWhitelabelTheme = (theme: WhitelabelTheme) => {
    dispatch({ type: 'SET_WHITELABEL_THEME', payload: theme })
  }

  const loadThemeFromCompany = (companyData: CompanyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Parse do JSON do appTheme
      const parsedTheme = JSON.parse(companyData.appTheme)

      // Validação básica
      if (
        !parsedTheme.colors ||
        !parsedTheme.colors.primary ||
        !parsedTheme.colors.secondary
      ) {
        throw new Error('Formato de theme inválido')
      }

      const theme: WhitelabelTheme = {
        darkLightMode: parsedTheme.darkLightMode || false,
        colors: {
          primary: parsedTheme.colors.primary,
          secondary: parsedTheme.colors.secondary,
        },
      }

      setWhitelabelTheme(theme)

      // Se o tema da empresa especifica modo escuro/claro, aplicar
      if (theme.darkLightMode !== undefined) {
        dispatch({
          type: 'SET_COLOR_MODE',
          payload: theme.darkLightMode ? 'dark' : 'light',
        })
      }
    } catch (error) {
      console.error('Erro ao carregar tema da empresa:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Falha ao carregar tema da empresa',
      })

      // Fallback para tema padrão
      setWhitelabelTheme({
        darkLightMode: false,
        colors: {
          primary: '#007AFF',
          secondary: '#000000',
        },
      })
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        colorMode: state.colorMode,
        toggleColorMode,
        setColorMode,
        whitelabelTheme: state.whitelabelTheme,
        isLoading: state.isLoading,
        error: state.error,
        setWhitelabelTheme,
        loadThemeFromCompany,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
