import { baseApi } from './baseApi'
import { ThemeConfig } from '../../types/theme'

export const themeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getThemeConfig: builder.query<ThemeConfig, string>({
      query: (partnerId) => `/theme/${partnerId}`,
      providesTags: ['Theme'],
    }),
  }),
})

export const { useGetThemeConfigQuery } = themeApi
