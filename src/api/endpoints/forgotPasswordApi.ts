// src/api/endpoints/forgotPasswordApi.ts - Endpoints de esqueci minha senha

import { apiPlay } from '../apiPlay'

// ✅ Tipos baseados no código original do app-base-expo
interface RequestTokenRequest {
  tipoDeEnvio: 'email' | 'sms' | 'whatsapp'
  cpf: string
}

interface RequestTokenResponse {
  message?: string
  success?: boolean
}

interface ValidateTokenRequest {
  cpf: string
  tokenesquecisenha: string
}

interface ValidateTokenResponse {
  message?: string
  success?: boolean
}

interface ChangeForgotPasswordRequest {
  cpf: string
  password: string
}

interface ChangeForgotPasswordResponse {
  message?: string
  success?: boolean
}

// ✅ Injetar endpoints na API base
export const forgotPasswordApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // ✅ Endpoint para solicitar token (email/sms/whatsapp)
    requestPasswordToken: builder.mutation<
      RequestTokenResponse,
      RequestTokenRequest
    >({
      query: (data) => ({
        url: '/api/esqueciMinhaSenhaEmail',
        method: 'POST',
        data,
      }),
    }),

    // ✅ Endpoint para validar token de 6 dígitos
    validatePasswordToken: builder.mutation<
      ValidateTokenResponse,
      ValidateTokenRequest
    >({
      query: (data) => ({
        url: '/api/verificarTokenEsqueciSenha',
        method: 'POST',
        data,
      }),
    }),

    // ✅ Endpoint para alterar senha após validação do token
    changePasswordByToken: builder.mutation<
      ChangeForgotPasswordResponse,
      ChangeForgotPasswordRequest
    >({
      query: (data) => ({
        url: '/api/alterarSenhaPeloEmail',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

// ✅ Export dos hooks gerados automaticamente
export const {
  useRequestPasswordTokenMutation,
  useValidatePasswordTokenMutation,
  useChangePasswordByTokenMutation,
} = forgotPasswordApi
