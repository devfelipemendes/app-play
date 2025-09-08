import { env } from '@/config/env'
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
  parceiro: env.PARCEIRO,
  token: '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
  iccid: '',
  ddd: '',
}

const ativarLinhaSlice = createSlice({
  name: 'ativarLinha',
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
