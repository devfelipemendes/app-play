// src/api/endpoints/faturaApi.ts
import { apiPlay } from '../apiPlay'

// ✅ Tipos para request
export interface GetFaturaRequest {
  payid: string
}

// ✅ Tipos para response da fatura
export interface FaturaDetalhada {
  nome: string
  cpf: string
  nomeempresa: string
  parceiro: string
  cnpj: string
  email: string
  msisdn: string
  planid: number
  plandescription: string
  planvalue: string
  invoiceNumber: string
  value: number
  dueDate: string
  description: string
  customer: string
  status: string
  id: string
  codigoboleto: string
  barcode: string
  encodedimage: string
  payload: string
  logo: string
  contafatura: string | null
  revendedor: string | null
  link: string
  payment: string
  companyid: number
}

// ✅ Response do endpoint
export interface GetFaturaResponse extends FaturaDetalhada {}

export const faturaApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getFatura: builder.mutation<GetFaturaResponse, GetFaturaRequest>({
      query: (body) => ({
        url: '/api/asaasfatura',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Fatura'],
    }),
  }),
})

// ✅ Hooks gerados
export const { useGetFaturaMutation } = faturaApi
