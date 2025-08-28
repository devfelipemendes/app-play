import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

// ✅ Configuração do Axios com environment
const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Interceptors para logs e tratamento de erro global
axiosInstance.interceptors.request.use(
  (config) => {
    if (env.DEBUG) {
      console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (env.DEBUG) {
      console.log('✅ Response:', response.status, response.config.url)
    }
    return response
  },
  (error) => {
    if (env.DEBUG) {
      console.error(
        '❌ Response Error:',
        error.response?.status,
        error.response?.data,
      )
    }
    return Promise.reject(error)
  },
)

// ✅ BaseQuery personalizado para RTK Query
const axiosBaseQuery =
  (
    { baseUrl }: { baseUrl: string } = { baseUrl: '' },
  ): BaseQueryFn<
    {
      url: string
      method?: AxiosRequestConfig['method']
      data?: AxiosRequestConfig['data']
      params?: AxiosRequestConfig['params']
      headers?: AxiosRequestConfig['headers']
    },
    unknown,
    unknown
  > =>
  async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      })

      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError

      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
          message: err.message,
        },
      }
    }
  }

export default axiosBaseQuery
export { axiosInstance }
