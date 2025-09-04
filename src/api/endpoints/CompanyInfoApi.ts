// src/store/api/companyApi.ts - Usando injectEndpoints

import { apiPlay } from '../apiPlay'

// ✅ Tipos para o endpoint da empresa
export interface CompanyInfoRequest {
  token: string
  companyid: number
  app: string
}

export interface CompanyInfoResponse {
  companyId: number
  companyname: string
  cnpj: string
  tradename: string
  nomeparceiro: string
  email: string
  celular: string
  telefone: string | null
  cep: string
  endereco: string
  numeroendereco: string
  complemento: string | null
  bairro: string
  inscricaomunicipal: string | null
  inscricaoestadual: string
  observacoes: string | null
  walletid: string
  link_playstore: string
  link_appstore: string
  link_website: string
  link_chat: string
  pospago: boolean
  link_contrato: string
  consultor: string
  appTheme: string // JSON string com tema
  appversion: string
  mvnoparent: string | null
  mvnoparentid: string | null
  logotipo: string
  token: string
}

// ✅ Injetar endpoint na API existente
export const companyApiExtended = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Buscar informações da empresa
    getCompanyInfo: builder.query<CompanyInfoResponse, CompanyInfoRequest>({
      query: (params) => ({
        url: '/api/consultaempresaApp',
        method: 'POST',
        data: params,
      }),
      providesTags: ['Company'],
    }),
  }),
})

export const {
  useGetCompanyInfoQuery,
  useLazyGetCompanyInfoQuery: useLazyGetCompanyInfoQueryNew,
} = companyApiExtended
