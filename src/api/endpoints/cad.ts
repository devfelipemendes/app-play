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
  parceiro: number
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
  token?: string
  parentcompany: number
}

export interface CadastroResponse {
  success: boolean
  message: string
  data?: {
    userId: number
    email: string
    [key: string]: any
  }
  error?: string
}

// ✅ Injetar endpoint na API existente
export const cadastroApiExtended = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Cadastrar novo usuário
    createUser: builder.mutation<CadastroResponse, CadastroRequest>({
      query: (userData) => ({
        url: '/api/cad',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const { useCreateUserMutation } = cadastroApiExtended
