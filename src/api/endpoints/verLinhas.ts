// src/api/endpoints/getUserLines.ts
import { apiPlay } from '../apiPlay'

// ✅ Tipos para request
export interface GetUserLinesRequest {
  parceiro: string
  token: string
  cpf: string
  franquiado: number
  isApp: boolean
  usuario_atual: string
}

// ✅ Tipos para response (baseado no JSON que você enviou)
export interface UserLine {
  id: number
  msisdn: string
  iccid: string
  parceiro: string
  cnpj: string
  cpf: string
  plandescription: string
  portability: number
  customerid: number
  name: string
  email: string
  userid: number
  companyid: number
  asaasid: string
  planid: number
  ddd: string
  personid: number
  cellphone: string
  portabilitystatus: string
  msisdnid: number
  planvalue: string
  bundleexpiry: string
  faturaaberta: null | any
  msisdnstatus: number
  push: string
  image: null | string
  msisdnultimo: null | string
  createdline: string | null
  planid_personalizado: string
  whatsapp: string
  contafatura: null | any
  tempmsisdn: null | string
  nome_linha: null | string
  departamento: null | string
  porcentagemrevenda: null | number
  card1: null | any
  revendedor: null | string
  revendedordata: string
  porcentagemrecarga: null | number
  porcentagemativacao: null | number
  pospago: boolean
  valorfixoporativacao: null | number
  valorfixoporrecarga: null | number
  parentcompany: null | string
  customerid_telecall: string
  accountid_telecall: string
  rede: string
  msisdn_telecall: null | string
  subscription_id: null | string
  airtime: boolean
  limite_airtime: null | number
  profileid: number
  recorrencia_airtime: boolean
  id_indicacao: null | any
  det: boolean
  protocolo: string
  cp: string
  satendimento: number
  esim: boolean
}

export type GetUserLinesResponse = UserLine[]

export const getUserLinesApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getUserLines: builder.mutation<GetUserLinesResponse, GetUserLinesRequest>({
      query: (body) => ({
        url: '/api/ver', // ⚠️ VOCÊ PRECISA INFORMAR A URL CORRETA AQUI
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['UserLines'],
    }),
  }),
})

// ✅ Hook gerado
export const { useGetUserLinesMutation } = getUserLinesApi
