import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: any | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: any }>,
    ) => {
      state.isAuthenticated = true
      state.token = action.payload.token
      state.user = action.payload.user
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.token = null
      state.user = null
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
