import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'

import companyReducer from './slices/companySlice'
import screenFlowReducer from './slices/screenFlowSlice'
import { apiPlay } from '../api/apiPlay'
import AtivalinhaReducer from './slices/ativarLinhaSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    company: companyReducer,
    screenFlow: screenFlowReducer,
    ativarLinha: AtivalinhaReducer,
    [apiPlay.reducerPath]: apiPlay.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiPlay.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
