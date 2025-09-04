import type { AppTheme } from '../types/typeThemeProvider'

export const validateThemeData = (themeString: string): boolean => {
  try {
    const parsed = JSON.parse(themeString)
    return !!(parsed.colors && parsed.colors.primary && parsed.colors.secondary)
  } catch {
    return false
  }
}

export const getDefaultTheme = (): AppTheme => ({
  darkLightMode: false,
  colors: {
    primary: '#007AFF',
    secondary: '#000000',
  },
})
