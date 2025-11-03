// src/store/api/cadastroEndpoints.ts - Endpoint de cadastro

import { apiPlay } from '../apiPlay'

// ✅ Tipos para o endpoint de cadastro
export interface CadastroRequest {
  name: string
  email: string
  nascimento: string
  cpf: string
  phone: string
  whats: string
  parceiro: number | string
  nivel: number
  cep: string
  uf: string
  cidade: string
  district: string
  street: string
  number: number
  complement: string
  revendedor: string
  porcentagem_recarga: number
  porcentagem_ativacao: number
  parentcompany: number
  companyid: any
}

export interface CadastroResponse {
  success: boolean
  message: string
  data?: {
    userId: number
    email: string
    [key: string]: any
  }
  fatura?: string // ✅ CORRIGIDO: fatura é o paymentId (string), não o objeto completo
  error?: string
}

// ✅ Injetar endpoint na API existente
export const cadastroApiExtended = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Cadastrar novo usuário
    createUser: builder.mutation<CadastroResponse, CadastroRequest>({
      query: (userData) => ({
        url: '/api/app/cad',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const { useCreateUserMutation } = cadastroApiExtended
