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
  companyId: number
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

const plansAPI = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ResponseBuscaPlanos, PayloadBuscaPlanos>({
      query: (payload) => {
        console.log('🎯 plansApi.ts - Payload recebido:', payload)
        console.log('🎯 plansApi.ts - companyId:', payload.companyId)

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
  }),
})

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useActivateLineMutation,
} = plansAPI
