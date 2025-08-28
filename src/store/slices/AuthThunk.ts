import { createAsyncThunk } from '@reduxjs/toolkit'

import { env } from '@/config/env'
import type { RootState, AppDispatch } from '../index'
import { apiPlay } from '@/src/api/endpoints/AuthApi'

// ✅ Helper para dispatch de endpoints RTK
const createRTKThunk = <TRequest, TResponse>(
  typePrefix: string,
  endpoint: any,
) => {
  return createAsyncThunk<
    TResponse,
    TRequest,
    {
      state: RootState
      dispatch: AppDispatch
    }
  >(typePrefix, async (params: TRequest, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(endpoint(params))

      if ('error' in result) {
        return rejectWithValue(result.error)
      }

      return result.data as TResponse
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro na requisição')
    }
  })
}

// ✅ Company Info thunk
export const getCompanyInfo = createAsyncThunk(
  'auth/getCompanyInfo',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        apiPlay.endpoints.getCompanyInfo.initiate({
          companyid: env.COMPANY_ID,
          token: env.ACCESS_TK,
          app: 'reqtk',
        }),
      )

      if ('error' in result) {
        return rejectWithValue(
          'Não foi possível carregar as informações do app',
        )
      }

      return result.data
    } catch (error: any) {
      console.error('Error getting company info:', error)
      return rejectWithValue('Não foi possível carregar as informações do app')
    }
  },
)

// ✅ Login thunk
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    {
      cpf,
      password,
      latitude,
      longitude,
      acao_realizada,
      tipo_login,
      expoPushToken,
      modelName,
    }: {
      cpf: string
      password: string
      latitude: string
      longitude: string
      acao_realizada: string
      tipo_login: string
      expoPushToken?: string
      modelName?: string
    },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const result = await dispatch(
        apiPlay.endpoints.login.initiate({
          cpf,
          password,
          expoPushToken,
          modelName,
          companyid: env.COMPANY_ID,
          latitude,
          longitude,
          acao_realizada,
          tipo_login,
        }),
      )

      if ('error' in result) {
        const error = result.error as any

        // Tratamento de erros específicos
        if (error.status === 550) {
          return rejectWithValue('Senha incorreta!')
        }
        if (error.status === 551) {
          return rejectWithValue('CPF/CNPJ não encontrado!')
        }

        return rejectWithValue('Erro ao logar!')
      }

      const userData = result.data

      // Verificação se perfil está excluído
      if (userData.profileid === 5) {
        return rejectWithValue('CPF/CNPJ não encontrado!')
      }

      return { userData, credentials: { cpf, password } }
    } catch (error: any) {
      console.error('Login error:', error)
      return rejectWithValue('Erro ao logar!')
    }
  },
)

// ✅ Forgot Password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (cpf: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        apiPlay.endpoints.forgotPassword.initiate({ cpf }),
      )

      if ('error' in result) {
        const error = result.error as any

        if (error.status === 501) {
          return rejectWithValue('Aguarde 5 minutos antes de tentar novamente!')
        }

        return rejectWithValue('Erro ao solicitar recuperação de senha!')
      }

      return 'Recuperação de senha solicitada!'
    } catch (error: any) {
      console.error('Forgot password error:', error)
      return rejectWithValue('Erro ao solicitar recuperação de senha!')
    }
  },
)

// ✅ Change Password thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    { newPassword, user }: { newPassword: string; user: any },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const result = await dispatch(
        apiPlay.endpoints.changePassword.initiate({
          token: user?.token,
          cpf: user?.cpf,
          password: newPassword,
        }),
      )

      if ('error' in result) {
        return rejectWithValue('Erro ao alterar senha!')
      }

      return 'Senha alterada com sucesso!'
    } catch (error: any) {
      console.error('Change password error:', error)
      return rejectWithValue('Erro ao alterar senha!')
    }
  },
)
