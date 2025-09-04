// config/theme.ts - Configuração customizada do Gluestack
import { config } from '@gluestack-ui/config'
import { createConfig } from '@gluestack-ui/themed'

// ✅ Função para gerar configuração dinâmica com cores customizadas
export const createCustomConfig = (customColors?: {
  primary: string
  secondary: string
}) => {
  if (!customColors) {
    return config // Retorna config padrão se não houver cores customizadas
  }

  // Gerar variações da cor primária (tons mais claros/escuros)
  const generateColorVariations = (baseColor: string) => {
    // Função simples para gerar variações (você pode usar uma lib como tinycolor2)
    const addOpacity = (color: string, opacity: string) => `${color}${opacity}`

    return {
      0: addOpacity(baseColor, '00'),
      50: addOpacity(baseColor, '0D'),
      100: addOpacity(baseColor, '1A'),
      200: addOpacity(baseColor, '33'),
      300: addOpacity(baseColor, '4D'),
      400: addOpacity(baseColor, '66'),
      500: baseColor, // Cor base
      600: baseColor, // Pode ser mais escura
      700: baseColor,
      800: baseColor,
      900: baseColor,
      950: baseColor,
    }
  }

  const primaryVariations = generateColorVariations(customColors.primary)
  const secondaryVariations = generateColorVariations(customColors.secondary)

  return createConfig({
    ...config,
    tokens: {
      ...config.tokens,
      colors: {
        ...config.tokens.colors,
        // ✅ Sobrescrever cores primárias
        primary0: primaryVariations[0],
        primary50: primaryVariations[50],
        primary100: primaryVariations[100],
        primary200: primaryVariations[200],
        primary300: primaryVariations[300],
        primary400: primaryVariations[400],
        primary500: primaryVariations[500],
        primary600: primaryVariations[600],
        primary700: primaryVariations[700],
        primary800: primaryVariations[800],
        primary900: primaryVariations[900],
        primary950: primaryVariations[950],

        // ✅ Cores secundárias
        secondary0: secondaryVariations[0],
        secondary50: secondaryVariations[50],
        secondary100: secondaryVariations[100],
        secondary200: secondaryVariations[200],
        secondary300: secondaryVariations[300],
        secondary400: secondaryVariations[400],
        secondary500: secondaryVariations[500],
        secondary600: secondaryVariations[600],
        secondary700: secondaryVariations[700],
        secondary800: secondaryVariations[800],
        secondary900: secondaryVariations[900],
        secondary950: secondaryVariations[950],

        // ✅ Cores customizadas para usar diretamente
        brand: customColors.primary,
        brandSecondary: customColors.secondary,
      },
    },
    aliases: {
      ...config.aliases,
      // ✅ Aliases customizados
      bg: 'backgroundColor',
      bgBrand: 'brand',
      textBrand: 'brand',
      borderBrand: 'brand',
    },
  })
}

// ✅ Hook para usar cores customizadas diretamente
export const useCustomColors = () => {
  return {
    $brand: 'var(--gluestack-colors-brand)',
    $brandSecondary: 'var(--gluestack-colors-brandSecondary)',
    $primary500: 'var(--gluestack-colors-primary500)',
    $secondary500: 'var(--gluestack-colors-secondary500)',
  }
}
