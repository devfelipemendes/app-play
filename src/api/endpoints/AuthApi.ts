// src/store/api/authEndpoints.ts - Endpoints principais

import { apiPlay } from '../apiPlay'

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

// ✅ Injetar endpoints na API base
export const authApiExtended = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Login endpoint
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // ✅ Company info endpoint
    getCompanyInfo: builder.query<CompanyInfoResponse, CompanyInfoRequest>({
      query: (params) => ({
        url: '/api/consultaempresaApp',
        method: 'POST',
        data: params,
      }),
      providesTags: ['Company'],
    }),

    // ✅ Forgot password endpoint
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/api/esqueciMinhaSenha',
        method: 'POST',
        data,
      }),
    }),

    // ✅ Change password endpoint
    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (data) => ({
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
} = authApiExtended
