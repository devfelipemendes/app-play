import { env } from '@/config/env'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AtivarLinhaType {
  // Dados pessoais
  name: string
  email: string
  nascimento: string
  cpf: string
  phone: string
  whats: string

  // Endereço
  cep: string
  uf: string
  cidade: string
  district: string
  street: string
  number: string
  complement: string

  // Dados da ativação
  iccid: string
  ddd: string
  tipoChip: string

  // Sistema
  parceiro: string
  token: string
  companyid?: string | number
}

const initialState: AtivarLinhaType = {
  // Dados pessoais
  name: '',
  email: '',
  nascimento: '',
  cpf: '',
  phone: '',
  whats: '',

  // Endereço
  cep: '',
  uf: '',
  cidade: '',
  district: '',
  street: '',
  number: '',
  complement: '',

  // Dados da ativação
  iccid: '',
  ddd: '',
  tipoChip: '',

  // Sistema
  parceiro: env.PARCEIRO,
  token: '30684d5f2e7cfdd198e58f6a1efedf6f8da743c85ef0ef6558',
  companyid: env.COMPANY_ID,
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
