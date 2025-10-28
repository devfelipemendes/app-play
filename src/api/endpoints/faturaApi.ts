// src/api/endpoints/faturaApi.ts
import { apiPlay } from '../apiPlay'

// ========================================
// 📄 TIPOS PARA FATURA DETALHADA (ASAAS)
// ========================================

// ✅ Request para buscar fatura detalhada
export interface GetFaturaRequest {
  payid: string
}

// ✅ Response da fatura detalhada (Asaas)
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
// eslint-disable-next-line
export interface GetFaturaResponse extends FaturaDetalhada {}

// ========================================
// 📋 TIPOS PARA LISTAR FATURAS
// ========================================

// ✅ Request para listar faturas
export interface ListarFaturasRequest {
  token: string
  parametro: string // ICCID da linha selecionada
}

// ✅ Tipo de cada fatura na listagem
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

// ✅ Response da listagem de faturas
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

// ========================================
// 🔌 ENDPOINTS UNIFICADOS
// ========================================

export const faturaApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // 📄 Buscar fatura detalhada (Asaas)
    getFatura: builder.mutation<GetFaturaResponse, GetFaturaRequest>({
      query: (body) => ({
        url: '/api/asaasfatura',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Fatura'],
    }),

    // 📋 Listar faturas de uma linha
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

// ✅ Hooks gerados
export const {
  useGetFaturaMutation,
  useListarFaturasQuery,
  useLazyListarFaturasQuery,
} = faturaApi
