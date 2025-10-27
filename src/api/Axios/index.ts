import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

// ✅ Configuração do Axios
const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// 🔍 Logger de requisições COMPLETO
const logRequest = (config: any) => {
  const { method, url, data, params, headers } = config
  const fullUrl = `${config.baseURL}${url}`

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log('🚀 REQUEST')
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log(`📍 Method: ${method?.toUpperCase()}`)
  console.log(`🔗 URL: ${fullUrl}`)
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
  console.log(`🆔 Request ID: ${Date.now()}`)

  if (params && Object.keys(params).length > 0) {
    console.log('🔍 Query Params:')
    console.log(JSON.stringify(params, null, 2))
  }

  if (headers && Object.keys(headers).length > 0) {
    console.log('📋 Headers:')
    const filteredHeaders = { ...headers }
    // Ocultar tokens sensíveis
    if (filteredHeaders.Authorization) {
      filteredHeaders.Authorization = '***HIDDEN***'
    }
    console.log(JSON.stringify(filteredHeaders, null, 2))
  }

  if (data) {
    console.log('📦 Request Body:')
    // Ocultar senhas no log
    const safeData = { ...data }
    if (safeData.password) safeData.password = '***HIDDEN***'
    if (safeData.senha) safeData.senha = '***HIDDEN***'
    console.log(JSON.stringify(safeData, null, 2))
  }

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
}

const logResponse = (response: any) => {
  const { status, data, config, headers } = response
  const fullUrl = `${config.baseURL}${config.url}`

  console.log('✅ RESPONSE')
  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
  console.log(`📍 Method: ${config.method?.toUpperCase()}`)
  console.log(`🔗 URL: ${fullUrl}`)
  console.log(`📊 Status: ${status} ${getStatusEmoji(status)}`)
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`)
  console.log(`⚡ Duration: ${calculateDuration(config)}ms`)

  if (headers && headers['content-type']) {
    console.log(`📄 Content-Type: ${headers['content-type']}`)
  }

  console.log('📦 Response Data:')
  if (typeof data === 'object' && data !== null) {
    const dataSize = JSON.stringify(data).length
    console.log(`   Size: ${formatBytes(dataSize)}`)

    // Limitar tamanho do log se muito grande
    if (dataSize > 10000) {
      console.log('   ⚠️ Response muito grande, mostrando preview...')
      console.log(JSON.stringify(data, null, 2).substring(0, 1000) + '...')
    } else {
      console.log(JSON.stringify(data, null, 2))
    }
  } else {
    console.log(data)
  }

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  )
}

// Helper functions
const getStatusEmoji = (status: number): string => {
  if (status >= 200 && status < 300) return '✅'
  if (status >= 300 && status < 400) return '🔄'
  if (status >= 400 && status < 500) return '⚠️'
  if (status >= 500) return '❌'
  return '❓'
}

const calculateDuration = (config: any): number => {
  if (config.metadata?.startTime) {
    return Date.now() - config.metadata.startTime
  }
  return 0
}

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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
    if (__DEV__) {
      logRequest(config)
    }
    return config
  },
  (error) => {
    if (__DEV__) {
      console.error('💥 Request Setup Error:', error)
    }
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      logResponse(response)
    }
    return response
  },
  (error) => {
    if (__DEV__) {
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
      if (__DEV__) {
        console.log('🔄 RTK Query iniciando requisição:', { url, method, data })
      }

      const result = await axiosInstance({
        url: baseUrl + url,
        method,
        data,
        params,
        headers,
      })

      // if (__DEV__) {
      //   console.log('✅ RTK Query sucesso:', result.data)
      // }

      return { data: result.data }
    } catch (axiosError) {
      const err = axiosError as AxiosError

      if (__DEV__) {
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
