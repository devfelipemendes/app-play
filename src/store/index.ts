import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'

import companyReducer from './slices/companySlice'
import screenFlowReducer from './slices/screenFlowSlice'
import { apiPlay } from '../api/apiPlay'
import AtivalinhaReducer from './slices/ativarLinhaSlice'
import det2Reducer from './slices/det2Slice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    company: companyReducer,
    screenFlow: screenFlowReducer,
    ativarLinha: AtivalinhaReducer,
    det2: det2Reducer,
    [apiPlay.reducerPath]: apiPlay.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configurações para melhor performance em dev
      serializableCheck: {
        // Ignora actions do RTK Query que podem ter dados não serializáveis
        ignoredActions: [
          'apiPlay/executeQuery/pending',
          'apiPlay/executeQuery/fulfilled',
          'apiPlay/executeMutation/pending',
          'apiPlay/executeMutation/fulfilled',
        ],
      },
    }).concat(apiPlay.middleware),
  // Habilita Redux DevTools apenas em desenvolvimento
  devTools: __DEV__,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
