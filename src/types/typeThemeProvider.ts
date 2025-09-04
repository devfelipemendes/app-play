// types/theme.types.ts
export interface AppThemeColors {
  primary: string
  secondary: string
}

export interface AppTheme {
  darkLightMode: boolean
  colors: AppThemeColors
}

export interface CompanyData {
  companyId: number
  companyname: string
  appTheme: string // JSON string que será parseado
  logotipo: string
  // outros campos conforme necessário
}
