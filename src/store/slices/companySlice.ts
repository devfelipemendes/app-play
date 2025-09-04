// src/store/slices/companySlice.ts
import type { CompanyInfoResponse } from '@/src/api/endpoints/companyInfoApi'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CompanyState {
  data: CompanyInfoResponse | null
  isLoaded: boolean
  lastUpdated: string | null
}

const initialState: CompanyState = {
  data: null,
  isLoaded: false,
  lastUpdated: null,
}

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanyData: (state, action: PayloadAction<CompanyInfoResponse>) => {
      state.data = action.payload
      state.isLoaded = true
      state.lastUpdated = new Date().toISOString()
    },
    clearCompanyData: (state) => {
      state.data = null
      state.isLoaded = false
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    // Integração opcional com RTK Query
    // builder.addMatcher(
    //   companyApi.endpoints.getCompanyInfo.matchFulfilled,
    //   (state, action) => {
    //     state.data = action.payload
    //     state.isLoaded = true
    //     state.lastUpdated = new Date().toISOString()
    //   }
    // )
  },
})

export const { setCompanyData, clearCompanyData } = companySlice.actions
export default companySlice.reducer

// Selectors
export const selectCompanyData = (state: { company: CompanyState }) =>
  state.company.data
export const selectCompanyTheme = (state: { company: CompanyState }) => {
  const data = state.company.data
  if (!data?.appTheme) return null

  try {
    return JSON.parse(data.appTheme)
  } catch {
    return null
  }
}
