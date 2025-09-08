// contexts/whitelabel-theme-context.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react'

export interface WhitelabelThemeColors {
  primary: string
  secondary: string
}

export interface WhitelabelTheme {
  darkLightMode: boolean
  colors: WhitelabelThemeColors
}

export interface CompanyData {
  companyId?: number
  companyname?: string
  appTheme?: string // JSON string
  logotipo?: string
}

interface WhitelabelThemeState {
  theme: WhitelabelTheme | null
  isLoading: boolean
  error: string | null
}

type WhitelabelThemeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: WhitelabelTheme }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' }

const initialState: WhitelabelThemeState = {
  theme: null,
  isLoading: false,
  error: null,
}

const whitelabelThemeReducer = (
  state: WhitelabelThemeState,
  action: WhitelabelThemeAction,
): WhitelabelThemeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload, isLoading: false, error: null }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

interface WhitelabelThemeContextType {
  theme: WhitelabelTheme | null
  isLoading: boolean
  error: string | null
  loadTheme: (companyData: CompanyData) => void
  resetTheme: () => void
}

const WhitelabelThemeContext = createContext<
  WhitelabelThemeContextType | undefined
>(undefined)

export const useWhitelabelTheme = () => {
  const context = useContext(WhitelabelThemeContext)
  if (!context) {
    throw new Error(
      'useWhitelabelTheme must be used within a WhitelabelThemeProvider',
    )
  }
  return context
}

interface WhitelabelThemeProviderProps {
  children: ReactNode
}

export const WhitelabelThemeProvider: React.FC<
  WhitelabelThemeProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(whitelabelThemeReducer, initialState)

  const loadTheme = (companyData: CompanyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Parse do JSON do appTheme

      const parsedTheme = JSON.parse(companyData.appTheme ?? '{}')

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

      dispatch({ type: 'SET_THEME', payload: theme })
    } catch (error) {
      console.error('Erro ao carregar tema da empresa:', error)
      dispatch({
        type: 'SET_ERROR',
        payload: 'Falha ao carregar tema da empresa',
      })

      // Fallback para tema padrão
      dispatch({
        type: 'SET_THEME',
        payload: {
          darkLightMode: false,
          colors: {
            primary: '#636363',
            secondary: '#000000',
          },
        },
      })
    }
  }

  const resetTheme = () => {
    dispatch({ type: 'RESET' })
  }

  return (
    <WhitelabelThemeContext.Provider
      value={{
        theme: state.theme,
        isLoading: state.isLoading,
        error: state.error,
        loadTheme,
        resetTheme,
      }}
    >
      {children}
    </WhitelabelThemeContext.Provider>
  )
}
