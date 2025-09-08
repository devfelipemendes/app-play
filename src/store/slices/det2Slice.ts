import type { Det2Response } from '@/src/api/endpoints/getDetails'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Det2ViewState {
  selected: Det2Response | null
  loading: boolean
  error: string | null
}

const initialState: Det2ViewState = {
  selected: null,
  loading: false,
  error: null,
}

const det2Slice = createSlice({
  name: 'det2View',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setSelected: (state, action: PayloadAction<Det2Response | null>) => {
      state.selected = action.payload
    },
    clear: (state) => {
      state.selected = null
      state.loading = false
      state.error = null
    },
  },
})

export const { setLoading, setError, setSelected, clear } = det2Slice.actions
export default det2Slice.reducer
