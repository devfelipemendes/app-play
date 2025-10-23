// src/store/api/cadastroEndpoints.ts - Endpoint de cadastro

import { apiPlay } from '../apiPlay'
import type { FaturaDetalhada } from './faturaApi'

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
  fatura?: FaturaDetalhada
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
