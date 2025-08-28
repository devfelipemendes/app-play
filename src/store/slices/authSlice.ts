import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// ✅ Interfaces adaptadas do código antigo
interface ICompanyInfo {
  companyId?: number
  companyname?: string | null
  cnpj?: string | null
  tradename?: string | null
  logotipo?: string | null
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

interface AuthState {
  // Estados do usuário
  user: { [key: string]: any } | null
  isAuthenticated: boolean

  // Estados da empresa
  companyInfo: ICompanyInfo | null

  // Estados de loading
  loadingSystem: boolean
  loadingAuth: boolean

  // Estados de erro
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  companyInfo: null,
  loadingSystem: true,
  loadingAuth: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Loading states
    setLoadingAuth: (state, action: PayloadAction<boolean>) => {
      state.loadingAuth = action.payload
    },
    setLoadingSystem: (state, action: PayloadAction<boolean>) => {
      state.loadingSystem = action.payload
    },

    // ✅ User management
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },

    // ✅ Company info
    setCompanyInfo: (state, action: PayloadAction<ICompanyInfo>) => {
      state.companyInfo = action.payload
    },

    // ✅ Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  setLoadingAuth,
  setLoadingSystem,
  setUser,
  clearUser,
  setCompanyInfo,
  setError,
  clearError,
} = authSlice.actions

export default authSlice.reducer
