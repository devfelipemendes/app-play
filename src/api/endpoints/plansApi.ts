// store/plansApi.ts
import { apiPlay } from '../apiPlay'
import type { Fatura } from './faturaApi'

interface PlanOriginal {
  id: number
  planid: number | string
  description: string // ✅ API usa 'description' não 'descricao'
  bundle: number | string
  value: string
  qtdvideos?: number | null
  gigas: string
  min: string
  sms: string
  valor_surf?: string
  modelo?: string
  tipo?: string
  parceiro?: string
  valor_infiniti?: string
  descricao_infiniti?: string
  created_at?: string
  updated_at?: string
  mostraApp?: boolean
  nivel?: number | null
  identificador?: string | null
  campanha?: string | null
  franquiaid?: string | null
  mostraappfranquia?: boolean | null
  rede?: string
  productid?: string | null
  hlr_profile?: number | null
  valor_telecall?: string | null
}
export interface PlanPersonalizado {
  id: number
  planid: number | string
  description: string // ✅ API usa 'description' não 'descricao'
  bundle: number | string
  value: string
  qtdvideos?: number | null
  gigas: string
  min: string
  sms: string
  valor_surf?: string
  modelo?: string
  tipo?: string
  parceiro?: string
  valor_infiniti?: string
  descricao_infiniti?: string
  created_at?: string
  updated_at?: string
  mostraApp?: boolean
  nivel?: number | null
  identificador?: string | null
  campanha?: string | null
  franquiaid?: string | null
  mostraappfranquia?: boolean | null
  rede?: string
  productid?: string | null
  hlr_profile?: number | null
  valor_telecall?: string | null
}

interface ResponseBuscaPlanos {
  Original: PlanOriginal[]
  personalizado: PlanPersonalizado[]
}

interface PayloadBuscaPlanos {
  companyid: number
}

interface ActiveLineBody {
  cpf: string
  ddd: string
  iccid: string
  planid: string
  planid_personalizado: string
  isApp: boolean
  pospago: boolean
  userInfo: string
  esim: boolean
  companyid: number
}

export interface ResponseActiveLine {
  fatura: Fatura
  msg: string
}

interface AdditionalPlan {
  id: number | string
  descricao: string
  value: string
  gigas?: string
  min?: string
  sms?: string
  mostraApp?: boolean
}

interface ResponseGetAdditionalPlans {
  personalizado: AdditionalPlan[]
}

interface PayloadGetAdditionalPlans {
  token: string
  parceiro: string
}

interface PayloadAdditionalRecharge {
  token: string
  planid_pers: number | string
  msisdn: string
}

interface ResponseAdditionalRecharge {
  payid?: string
  msg: string
}

interface PayloadChangePlan {
  token: string
  planid: number | string
  planid_personalizado: string
  msisdn: string
}

interface ResponseChangePlan {
  fatura?: string
  msg: string
}

interface PayloadReactivateLine {
  token: string
  userInfo: string // JSON string: {cpf, name, parceiro}
  planid: number | string
  planid_personalizado?: string
  iccid: string
  cpfuser: string | undefined
}

interface ResponseReactivateLine {
  msg: string
  fatura?: string
}

const plansAPI = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ResponseBuscaPlanos, PayloadBuscaPlanos>({
      query: (payload) => ({
        url: '/api/app/planos/visualizar',
        method: 'POST',
        data: payload,
      }),
      providesTags: ['Plans'],
    }),

    // Endpoint para ativar linha (comprar plano)
    activateLine: builder.mutation<ResponseActiveLine, ActiveLineBody>({
      query: (payload) => ({
        url: '/api/app/ativacao/ativar',
        method: 'POST',
        data: payload, // ✅ Mudança: 'data' em vez de 'body' (axios)
      }),
      invalidatesTags: ['Plans', 'UserLines'], // Invalida também UserLines para atualizar lista
    }),

    // Endpoint para buscar planos adicionais
    getAdditionalPlans: builder.query<
      ResponseGetAdditionalPlans,
      PayloadGetAdditionalPlans
    >({
      query: (payload) => ({
        url: '/api/planos/adicional/visualiza',
        method: 'POST',
        data: payload,
      }),
      transformResponse: (response: any) => {
        // Retornar apenas os planos adicionais que devem aparecer no app
        const personalizado = (response.personalizado || []).filter(
          (plan: AdditionalPlan) => plan.mostraApp === true,
        )
        return { personalizado }
      },
      providesTags: ['Plans'],
    }),

    // Endpoint para realizar recarga adicional
    additionalRecharge: builder.mutation<
      ResponseAdditionalRecharge,
      PayloadAdditionalRecharge
    >({
      query: (payload) => ({
        url: '/api/recarga/adicional',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['UserLines', 'Faturas'], // Invalida linhas e faturas após recarga
    }),

    // Endpoint para alterar plano
    changePlan: builder.mutation<ResponseChangePlan, PayloadChangePlan>({
      query: (payload) => ({
        url: '/api/mudaplano',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['UserLines', 'Plans', 'Faturas'], // Invalida linhas, planos e faturas após mudança
    }),

    // Endpoint para reativar linha (statusplan = 'EX')
    reactivateLine: builder.mutation<
      ResponseReactivateLine,
      PayloadReactivateLine
    >({
      query: (payload) => ({
        url: '/api/reativar/linha',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['UserLines', 'Plans', 'Faturas'], // Invalida linhas, planos e faturas após reativação
    }),
  }),
})

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useActivateLineMutation,
  useGetAdditionalPlansQuery,
  useLazyGetAdditionalPlansQuery,
  useAdditionalRechargeMutation,
  useChangePlanMutation,
  useReactivateLineMutation,
} = plansAPI
