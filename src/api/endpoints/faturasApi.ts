// src/api/endpoints/faturasApi.ts
import { apiPlay } from '../apiPlay'

// ✅ Tipos para request
export interface ListarFaturasRequest {
  token: string
  parametro: string // ICCID da linha selecionada
}

// ✅ Tipos para cada fatura
export interface Fatura {
  paymentid: number
  msisdnid: number
  paymenttypeid: number
  paymentstatus: number
  created: string
  paymentasaasid: string
  invoiceurl: string
  paid: string
  valuetopup: string
  tipo: string
  adicionalid: number | null
  planid: string
  invoicenumber: string
  nossonumero: string
  netvalue: string
  bankslipurl: string
  split: string
  transactionreceipturl: string | null
  atualizadoem: string | null
  save: string
  statussplitparceiro: string | null
  recarga: string
  tentativas: number | null
  termo_aceite: boolean
  deactivated: boolean
  days_deactivated: number
  id_contafatura: number | null
  unificar: string | null
}

// ✅ Tipos para response
export interface ListarFaturasResponse {
  success: boolean
  message: string
  data: {
    msisdn: string
    iccid: string
    rede: string
    faturas: Fatura[]
  }
}

export const faturasApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    listarFaturas: builder.query<ListarFaturasResponse, ListarFaturasRequest>({
      query: (body) => ({
        url: '/api/fatura/listar',
        method: 'POST',
        data: body,
      }),
      providesTags: ['Faturas'],
    }),
  }),
})

// ✅ Hook gerado
export const { useListarFaturasQuery, useLazyListarFaturasQuery } = faturasApi
