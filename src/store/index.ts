import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import { apiPlay } from '../api/endpoints/AuthApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    // ✅ Adicionar o apiPlay reducer
    [apiPlay.reducerPath]: apiPlay.reducer,
  },
  // ✅ Adicionar o middleware do RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // @ts-ignore
        ignoredActions: [apiPlay.util.getRunningQueriesThunk.fulfilled.type],
      },
    }).concat(apiPlay.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
