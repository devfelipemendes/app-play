// store/plansApi.ts
import { apiPlay } from '../apiPlay'

interface Plan {
  planid: number | string
  descricao: string
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
}

interface ResponseBuscaPlanos {
  Original: Plan[]
  personalizado: Plan[]
}

interface PayloadBuscaPlanos {
  parceiro: string
  token: string | Blob | undefined
  userInfo: string
  iccid: string
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
      query: (payload) => ({
        url: '/api/planos/visualizar',
        method: 'POST',
        body: payload,
      }),
      providesTags: ['Plans'],
    }),

    // Endpoint para ativar linha (comprar plano)
    activateLine: builder.mutation<ResponseActiveLine, ActiveLineBody>({
      query: (payload) => ({
        url: '/api/ativacao/ativar',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Plans'],
    }),
  }),
})

export const {
  useGetPlansQuery,
  useLazyGetPlansQuery,
  useActivateLineMutation,
} = plansAPI
