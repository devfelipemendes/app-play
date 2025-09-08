// app/index.tsx
import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'

import * as SecureStore from 'expo-secure-store'

export default function Index() {
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    checkToken()
  }, [])

  const checkToken = async () => {
    try {
      // Verifica se existe um token salvo no SecureStore
      const token = await SecureStore.getItemAsync('token')

      if (token) {
        setHasToken(true)
      } else {
        setHasToken(false)
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      setHasToken(false)
    }
  }

  // Redireciona baseado na presença do token
  if (hasToken) {
    return <Redirect href="/(tabs)/(home)" />
  }

  return <Redirect href="/(auth)/entrar" />
}
