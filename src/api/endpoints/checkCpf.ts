import { apiPlay } from '../apiPlay'

// ✅ Tipos para o endpoint de checagem de CPF
export interface CheckCpfRequest {
  cpf: string
}

export interface CheckCpfResponse {
  success: boolean
  descricao: string
  detalhes: string
  codigo: number
}

export const checkCpfApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    checkCpf: builder.mutation<CheckCpfResponse, CheckCpfRequest>({
      query: (params) => ({
        url: '/api/app/franquia/checa/cpf',
        method: 'POST',
        data: params,
      }),
      invalidatesTags: ['CheckCpf'],
    }),
  }),
})

export const { useCheckCpfMutation } = checkCpfApi
