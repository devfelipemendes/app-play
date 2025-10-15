// src/api/endpoints/consumoApi.ts
import { apiPlay } from '../apiPlay'

// ✅ Tipos para request
export interface GetConsumoRequest {
  msisdn: string
  tipo: 'dados' // Sempre será "dados" por enquanto
  mes: string // Formato: "01", "02", etc
  ano: string // Formato: "2025"
}

// ✅ Tipos para consumo diário
export interface ConsumoDaily {
  qtUsadoDownload: number
  qtUsadoUpload: number
  dtConsumo: string // ISO Date string
}

// ✅ Tipos para response
export interface GetConsumoResponse {
  sucesso: number
  transacao: string
  resultados: ConsumoDaily[]
  transaction: {
    globalTransactionId: string
    localTransactionId: string
    localTransactionDate: string
  }
}

// ✅ Tipo para resposta da API (array com um item)
export type GetConsumoApiResponse = GetConsumoResponse[]

export const consumoApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getConsumo: builder.mutation<GetConsumoApiResponse, GetConsumoRequest>({
      query: (body) => ({
        url: '/api/processosauxiliares/nuageconsumo',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Consumo'],
    }),
  }),
})

// ✅ Hook gerado
export const { useGetConsumoMutation } = consumoApi
