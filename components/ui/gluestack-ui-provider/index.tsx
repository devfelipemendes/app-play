// components/ThemeWrapper.tsx - Atualizado
import React, { useMemo } from 'react'
import { GluestackUIProvider } from '@gluestack-ui/themed'
import { createCustomConfig } from '@/config/theme'

interface ThemeWrapperProps {
  children: React.ReactNode
  colorMode?: 'light' | 'dark'
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
  colorMode = 'light',
}) => {
  const { theme, isLoading } = useWhitelabelTheme()

  // ✅ Gerar configuração customizada baseada no tema
  const customConfig = useMemo(() => {
    if (!theme) {
      return createCustomConfig() // Config padrão
    }

    return createCustomConfig({
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
    })
  }, [theme])

  // ✅ Mostrar loading ou usar config padrão
  if (isLoading) {
    return (
      <GluestackUIProvider config={createCustomConfig()} colorMode={colorMode}>
        {children}
      </GluestackUIProvider>
    )
  }

  return (
    <GluestackUIProvider config={customConfig} colorMode={colorMode}>
      {children}
    </GluestackUIProvider>
  )
}

// ✅ Componente exemplo usando as cores customizadas
import { Box, Text, Button, ButtonText } from '@gluestack-ui/themed'
import { useWhitelabelTheme } from '@/contexts/theme-context/whitelabel-the,e-context'

export const ThemedComponentExample: React.FC = () => {
  return (
    <Box p="$4">
      {/* ✅ Usando cores customizadas do token */}
      <Button bg="$primary500" mb="$2">
        <ButtonText>Botão Primário</ButtonText>
      </Button>

      <Button bg="$secondary500" mb="$2">
        <ButtonText>Botão Secundário</ButtonText>
      </Button>

      {/* ✅ Usando cores personalizadas */}
      <Button bg="$brand" mb="$2">
        <ButtonText>Botão Brand</ButtonText>
      </Button>

      <Text color="$brand" fontSize="$lg" fontWeight="bold">
        Texto com cor da marca
      </Text>

      {/* ✅ Usando variações */}
      <Box bg="$primary100" p="$3" rounded="$md" mt="$2">
        <Text color="$primary700">Box com fundo primário claro</Text>
      </Box>
    </Box>
  )
}
