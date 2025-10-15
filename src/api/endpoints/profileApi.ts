// src/api/endpoints/profileApi.ts
import { apiPlay } from '../apiPlay'

interface PayloadDeleteAccount {
  token: string
  cpf: string
  profileid: string
}

interface PayloadDeleteLine {
  token: string
  iccid: string
}

interface ResponseDeleteAccount {
  message?: string
  success?: boolean
}

const profileApi = apiPlay.injectEndpoints({
  endpoints: (builder) => ({
    // Endpoint para deletar conta do usuário
    deleteAccount: builder.mutation<ResponseDeleteAccount, PayloadDeleteAccount>({
      query: (payload) => ({
        url: '/api/deleta',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['User'],
    }),

    // Endpoint para deletar linha do ICCID
    deleteLineByIccid: builder.mutation<ResponseDeleteAccount, PayloadDeleteLine>({
      query: (payload) => ({
        url: '/api/usuario/iccid',
        method: 'POST',
        data: payload,
      }),
      invalidatesTags: ['UserLines'],
    }),
  }),
})

export const { useDeleteAccountMutation, useDeleteLineByIccidMutation } =
  profileApi
