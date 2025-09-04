import { useTheme } from '@/contexts/theme-context'
import { useMemo } from 'react'
import { config } from '@gluestack-ui/config'
import { GluestackUIProvider } from '@gluestack-ui/themed'

interface ThemeWrapperProps {
  children: React.ReactNode
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { state } = useTheme()

  // Criar configuração customizada baseada no tema carregado
  const customConfig = useMemo(() => {
    if (!state.theme) return config

    // Aqui você pode customizar as cores do Gluestack baseado no tema
    const customizedConfig = {
      ...config,
      tokens: {
        ...config.tokens,
        colors: {
          ...config.tokens.colors,
          primary: state.theme.colors.primary,
          secondary: state.theme.colors.secondary,
        },
      },
    }

    return customizedConfig
  }, [state.theme])

  // Mostrar loading enquanto carrega o tema
  if (state.isLoading) {
    return (
      <GluestackUIProvider config={config}>
        {/* Aqui você pode colocar um componente de loading */}
        {children}
      </GluestackUIProvider>
    )
  }

  return (
    <GluestackUIProvider config={customConfig}>{children}</GluestackUIProvider>
  )
}
