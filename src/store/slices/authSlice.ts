// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ICompanyInfo {
  companyId?: number
  companyname?: string | null
  cnpj?: string | null
  tradename?: string | null
  logotipo?: string | null | undefined
  nomeparceiro?: string | null
  email?: string | null
  celular?: string | null
  telefone?: string | null
  cep?: string | null
  endereco?: string | null
  numeroendereco?: string | null
  complemento?: string | null
  bairro?: string | null
  inscricaomunicipal?: string | null
  inscricaoestadual?: string | null
  observacoes?: string | null
  walletid?: string | null
  link_playstore?: string | null
  link_appstore?: string | null
  link_website?: string | null
  link_chat?: string | null
  pospago?: boolean | null
  link_contrato?: string | null
  consultor?: string | null
  token?: string | null
  appTheme?: string | null
  appversion?: string | null
}

interface Fatura {
  // Defina a estrutura das faturas se necessário
  // Como o array está vazio no exemplo, deixamos genérico
  [key: string]: any
}

interface User {
  parceiro: string
  cnpj: string
  cnpjFranquia: string | null
  cpf: string
  name: string
  email: string
  userid: number
  companyid: number
  profileid: number
  token: string
  logotipo: string // Base64 encoded image
  status: number
  status_parceiro: number
  faturaaberta: number
  faturas: Fatura[]
  pospago: boolean
  mk: boolean
  cadastrocompleto: boolean
  pages: any | null // Pode ser especificado mais detalhadamente se necessário
  parceirorevendedor: boolean
  etapaCadastro: any | null // Pode ser especificado mais detalhadamente se necessário
  super: any | null // Pode ser especificado mais detalhadamente se necessário
  idIndicacao: any | null // Pode ser especificado mais detalhadamente se necessário
  primeiroAcesso?: boolean
  airtime_company: boolean
  airtime_comissao: boolean
  rede_company: string
  link_logo: string | null
  [key: string]: any
}

interface AuthState {
  // Estados do usuário
  user: User | null
  isAuthenticated: boolean

  // Estados da empresa
  companyInfo: ICompanyInfo | null

  // Estados de loading
  loadingSystem: boolean
  loadingAuth: boolean
  isCheckingAuth: boolean // Novo estado para verificação inicial

  // Estados de erro
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  companyInfo: null,
  loadingSystem: true,
  loadingAuth: false,
  isCheckingAuth: true, // Inicia como true para verificar autenticação
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Loading states
    setLoadingAuth: (state, action: PayloadAction<boolean>) => {
      state.loadingAuth = action.payload
    },
    setLoadingSystem: (state, action: PayloadAction<boolean>) => {
      state.loadingSystem = action.payload
    },
    setCheckingAuth: (state, action: PayloadAction<boolean>) => {
      state.isCheckingAuth = action.payload
    },

    // User management
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },

    // Company info
    setCompanyInfo: (state, action: PayloadAction<ICompanyInfo>) => {
      state.companyInfo = action.payload
    },

    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },

    // Reset state - PRESERVA companyInfo pois é necessário na tela de login
    resetAuthState: (state) => ({
      ...initialState,
      companyInfo: state.companyInfo, // Mantém companyInfo após logout
    }),
  },
})

export const {
  setLoadingAuth,
  setLoadingSystem,
  setCheckingAuth,
  setUser,
  clearUser,
  setCompanyInfo,
  setError,
  clearError,
  resetAuthState,
} = authSlice.actions

export default authSlice.reducer
