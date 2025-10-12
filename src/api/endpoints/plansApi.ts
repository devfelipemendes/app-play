// store/plansApi.ts
import { apiPlay } from '../apiPlay'

interface Plan {
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
  Original: Plan[]
  personalizado: Plan[]
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
  pospago: string
  userInfo: string
}

interface ResponseActiveLine {
  fatura: string
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

const plansAPI = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ResponseBuscaPlanos, PayloadBuscaPlanos>({
      query: (payload) => {
        console.log('🎯 plansApi.ts - Payload recebido:', payload)
        console.log('🎯 plansApi.ts - companyId:', payload.companyid)

        return {
          url: '/api/app/planos/visualizar',
          method: 'POST',
          data: payload,
        }
      },
      providesTags: ['Plans'],
    }),

    // Endpoint para ativar linha (comprar plano)
    activateLine: builder.mutation<ResponseActiveLine, ActiveLineBody>({
      query: (payload) => ({
        url: '/api/ativacao/ativar',
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
  }),
})

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useActivateLineMutation,
  useGetAdditionalPlansQuery,
  useLazyGetAdditionalPlansQuery,
  useAdditionalRechargeMutation,
} = plansAPI
