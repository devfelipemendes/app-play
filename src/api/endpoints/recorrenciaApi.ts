import { apiPlay } from '../apiPlay'

// ============ Types ============

export interface Cartao {
  id: string
  cartão: string // ID do cartão
  bandeira: string // visa, mastercard, amex, etc
  final: string // últimos 4 dígitos
  nome: string
  principal?: boolean
  ordem?: number
}

export interface ListaCartoesRequest {
  cpf: string
  companyid: number
  msisdn: string
}

export interface ListaCartoesResponse {
  status: string
  cartoes: Cartao[]
}

export interface CadastraCartaoRequest {
  name: string
  cpf: string
  numerocartao: string
  expirames: string
  expiraano: string
  ccv: string
  email: string
  telefone?: string
  cep: string
  endereco: string
  card_id: number
  cpfcartao: string
  vencimento?: string // Para conta fatura
}

export interface CadastraCartaoResponse {
  status: string
  message: string
  card_id?: string
}

export interface StatusRecorrenciaRequest {
  cpf: string
  statusrec: boolean
  msisdn: string
}

export interface StatusRecorrenciaResponse {
  status: string
  message: string
}

export interface AlteraCartoesRequest {
  token: string
  card1?: string
  card2?: string
  card3?: string
  cpf: string
}

export interface AlteraCartoesResponse {
  status: string
  message: string
}

// ============ API Endpoints ============

export const recorrenciaApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // Lista cartões cadastrados
    listaCartoes: builder.mutation<ListaCartoesResponse, ListaCartoesRequest>({
      query: (body) => ({
        url: '/api/recorrencia/listaCartoes',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Recorrencia'],
    }),

    // Cadastra novo cartão
    cadastraCartao: builder.mutation<CadastraCartaoResponse, CadastraCartaoRequest>({
      query: (body) => ({
        url: '/api/recorrencia/cadastraCartao',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Recorrencia', 'Fatura'],
    }),

    // Ativa ou desativa recorrência
    statusRecorrencia: builder.mutation<StatusRecorrenciaResponse, StatusRecorrenciaRequest>({
      query: (body) => ({
        url: '/api/recorrencia/statusrecorrencia',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Recorrencia', 'Fatura'],
    }),

    // Altera ordem dos cartões
    alteraCartoes: builder.mutation<AlteraCartoesResponse, AlteraCartoesRequest>({
      query: (body) => ({
        url: '/api/recorrencia/alteraCartoes',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['Recorrencia'],
    }),
  }),
})

export const {
  useListaCartoesMutation,
  useCadastraCartaoMutation,
  useStatusRecorrenciaMutation,
  useAlteraCartoesMutation,
} = recorrenciaApi
