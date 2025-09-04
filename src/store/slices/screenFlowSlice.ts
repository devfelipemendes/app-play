import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ScreenFlowState {
  mode: 'login' | 'cadastro'
}

const initialState: ScreenFlowState = {
  mode: 'login',
}

const screenFlowSlice = createSlice({
  name: 'screenFlow',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<'login' | 'cadastro'>) {
      state.mode = action.payload
    },
  },
})

export const { setMode } = screenFlowSlice.actions
export default screenFlowSlice.reducer
