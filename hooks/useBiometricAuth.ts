import { useState, useEffect } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

const CREDENTIALS_KEY = '@biometric_credentials'

interface BiometricCredentials {
  cpf: string
  password: string
}

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false)
  const [biometricType, setBiometricType] = useState<string | null>(null)
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false)

  useEffect(() => {
    checkBiometricSupport()
    checkStoredCredentials()
  }, [])

  // Verifica se o dispositivo suporta biometria
  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      const enrolled = await LocalAuthentication.isEnrolledAsync()

      setIsBiometricSupported(compatible && enrolled)

      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

        // Identifica o tipo de biometria
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType(Platform.OS === 'ios' ? 'Face ID' : 'Reconhecimento Facial')
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType(Platform.OS === 'ios' ? 'Touch ID' : 'Digital')
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('Íris')
        } else {
          setBiometricType('Biometria')
        }
      }
    } catch (error) {
      console.error('Erro ao verificar suporte biométrico:', error)
      setIsBiometricSupported(false)
    }
  }

  // Verifica se há credenciais salvas
  const checkStoredCredentials = async () => {
    try {
      const stored = await AsyncStorage.getItem(CREDENTIALS_KEY)
      setHasStoredCredentials(!!stored)
    } catch (error) {
      console.error('Erro ao verificar credenciais salvas:', error)
      setHasStoredCredentials(false)
    }
  }

  // Salva credenciais após login bem-sucedido
  const saveCredentials = async (cpf: string, password: string): Promise<boolean> => {
    try {
      const credentials: BiometricCredentials = { cpf, password }
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
      setHasStoredCredentials(true)
      return true
    } catch (error) {
      console.error('Erro ao salvar credenciais:', error)
      return false
    }
  }

  // Remove credenciais salvas
  const removeCredentials = async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY)
      setHasStoredCredentials(false)
      return true
    } catch (error) {
      console.error('Erro ao remover credenciais:', error)
      return false
    }
  }

  // Autentica com biometria e retorna as credenciais
  const authenticateWithBiometric = async (): Promise<BiometricCredentials | null> => {
    try {
      // Verifica se há credenciais salvas
      const storedData = await AsyncStorage.getItem(CREDENTIALS_KEY)
      if (!storedData) {
        console.log('Nenhuma credencial salva')
        return null
      }

      // Solicita autenticação biométrica
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Autentique-se com ${biometricType || 'biometria'}`,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false,
      })

      if (result.success) {
        const credentials: BiometricCredentials = JSON.parse(storedData)
        return credentials
      }

      return null
    } catch (error) {
      console.error('Erro na autenticação biométrica:', error)
      return null
    }
  }

  return {
    isBiometricSupported,
    biometricType,
    hasStoredCredentials,
    saveCredentials,
    removeCredentials,
    authenticateWithBiometric,
    checkStoredCredentials,
  }
}
