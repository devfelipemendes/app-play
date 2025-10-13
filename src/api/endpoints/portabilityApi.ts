// src/api/endpoints/portabilityApi.ts
import { apiPlay } from '../apiPlay'

export interface PortabilityStatus {
  Name: string
  PortabilityStatus: 'SUCESSO' | 'PENDENTE' | 'FALHA' | 'CANCELADO' | 'CONFLITO'
  iccid: string
  msisdn: number
  MsisdnOutraOperadora: number
  Criado: string
  JanelaPortabilidade: string
  AutorizadoCliente: string
}

interface PayloadGetPortabilityStatus {
  token: string
  codigoP?: string
  msisdn?: string
  msisdnOutraOperadora?: string
}

interface PayloadGetOperadora {
  token: string
  phoneNumber: string
}

interface ResponseGetOperadora {
  cod: string
  name: string
}

interface PayloadRequestPortability {
  token: string
  msisdn: string // Número da linha atual (sem 55)
  pmsisdn: string // Número a portar
  operadora: string // Código da operadora
}

interface ResponseRequestPortability {
  message?: string
  success?: boolean
}

const portabilityAPI = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint para consultar status da portabilidade
    getPortabilityStatus: builder.query<
      PortabilityStatus,
      PayloadGetPortabilityStatus
    >({
      query: (payload) => ({
        url: '/api/portabilidade/consultar',
        method: 'POST',
        data: payload,
      }),
      providesTags: ['Portability'],
    }),

    // Endpoint para buscar operadora do número
    getOperadora: builder.query<ResponseGetOperadora, PayloadGetOperadora>({
      query: ({ token, phoneNumber }) => ({
        url: `/apiconsulta/${token}/${phoneNumber}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Certifique-se de que res seja uma string
        const str = response.toString()

        if (str.includes('|')) {
          const [cod, name] = str.split('|').map((part: string) => part.trim())
          return {
            cod: cod === '00000' ? '' : cod,
            name,
          }
        } else {
          return {
            name: '',
            cod: str,
          }
        }
      },
    }),

    // Endpoint para solicitar portabilidade
    requestPortability: builder.mutation<
      ResponseRequestPortability,
      PayloadRequestPortability
    >({
      query: (payload) => ({
        url: '/api/portabilidade/portin',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['Portability', 'UserLines'],
    }),
  }),
})

export const {
  useGetPortabilityStatusQuery,
  useLazyGetPortabilityStatusQuery,
  useGetOperadoraQuery,
  useLazyGetOperadoraQuery,
  useRequestPortabilityMutation,
} = portabilityAPI
