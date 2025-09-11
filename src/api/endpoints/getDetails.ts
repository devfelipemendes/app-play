// services/apiPlay.ts
import { apiPlay } from '../apiPlay'

// ✅ Tipos para request
export interface Det2Request {
  atualizadet: 'SIM' | 'NAO'
  iccid: string
  parceiro: string | undefined
  token: string | undefined
  userInfo: string // JSON string
}

// ✅ Tipos para response
export interface Det2Response {
  msisdn: string
  iccid: string
  cpf: string
  operadora: string
  statusplan: string
  statuschip: string
  plano: string
  tipodeplano: boolean
  fimplano: string
  portin: string
  minutos: string
  dados: string
  smsrestante: string
  minutosoriginal: string
  dadosoriginal: string
  smsoriginal: string
  atualizado: string
  criado: string
  revendedor: string | null
  statuscontrato: string
  pospagotroca: string
  esim: boolean
  rede: string
}

export const det2Api = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getDet2: builder.mutation<Det2Response, Det2Request>({
      query: (body) => ({
        url: '/api/det2',
        method: 'POST',
        data: body,
      }),
    }),
  }),
})

// ✅ Hook gerado
export const { useGetDet2Mutation } = det2Api
