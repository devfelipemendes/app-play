import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ScreenFlowState {
  mode: 'login' | 'cadastro' | 'esqueciSenha' | 'validarToken' | 'alterarSenha'
  cpf?: string
}

const initialState: ScreenFlowState = {
  mode: 'login',
  cpf: undefined,
}

const screenFlowSlice = createSlice({
  name: 'screenFlow',
  initialState,
  reducers: {
    setMode(state, action: PayloadAction<'login' | 'cadastro' | 'esqueciSenha' | 'validarToken' | 'alterarSenha'>) {
      state.mode = action.payload
    },
    setCpf(state, action: PayloadAction<string>) {
      state.cpf = action.payload
    },
  },
})

export const { setMode, setCpf } = screenFlowSlice.actions
export default screenFlowSlice.reducer
