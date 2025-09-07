import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AtivarLinhaType {
  cpf: string
  name: string
  parceiro: string
  token: string
  iccid: string
  ddd: string
}

const initialState: AtivarLinhaType = {
  cpf: '',
  name: '',
  parceiro: '',
  token: '',
  iccid: '',
  ddd: '',
}

const ativarLinhaSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<Partial<AtivarLinhaType>>) => {
      return { ...state, ...action.payload }
    },
    clearUserInfo: () => initialState,
  },
})

export const { setUserInfo, clearUserInfo } = ativarLinhaSlice.actions
export default ativarLinhaSlice.reducer
