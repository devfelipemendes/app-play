import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ThemeConfig } from '../../types/theme'

interface ThemeState extends Partial<ThemeConfig> {
  isLoaded: boolean
}

const initialState: ThemeState = {
  partner_id: 'default',
  primary_color: '#007AFF',
  secondary_color: '#5856D6',
  brand_name: 'Telecom App',
  isLoaded: false,
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeConfig>) => {
      return { ...action.payload, isLoaded: true }
    },
  },
})

export const { setTheme } = themeSlice.actions
export default themeSlice.reducer
