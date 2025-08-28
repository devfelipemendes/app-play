import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from '../Axios'

// ✅ Tipos baseados no código original
interface LoginRequest {
  cpf: string
  password: string
  expoPushToken?: string
  modelName?: string
  companyid: number
  latitude: string
  longitude: string
  acao_realizada: string
  tipo_login: string
}

interface LoginResponse {
  profileid: number
  cpf: string
  name: string
  token: string
  parceiro: string
  primeiroAcesso?: boolean
  [key: string]: any
}

interface CompanyInfoRequest {
  companyid: number
  token: string
  app: string
}

interface CompanyInfoResponse {
  companyId: number
  companyname: string
  appTheme: string
  appversion: string
  logotipo?: string
  link_playstore?: string
  link_appstore?: string
  link_chat?: string
  [key: string]: any
}

interface ForgotPasswordRequest {
  cpf: string
}

interface ChangePasswordRequest {
  token: string
  cpf: string
  password: string
}

// ✅ API Service com RTK Query
export const apiPlay = createApi({
  reducerPath: 'apiPlay',
  baseQuery: axiosBaseQuery({
    baseUrl: '', // A URL base já está no axiosInstance
  }),
  tagTypes: ['User', 'Company'], // Para cache invalidation
  endpoints: (builder) => ({
    // ✅ Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials: any) => ({
        url: '/api/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // ✅ Company info endpoint
    getCompanyInfo: builder.query<CompanyInfoResponse, CompanyInfoRequest>({
      query: (params: any) => ({
        url: '/api/consultaempresaApp',
        method: 'POST',
        data: params,
      }),
      providesTags: ['Company'],
    }),

    // ✅ Forgot password endpoint
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (data: any) => ({
        url: '/api/esqueciMinhaSenha',
        method: 'POST',
        data,
      }),
    }),

    // ✅ Change password endpoint
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data: any) => ({
        url: '/api/alterarsenha',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// ✅ Export dos hooks gerados automaticamente
export const {
  useLoginMutation,
  useGetCompanyInfoQuery,
  useLazyGetCompanyInfoQuery,
  useForgotPasswordMutation,
  useChangePasswordMutation,
} = apiPlay
