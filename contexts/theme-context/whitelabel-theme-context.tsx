// contexts/theme-context/whitelabel-theme-context.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';
import Constants from 'expo-constants';
import { env } from '@/config/env';

export interface WhitelabelThemeColors {
  primary: string;
  secondary: string;
  accent?: string;
  background?: {
    light: string;
    dark: string;
  };
  text?: {
    light: string;
    dark: string;
  };
}

export interface WhitelabelTheme {
  darkLightMode: boolean;
  colors: WhitelabelThemeColors;
  branding?: {
    companyName: string;
    logo?: string;
    tagline?: string;
  };
}

export interface CompanyData {
  companyId?: number;
  companyname?: string;
  appTheme?: string; // JSON string vindo da API
  logotipo?: string;
}

interface WhitelabelThemeState {
  theme: WhitelabelTheme | null;
  isLoading: boolean;
  error: string | null;
}

type WhitelabelThemeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THEME'; payload: WhitelabelTheme }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'RESET' };

const initialState: WhitelabelThemeState = {
  theme: null,
  isLoading: false,
  error: null,
};

const whitelabelThemeReducer = (
  state: WhitelabelThemeState,
  action: WhitelabelThemeAction
): WhitelabelThemeState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

interface WhitelabelThemeContextType {
  theme: WhitelabelTheme | null;
  isLoading: boolean;
  error: string | null;
  loadTheme: (companyData: CompanyData) => void;
  loadThemeFromAPI: () => Promise<void>;
  resetTheme: () => void;
}

const WhitelabelThemeContext = createContext<
  WhitelabelThemeContextType | undefined
>(undefined);

export const useWhitelabelTheme = () => {
  const context = useContext(WhitelabelThemeContext);
  if (!context) {
    throw new Error(
      'useWhitelabelTheme must be used within a WhitelabelThemeProvider'
    );
  }
  return context;
};

interface WhitelabelThemeProviderProps {
  children: ReactNode;
}

/**
 * Carrega tema do arquivo local do tenant (fallback/inicial)
 */
const loadLocalTheme = (): WhitelabelTheme | null => {
  try {
    const tenantId = env.TENANT_ID;

    if (__DEV__) {
      console.log(`🎨 Loading local theme for tenant: ${tenantId}`);
    }

    // Tenta carregar do arquivo local
    const localTheme = require(`../../partners/partner-${tenantId}-playmovel/theme.json`);

    if (localTheme && localTheme.colors) {
      return localTheme;
    }
  } catch (error) {
    console.warn('⚠️  Could not load local theme, will fetch from API:', error);
  }

  return null;
};

export const WhitelabelThemeProvider: React.FC<
  WhitelabelThemeProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(whitelabelThemeReducer, initialState);

  /**
   * Carrega tema do backend (via API)
   * Este método sobrescreve o tema local com as cores vindas do endpoint
   */
  const loadThemeFromAPI = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Busca informações da empresa no backend
      const response = await fetch(
        `${env.API_URL}/api/tenants/${env.COMPANY_ID}`,
        {
          headers: {
            Authorization: `Bearer ${env.ACCESS_TK}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const companyData = await response.json();

      // Parse do appTheme vindo da API
      if (companyData.appTheme) {
        const parsedTheme =
          typeof companyData.appTheme === 'string'
            ? JSON.parse(companyData.appTheme)
            : companyData.appTheme;

        // Validação
        if (
          parsedTheme.colors &&
          parsedTheme.colors.primary &&
          parsedTheme.colors.secondary
        ) {
          const theme: WhitelabelTheme = {
            darkLightMode: parsedTheme.darkLightMode || false,
            colors: {
              primary: parsedTheme.colors.primary,
              secondary: parsedTheme.colors.secondary,
              accent: parsedTheme.colors.accent,
              background: parsedTheme.colors.background,
              text: parsedTheme.colors.text,
            },
            branding: parsedTheme.branding || {
              companyName: companyData.companyname || env.PARCEIRO,
              logo: companyData.logotipo,
            },
          };

          dispatch({ type: 'SET_THEME', payload: theme });

          if (__DEV__) {
            console.log('✅ Theme loaded from API:', theme);
          }

          return;
        }
      }

      throw new Error('Invalid theme format from API');
    } catch (error) {
      console.error('❌ Error loading theme from API:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load theme from API',
      });

      // Fallback: tenta carregar tema local
      const localTheme = loadLocalTheme();
      if (localTheme) {
        dispatch({ type: 'SET_THEME', payload: localTheme });
      } else {
        // Último fallback: tema padrão hardcoded
        dispatch({
          type: 'SET_THEME',
          payload: {
            darkLightMode: false,
            colors: {
              primary: '#007AFF',
              secondary: '#5856D6',
            },
            branding: {
              companyName: env.PARCEIRO,
            },
          },
        });
      }
    }
  };

  /**
   * Carrega tema de CompanyData (compatibilidade com código existente)
   */
  const loadTheme = (companyData: CompanyData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const parsedTheme = JSON.parse(companyData.appTheme ?? '{}');

      if (
        !parsedTheme.colors ||
        !parsedTheme.colors.primary ||
        !parsedTheme.colors.secondary
      ) {
        throw new Error('Invalid theme format');
      }

      const theme: WhitelabelTheme = {
        darkLightMode: parsedTheme.darkLightMode || false,
        colors: {
          primary: parsedTheme.colors.primary,
          secondary: parsedTheme.colors.secondary,
          accent: parsedTheme.colors.accent,
          background: parsedTheme.colors.background,
          text: parsedTheme.colors.text,
        },
        branding: {
          companyName: companyData.companyname || env.PARCEIRO,
          logo: companyData.logotipo,
        },
      };

      dispatch({ type: 'SET_THEME', payload: theme });
    } catch (error) {
      console.error('Error loading theme:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: 'Failed to load theme',
      });

      // Fallback
      const localTheme = loadLocalTheme();
      if (localTheme) {
        dispatch({ type: 'SET_THEME', payload: localTheme });
      }
    }
  };

  const resetTheme = () => {
    dispatch({ type: 'RESET' });
  };

  // Auto-load: Primeiro tenta tema local, depois busca da API
  useEffect(() => {
    // 1. Carrega tema local imediatamente (para não ter flash de conteúdo)
    const localTheme = loadLocalTheme();
    if (localTheme) {
      dispatch({ type: 'SET_THEME', payload: localTheme });
    }

    // 2. Busca tema atualizado da API (pode sobrescrever o local)
    loadThemeFromAPI();
  }, []);

  return (
    <WhitelabelThemeContext.Provider
      value={{
        theme: state.theme,
        isLoading: state.isLoading,
        error: state.error,
        loadTheme,
        loadThemeFromAPI,
        resetTheme,
      }}
    >
      {children}
    </WhitelabelThemeContext.Provider>
  );
};
