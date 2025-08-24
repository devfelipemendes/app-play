import { Stack } from 'expo-router'
import { Provider } from 'react-redux'
import { store } from '../src/store'

// Importar Reactotron em desenvolvimento
// if (__DEV__) {
//   import('../src/services/ReactotronConfig')
// }

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </Provider>
  )
}
