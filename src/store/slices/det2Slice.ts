// src/store/slices/det2Slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Det2Response } from '@/src/api/endpoints/getDetails'

interface Det2State {
  // Dados principais
  data: Det2Response | null

  // Estados de loading
  loading: boolean

  // Controle de erro
  error: string | null

  // Metadados úteis
  lastUpdated: string | null
  selectedLineIccid: string | null

  // Controle de inicialização
  hasInitialized: boolean
  userLines: any[] // Linhas do usuário

  // Cache para evitar chamadas desnecessárias
  cache: {
    [iccid: string]: {
      data: Det2Response
      timestamp: number
    }
  }
}

const initialState: Det2State = {
  data: null,
  loading: false,
  error: null,
  lastUpdated: null,
  selectedLineIccid: null,
  hasInitialized: false,
  userLines: [],
  cache: {},
}

const det2Slice = createSlice({
  name: 'det2',
  initialState,
  reducers: {
    // Ações de loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      if (action.payload) {
        state.error = null // Limpa erro ao iniciar loading
      }
    },

    // Definir dados principais
    setData: (state, action: PayloadAction<Det2Response>) => {
      state.data = action.payload
      state.loading = false
      state.error = null
      state.lastUpdated = new Date().toISOString()

      // Salvar no cache se tiver ICCID
      if (action.payload.iccid) {
        state.selectedLineIccid = action.payload.iccid
        state.cache[action.payload.iccid] = {
          data: action.payload,
          timestamp: Date.now(),
        }
      }
    },

    // Definir erro
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },

    // Limpar dados
    clearData: (state) => {
      state.data = null
      state.error = null
      state.lastUpdated = null
      state.selectedLineIccid = null
    },

    // Limpar cache
    clearCache: (state) => {
      state.cache = {}
    },

    // Buscar do cache
    loadFromCache: (state, action: PayloadAction<string>) => {
      const iccid = action.payload
      const cached = state.cache[iccid]

      if (cached) {
        // Verificar se cache não está muito antigo (5 minutos)
        const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000

        if (!isExpired) {
          state.data = cached.data
          state.selectedLineIccid = iccid
          state.error = null
          state.lastUpdated = new Date(cached.timestamp).toISOString()
        }
      }
    },

    // Atualizar linha selecionada
    setSelectedLineIccid: (state, action: PayloadAction<string>) => {
      state.selectedLineIccid = action.payload
    },

    // Marcar como inicializado
    setHasInitialized: (state, action: PayloadAction<boolean>) => {
      state.hasInitialized = action.payload
    },

    // Salvar linhas do usuário
    setUserLines: (state, action: PayloadAction<any[]>) => {
      state.userLines = action.payload
    },

    // Reset completo
    resetState: () => initialState,
  },
})

// Seletores úteis
export const selectDet2Data = (state: { det2: Det2State }) => state.det2.data
export const selectDet2Loading = (state: { det2: Det2State }) =>
  state.det2.loading
export const selectDet2Error = (state: { det2: Det2State }) => state.det2.error
export const selectDet2LastUpdated = (state: { det2: Det2State }) =>
  state.det2.lastUpdated
export const selectDet2SelectedIccid = (state: { det2: Det2State }) =>
  state.det2.selectedLineIccid
export const selectDet2HasInitialized = (state: { det2: Det2State }) =>
  state.det2.hasInitialized
export const selectDet2UserLines = (state: { det2: Det2State }) =>
  state.det2.userLines

// Seletor para verificar se existe cache para um ICCID
export const selectHasCacheForIccid =
  (iccid: string) => (state: { det2: Det2State }) => {
    const cached = state.det2.cache[iccid]
    if (!cached) return false

    // Verificar se não expirou (5 minutos)
    const isExpired = Date.now() - cached.timestamp > 5 * 60 * 1000
    return !isExpired
  }

// Seletor para dados formatados
export const selectFormattedDet2Data = (state: { det2: Det2State }) => {
  const data = state.det2.data
  if (!data) return null

  return {
    // Dados originais
    ...data,

    // Dados formatados
    formatted: {
      dados: data.dados ? `${data.dados} MB` : 'Sem dados',
      dadosGB: data.dados
        ? `${(parseFloat(data.dados) / 1024).toFixed(1)} GB`
        : 'Sem dados',
      minutos: data.minutos ? `${data.minutos} min` : 'Sem dados',
      sms: data.smsrestante ? `${data.smsrestante} SMS` : 'Sem dados',
      vencimento: data.atualizado || 'Data não disponível',
    },
  }
}

export const {
  setLoading,
  setData,
  setError,
  clearData,
  clearCache,
  loadFromCache,
  setSelectedLineIccid,
  setHasInitialized,
  setUserLines,
  resetState,
} = det2Slice.actions

export default det2Slice.reducer
