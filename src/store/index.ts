import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import { apiPlay } from '../api/endpoints/AuthApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiPlay.reducerPath]: apiPlay.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiPlay.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
