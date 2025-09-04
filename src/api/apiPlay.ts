// src/store/api/AuthApi.ts - Base API
import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from './Axios'

// ✅ API Service base com RTK Query
export const apiPlay = createApi({
  reducerPath: 'apiPlay',
  baseQuery: axiosBaseQuery({
    baseUrl: '', // A URL base já está no axiosInstance
  }),
  tagTypes: ['User', 'Company', 'CheckCpf'], // Para cache invalidation
  endpoints: () => ({}), // Endpoints vazios - serão injetados
})
