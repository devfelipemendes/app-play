// import type { BaseQueryFn } from '@reduxjs/toolkit/query'
// import axios, { AxiosError, AxiosRequestConfig } from 'axios'
// import { env } from '@/config/env'

// // ✅ Configuração do Axios com environment
// const axiosInstance = axios.create({
//   baseURL: env.API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// // ✅ Interceptors para logs e tratamento de erro global
// axiosInstance.interceptors.request.use(
//   (config) => {
//     if (env.DEBUG) {
//       console.log('🚀 Request:', config.method?.toUpperCase(), config.url)
//     }
//     return config
//   },
//   (error) => {
//     console.error('❌ Request Error:', error)
//     return Promise.reject(error)
//   },
// )

// axiosInstance.interceptors.response.use(
//   (response) => {
//     if (env.DEBUG) {
//       console.log('✅ Response:', response.status, response.config.url)
//     }
//     return response
//   },
//   (error) => {
//     if (env.DEBUG) {
//       console.error(
//         '❌ Response Error:',
//         error.response?.status,
//         error.response?.data,
//       )
//     }
//     return Promise.reject(error)
//   },
// )

// // ✅ BaseQuery personalizado para RTK Query
// const axiosBaseQuery =
//   (
//     { baseUrl }: { baseUrl: string } = { baseUrl: '' },
//   ): BaseQueryFn<
//     {
//       url: string
//       method?: AxiosRequestConfig['method']
//       data?: AxiosRequestConfig['data']
//       params?: AxiosRequestConfig['params']
//       headers?: AxiosRequestConfig['headers']
//     },
//     unknown,
//     unknown
//   > =>
//   async ({ url, method = 'GET', data, params, headers }) => {
//     try {
//       const result = await axiosInstance({
//         url: baseUrl + url,
//         method,
//         data,
//         params,
//         headers,
//       })

//       return { data: result.data }
//     } catch (axiosError) {
//       const err = axiosError as AxiosError

//       return {
//         error: {
//           status: err.response?.status,
//           data: err.response?.data || err.message,
//           message: err.message,
//         },
//       }
//     }
//   }

// export default axiosBaseQuery
// export { axiosInstance }

import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

// ✅ Configuração do Axios
const axiosInstance = axios.create({
  baseURL: env.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 🔍 Logger de requisições COMPLETO
const logRequest = (config: any) => {
  const { method, url, data, headers } = config

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log('🚀 REQUEST')
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log(`📍 URL: ${method?.toUpperCase()} ${config.baseURL}${url}`)
  console.log('⏰ Timestamp:', new Date().toISOString())

  if (headers) {
    console.log('📋 Headers:')
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`)
    })
  }

  if (data) {
    console.log('📦 Request Body:')
    console.log(JSON.stringify(data, null, 2))
  }

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
}

const logResponse = (response: any) => {
  const { status, data, config } = response

  console.log('✅ RESPONSE')
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log(`📍 URL: ${config.method?.toUpperCase()} ${config.url}`)
  console.log(`📊 Status: ${status}`)
  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log('📦 Response Data:')
  console.log(JSON.stringify(data, null, 2))
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
}

const logError = (error: any) => {
  console.log('❌ ERROR')
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )

  if (error.response) {
    console.log(
      `📍 URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
    )
    console.log(`📊 Status: ${error.response.status}`)
    console.log('📦 Error Data:')
    console.log(JSON.stringify(error.response.data, null, 2))
  } else if (error.request) {
    console.log('🌐 Network Error - Sem resposta do servidor')
    console.log('📍 URL:', error.config?.url)
    console.log('📋 Request:', error.request)
  } else {
    console.log('💥 Erro na configuração:', error.message)
  }

  console.log('⏰ Timestamp:', new Date().toISOString())
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
}

// ✅ Interceptors melhorados
axiosInstance.interceptors.request.use(
  (config) => {
    if (env.DEBUG || __DEV__) {
      logRequest(config)
    }
    return config
  },
  (error) => {
    if (env.DEBUG || __DEV__) {
      console.error('💥 Request Setup Error:', error)
    }
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (env.DEBUG || __DEV__) {
      logResponse(response)
    }
    return response
  },
  (error) => {
    if (env.DEBUG || __DEV__) {
      logError(error)
    }
    return Promise.reject(error)
  },
)

// ✅ BaseQuery com logs RTK Query
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
      // RTK Query log
      if (env.DEBUG || __DEV__) {
        console.log('🔄 RTK Query iniciando requisição:', { url, method, data })
      }

      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      })

      if (env.DEBUG || __DEV__) {
        console.log('✅ RTK Query sucesso:', result.data)
      }

      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError

      if (env.DEBUG || __DEV__) {
        console.log('❌ RTK Query erro:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        })
      }

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
