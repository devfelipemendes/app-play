import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '../index'
import Constants from 'expo-constants'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: Constants.expoConfig?.extra?.apiUrl || 'https://your-api.com/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState as () => RootState)().auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Content-Type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'Invoice', 'Service', 'Theme'],
  endpoints: () => ({}),
})
